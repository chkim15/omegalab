import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { solveMathProblem, analyzeImageProblem } from "./services/openai";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations = await storage.getConversationsByUserId(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversationData = insertConversationSchema.parse({
        ...req.body,
        userId,
      });
      
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  // Message routes
  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }
      
      const messages = await storage.getMessagesByConversationId(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Math solving route
  app.post("/api/solve", isAuthenticated, async (req, res) => {
    try {
      const { problem, inputMethod = "text", mode = "answer", conversationId } = req.body;
      
      if (!problem || !conversationId) {
        return res.status(400).json({ message: "Problem and conversation ID are required" });
      }

      // First, store the user's message
      const userMessage = await storage.createMessage({
        conversationId: parseInt(conversationId),
        role: "user",
        content: problem,
        metadata: { inputMethod }
      });

      // Solve the problem
      const solution = await solveMathProblem(problem, inputMethod, mode);
      
      // Format the response with better math notation
      const formatMathText = (text: any) => {
        if (typeof text !== 'string') {
          text = String(text || '');
        }
        // Clean up the text and add proper spacing
        return text
          .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between letters and numbers
          .replace(/(\d)([a-zA-Z])/g, '$1$2') // Keep number-letter together for variables like 2x
          .replace(/x\^2/g, '$x^2$')
          .replace(/x\^(\d+)/g, '$x^{$1}$')
          .replace(/(\d+)x/g, '$1x$')
          .replace(/\+\s*(\d+)x/g, ' + $1x')
          .replace(/\-\s*(\d+)x/g, ' - $1x')
          .replace(/=\s*0/g, ' = 0')
          .replace(/x\s*=\s*([^,\s\n]+)/g, '$x = $1$')
          .replace(/√(\d+)/g, '$\\sqrt{$1}$')
          .replace(/√\(([^)]+)\)/g, '$\\sqrt{$1}$')
          .replace(/±/g, '$\\pm$')
          .replace(/(\-?\d+)\s*±\s*(.+?)i/g, '$1 \\pm $2i$')
          .replace(/\s+/g, ' ') // Clean up extra spaces
          .trim();
      };

      const response = mode === "answer" 
        ? `${formatMathText(solution.explanation)}

${Array.isArray(solution.steps) && solution.steps.length > 0 ? solution.steps.map((step, index) => `**Step ${index + 1}:** ${formatMathText(step)}`).join('\n\n') : ''}

**Solution:** ${formatMathText(solution.solution)}

*Confidence: ${Math.round(solution.confidence * 100)}%*`
        : `${formatMathText(solution.explanation)}

${Array.isArray(solution.steps) && solution.steps.length > 0 ? solution.steps.map((step, index) => `**Hint ${index + 1}:** ${formatMathText(step)}`).join('\n\n') : ''}

${formatMathText(solution.solution)}

*Let me know if you need more help!*`;

      // Store the AI's response
      const aiMessage = await storage.createMessage({
        conversationId: parseInt(conversationId),
        role: "assistant",
        content: response,
        metadata: { 
          inputMethod, 
          mode, 
          confidence: solution.confidence 
        }
      });

      res.json({ response });
    } catch (error) {
      console.error("Error solving math problem:", error);
      res.status(500).json({ message: "Failed to solve problem" });
    }
  });

  // Image analysis route
  app.post("/api/analyze-image", upload.single('image'), isAuthenticated, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const base64Image = req.file.buffer.toString('base64');
      const extractedText = await analyzeImageProblem(base64Image);
      
      res.json({ extractedText });
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ message: "Failed to analyze image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}