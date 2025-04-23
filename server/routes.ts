import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { supabase } from "./db/supabase";
import { initAstra, storeChatMessage, getUserChatHistory, getChatSessionMessages } from "./db/astra";
import { callLangflowAPI, AIResponse } from "./langflow";
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './types';

// Initialize AstraDB on server start
initAstra().catch(err => {
  console.error("Failed to initialize AstraDB:", err);
});

// Schema validation
const chatMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional(),
});

const sessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, username } = registerSchema.parse(req.body);
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            is_pro: false,
            questions_remaining: 5,
          }
        }
      });
      
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      
      // Set session in cookie
      if (req.session) {
        req.session.userId = data.user?.id;
      }
      
      res.json({ user: data.user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Registration failed" });
      }
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return res.status(401).json({ message: error.message });
      }
      
      // Set session in cookie
      if (req.session) {
        req.session.userId = data.user?.id;
      }
      
      res.json({ user: data.user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "Login failed" });
      }
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "No active session" });
    }
  });
  
  app.get("/api/auth/user", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user data from Supabase
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        return res.status(401).json({ message: "Invalid session" });
      }
      
      res.json({ user: data.user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Chat sessions routes
  app.get("/api/chat-sessions", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get user's chat history from AstraDB
      const chatHistory = await getUserChatHistory(req.session.userId);
      
      // Group messages by sessionId to form sessions
      const sessionMap = new Map();
      chatHistory.forEach(message => {
        if (!sessionMap.has(message.sessionId)) {
          sessionMap.set(message.sessionId, {
            id: message.sessionId,
            title: message.title || "Untitled Chat",
            userId: req.session?.userId,
            createdAt: message.timestamp,
            updatedAt: message.timestamp
          });
        } else {
          // Update timestamp if newer
          const session = sessionMap.get(message.sessionId);
          if (new Date(message.timestamp) > new Date(session.updatedAt)) {
            session.updatedAt = message.timestamp;
          }
        }
      });
      
      const sessions = Array.from(sessionMap.values());
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });
  
  app.post("/api/chat-sessions", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { title } = sessionSchema.parse(req.body);
      const sessionId = uuidv4();
      
      // Store first system message to mark session creation
      const systemMessage: ChatMessage = {
        type: "system",
        text: "Chat session started",
        title
      };
      await storeChatMessage(req.session.userId, sessionId, systemMessage);
      
      res.json({
        id: sessionId,
        title,
        userId: req.session.userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Error creating chat session:", error);
        res.status(500).json({ message: "Failed to create chat session" });
      }
    }
  });
  
  app.get("/api/chat-sessions/:sessionId/messages", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { sessionId } = req.params;
      const messages = await getChatSessionMessages(sessionId);
      
      // Filter out system messages
      const chatMessages = messages
        .filter(msg => msg.type !== "system")
        .map(msg => ({
          id: msg._id,
          type: msg.type,
          text: msg.text,
          timestamp: msg.timestamp,
          citation: msg.citation,
          actions: msg.actions
        }));
      
      res.json(chatMessages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Chat API endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId } = chatMessageSchema.parse(req.body);
      
      // Get user ID from session if authenticated
      const userId = req.session?.userId || 'anonymous';
      
      // Create a new session if none provided
      const chatSessionId = sessionId || uuidv4();
      
      // Store user message
      const userMessage: ChatMessage = {
        type: "user",
        text: message,
        timestamp: new Date().toISOString()
      };
      await storeChatMessage(userId, chatSessionId, userMessage);
      
      // Call Langflow API for AI response
      // In development, use our keyword-based responses if Langflow isn't set up yet
      let response: AIResponse;
      
      try {
        // Attempt to call Langflow
        response = await callLangflowAPI(message, chatSessionId);
      } catch (apiError) {
        console.error("Langflow API error, using fallback:", apiError);
        
        // Fallback to keyword matching
        response = {
          text: "I'm processing your question about consumer law. I'll provide the most accurate information I can based on current consumer protection laws.",
          actions: ["Generate Letter", "Learn More"]
        };
        
        // Basic keyword detection for more specific responses
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes("debt") && lowerMessage.includes("collector")) {
          if (lowerMessage.includes("call") && lowerMessage.includes("work")) {
            response = {
              text: "Under the Fair Debt Collection Practices Act (FDCPA), debt collectors cannot call you at work if they know your employer prohibits such calls. You can inform the collector that such calls are not allowed, and they must stop.",
              citation: "15 U.S.C. § 1692c(a)(3) - FDCPA Section 805(a)(3)",
              actions: ["Generate Cease Letter", "Learn More About FDCPA"]
            };
          } else if (lowerMessage.includes("harass") || lowerMessage.includes("threat")) {
            response = {
              text: "The FDCPA prohibits debt collectors from harassing, oppressing, or abusing you. This includes threats, using obscene language, or repeatedly calling to annoy you. You have the right to send a written request to stop contact.",
              citation: "15 U.S.C. § 1692d - FDCPA Section 806",
              actions: ["Generate Harassment Complaint", "Request Debt Validation"]
            };
          } else {
            response = {
              text: "The Fair Debt Collection Practices Act (FDCPA) provides protections against abusive debt collection practices. Collectors must identify themselves, can't contact you at inconvenient times, and must provide debt verification upon request.",
              citation: "15 U.S.C. § 1692 et seq.",
              actions: ["Request Debt Validation", "Dispute Debt"]
            };
          }
        } else if (lowerMessage.includes("credit") && (lowerMessage.includes("report") || lowerMessage.includes("score"))) {
          if (lowerMessage.includes("dispute") || lowerMessage.includes("incorrect") || lowerMessage.includes("wrong")) {
            response = {
              text: "You have the right to dispute inaccurate information on your credit report. The credit bureau must investigate and respond within 30 days. If the information is incorrect, it must be removed or corrected.",
              citation: "15 U.S.C. § 1681i - FCRA Section 611",
              actions: ["Generate Dispute Letter", "Credit Report Guide"]
            };
          } else if (lowerMessage.includes("check") || lowerMessage.includes("get") || lowerMessage.includes("obtain")) {
            response = {
              text: "You're entitled to one free credit report every 12 months from each of the three major credit bureaus (Equifax, Experian, and TransUnion) through AnnualCreditReport.com. You can also get additional free reports in certain circumstances.",
              citation: "15 U.S.C. § 1681j - FCRA Section 612",
              actions: ["How to Get Your Credit Report", "Understand Your Rights"]
            };
          } else {
            response = {
              text: "The Fair Credit Reporting Act (FCRA) regulates how credit reporting agencies collect and share your information. It gives you rights to access your credit reports, dispute inaccuracies, and know when your information is used against you.",
              citation: "15 U.S.C. § 1681 et seq.",
              actions: ["Credit Report Rights", "Free Credit Report Info"]
            };
          }
        } else if (lowerMessage.includes("identity") && lowerMessage.includes("theft")) {
          response = {
            text: "If you're a victim of identity theft, you should: 1) Place a fraud alert with credit bureaus, 2) Request credit reports, 3) Create an identity theft report with the FTC, 4) File a police report, and 5) Contact your creditors to close compromised accounts.",
            citation: "FTC Identity Theft Resource: IdentityTheft.gov",
            actions: ["Identity Theft Action Plan", "Sample Fraud Alert Letter"]
          };
        } else if (lowerMessage.includes("cfpb") || lowerMessage.includes("consumer financial protection bureau")) {
          response = {
            text: "The Consumer Financial Protection Bureau (CFPB) is a federal agency that ensures banks, lenders, and other financial companies treat you fairly. You can submit complaints about consumer financial products and services through their website.",
            citation: "12 U.S.C. § 5511 - CFPB Authority and Duties",
            actions: ["File CFPB Complaint", "Consumer Rights Guide"]
          };
        }
      }
      
      // Store AI response
      const aiMessage: ChatMessage = {
        type: "ai",
        text: response.text,
        citation: response.citation,
        actions: response.actions,
        timestamp: new Date().toISOString()
      };
      await storeChatMessage(userId, chatSessionId, aiMessage);
      
      // Update user metrics (e.g., questions remaining for free users)
      if (userId !== 'anonymous') {
        // Get user data to check if pro
        const { data } = await supabase.auth.getUser();
        const isPro = data.user?.user_metadata?.is_pro || false;
        
        if (!isPro) {
          // Decrement questions remaining for free users
          const questionsRemaining = (data.user?.user_metadata?.questions_remaining || 5) - 1;
          
          await supabase.auth.updateUser({
            data: { questions_remaining: Math.max(0, questionsRemaining) }
          });
        }
      }
      
      // Return AI response to client
      res.json({
        ...response,
        sessionId: chatSessionId
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        console.error("Chat error:", error);
        res.status(500).json({ message: "Failed to process your request" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
