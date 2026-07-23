import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", college: "Government Engineering College, Arsikere" });
});

// AI Campus Assistant Route
app.post("/api/ai-assistant", async (req, res) => {
  try {
    const { prompt, contextData, userRole, userName } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemInstruction = `
You are the official AI Campus Assistant for Government Engineering College, Arsikere (GEC Arsikere), Karnataka.
You help Students, Faculty, and Admin with college information including:
- Student Attendance & Subject-wise breakdown
- Internal Assessment Marks & Performance
- Class Timetables & Period Schedules
- Pending & Submitted Assignments
- Faculty Contact & Department Details
- Academic Calendar & Upcoming Holidays
- Official College & Department Announcements
- Library Books & Placement Drives

Current User Context:
- Name: ${userName || "User"}
- Role: ${userRole || "Student"}
- Available Live Data Context: ${JSON.stringify(contextData || {})}

Guidelines:
1. Provide accurate, helpful, friendly responses using the provided user context if available.
2. If exact specific data is present in contextData, summarize it cleanly with markdown bullet points.
3. Be professional and encouraging. Address the student or faculty member warmly.
4. Keep answers concise, clear, and well-structured.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I am unable to generate a response at this moment. Please try again.";
    res.json({ reply });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    res.status(500).json({
      error: "Failed to communicate with AI Campus Assistant",
      details: error?.message || "Unknown error",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GEC Arsikere ERP Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
