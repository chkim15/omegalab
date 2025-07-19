import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { solveMathProblem, analyzeImageProblem } from "./services/openai";
import { insertUserSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, username: user.username, email: user.email, plan: user.plan } });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // For demo purposes, create a user if they don't exist
      let user = await storage.getUserByEmail(email);
      if (!user) {
        // Auto-create user for demo
        user = await storage.createUser({
          username: email.split('@')[0],
          email: email,
          password: password
        });
      } else if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { id: user.id, username: user.username, email: user.email, plan: user.plan } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Conversation routes
  app.get("/api/conversations", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const conversationData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(conversationData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ message: "Invalid conversation data" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Math solving routes
  app.post("/api/solve", async (req, res) => {
    try {
      const { problem, conversationId, inputMethod = "text" } = req.body;
      
      if (!problem || !conversationId) {
        return res.status(400).json({ message: "Problem and conversation ID required" });
      }

      // Save user message
      await storage.createMessage({
        conversationId,
        role: "user",
        content: problem,
        metadata: { inputMethod }
      });

      // Solve the problem
      const solution = await solveMathProblem(problem, inputMethod);
      
      // Format the response
      const response = `**Solution:** ${solution.solution}

**Step-by-step explanation:**
${solution.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

**Explanation:**
${solution.explanation}

*Confidence: ${Math.round(solution.confidence * 100)}%*`;

      // Save AI response
      await storage.createMessage({
        conversationId,
        role: "assistant",
        content: response,
        metadata: { confidence: solution.confidence, steps: solution.steps }
      });

      res.json({ response, solution });
    } catch (error) {
      console.error("Math solving error:", error);
      res.status(500).json({ message: "Failed to solve math problem" });
    }
  });

  app.post("/api/solve-image", upload.single("image"), async (req, res) => {
    try {
      const { conversationId } = req.body;
      
      if (!req.file || !conversationId) {
        return res.status(400).json({ message: "Image and conversation ID required" });
      }

      const base64Image = req.file.buffer.toString('base64');
      
      // Extract math from image
      const extractedProblem = await analyzeImageProblem(base64Image);
      
      // Save user message with image metadata
      await storage.createMessage({
        conversationId: parseInt(conversationId),
        role: "user",
        content: "Image uploaded with math problem",
        metadata: { inputMethod: "image", hasImage: true }
      });

      // Solve the extracted problem
      const solution = await solveMathProblem(extractedProblem, "image");
      
      const response = `**Extracted problem:** ${extractedProblem}

**Solution:** ${solution.solution}

**Step-by-step explanation:**
${solution.steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

**Explanation:**
${solution.explanation}

*Confidence: ${Math.round(solution.confidence * 100)}%*`;

      // Save AI response
      await storage.createMessage({
        conversationId: parseInt(conversationId),
        role: "assistant",
        content: response,
        metadata: { confidence: solution.confidence, extractedProblem }
      });

      res.json({ response, extractedProblem, solution });
    } catch (error) {
      console.error("Image solving error:", error);
      res.status(500).json({ message: "Failed to solve math problem from image" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
