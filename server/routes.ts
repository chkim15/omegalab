import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { solveMathProblem, analyzeImageProblem } from "./services/openai";
import { createCheckoutSession, createPortalSession, handleWebhook } from "./services/stripe";
import { insertUserSchema, insertConversationSchema, insertMessageSchema } from "@shared/schema";
import multer from "multer";
import express from "express";

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

  // Analyze image endpoint
  app.post("/api/analyze-image", async (req, res) => {
    try {
      const { image } = req.body;
      
      if (!image) {
        return res.status(400).json({ error: "No image data provided" });
      }

      const extractedText = await analyzeImageProblem(image);
      
      res.json({ extractedText });
    } catch (error) {
      console.error("Error analyzing image:", error);
      res.status(500).json({ 
        error: "Failed to analyze image",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Math solving routes
  app.post("/api/solve", async (req, res) => {
    try {
      const { problem, conversationId, inputMethod = "text", mode = "answer", images } = req.body;
      
      if ((!problem || problem.trim() === "") && (!images || images.length === 0)) {
        return res.status(400).json({ message: "Problem text or images required" });
      }
      
      if (!conversationId) {
        return res.status(400).json({ message: "Conversation ID required" });
      }

      // Save user message
      await storage.createMessage({
        conversationId,
        role: "user",
        content: problem,
        metadata: { 
          inputMethod,
          images: images || null
        }
      });

      // Solve the problem - pass images directly to OpenAI
      const solution = await solveMathProblem(problem, inputMethod, mode, images);
      
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

      // Simple formatting without complex LaTeX
      const formatSteps = (steps: string[], mode: string) => {
        if (!Array.isArray(steps) || steps.length === 0) return '';
        const label = mode === "answer" ? "Step" : "Hint";
        return steps.map((step, index) => `**${label} ${index + 1}:** ${step}`).join('\n\n');
      };

      const response = mode === "answer" 
        ? `${solution.explanation}

${formatSteps(solution.steps, mode)}

**Solution:** ${solution.solution}

*Confidence: ${Math.round(solution.confidence * 100)}%*`
        : `${solution.explanation}

${formatSteps(solution.steps, mode)}

${solution.solution}

*Let me know if you need more help!*`;

      // Save AI response
      await storage.createMessage({
        conversationId,
        role: "assistant",
        content: response,
        metadata: { confidence: solution.confidence, steps: solution.steps, mode }
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

  // Stripe routes
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { priceId, userId, email } = req.body;
      
      if (!priceId || !userId || !email) {
        return res.status(400).json({ 
          message: "Missing required fields: priceId, userId, email" 
        });
      }

      const session = await createCheckoutSession({
        priceId,
        userId,
        email,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ 
        message: "Failed to create checkout session" 
      });
    }
  });

  app.post("/api/create-portal-session", async (req, res) => {
    try {
      const { customerId } = req.body;
      
      if (!customerId) {
        return res.status(400).json({ 
          message: "Customer ID required" 
        });
      }

      const session = await createPortalSession(customerId);
      res.json({ url: session.url });
    } catch (error) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ 
        message: "Failed to create portal session" 
      });
    }
  });

  app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
      return res.status(400).json({ message: "Missing stripe signature" });
    }

    try {
      const event = await handleWebhook(req.body, sig as string);
      
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object as any;
          const userId = session.metadata?.userId;
          
          if (userId) {
            // Update user to Pro plan for one-time payment
            await storage.updateUserPlan(parseInt(userId), 'pro');
          }
          break;
          
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as any;
          const customerId = paymentIntent.customer as string;
          
          if (customerId) {
            // Handle successful payment
            const user = await storage.getUserByStripeCustomerId(customerId);
            if (user) {
              await storage.updateUserPlan(user.id, 'pro');
            }
          }
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ message: "Webhook error" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
