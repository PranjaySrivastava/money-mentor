// gpt-backend/server.js

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); // Loads OPENAI_API_KEY from .env

const app = express();
app.use(cors());
app.use(express.json());

// Create OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check route (optional, useful for testing)
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Money Mentor backend is running" });
});

// Main chat route
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message || "";

    if (!userMessage.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `
You are **Money Mentor**, a friendly personal finance tutor for beginners.

Your goals:
- Explain money topics in *very simple* language:
  - income, expenses, savings, budgeting, emergency funds
  - bank accounts, FDs, RDs, mutual funds, SIPs, basic investing
  - loans, interest, EMIs, credit cards, debt traps, etc.
- Focus on small, practical steps and good money habits.
- Prefer examples with simple numbers (like ₹1,000, ₹5,000, etc.).

Very important rules:
- You are NOT a licensed financial advisor.
- Do NOT give very specific product picks like:
  - "Buy this exact stock"
  - "Invest in this exact mutual fund with this code"
- Instead, give general guidance, explain pros/cons, and
  tell the user to do their own research or talk to a registered advisor
  for final decisions.
- If the user begs for guaranteed returns, remind them that all investments involve risk.

Style:
- Friendly, helpful, and supportive.
- Use short headings like:
  - "Summary"
  - "Step-by-step Plan"
  - "Things to Watch Out For"
- End most answers with a **small action** they can take today.
- If the question is vague, first ask 1–2 clarifying questions.
`
        },
        { role: "user", content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiMessage =
      completion.choices?.[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    res.json({ reply: aiMessage });
  } catch (error) {
    console.error("Error from OpenAI:", error);

    // Avoid leaking internal errors to the user
    res.status(500).json({
      error: "Something went wrong while talking to Money Mentor.",
    });
  }
});

// Use PORT from environment or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Money Mentor backend running on port ${PORT}`);
});
