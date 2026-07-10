import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for side hustle analysis
  app.post("/api/analyze", async (req, res) => {
    try {
      const { idea, targetAudience, budget, timeCommitment } = req.body;

      if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
        return res.status(400).json({ error: "Please write down your side hustle idea!" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your secrets in Settings > Secrets."
        });
      }

      // Lazy initialization
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemInstruction = `You are a startup veteran, seasoned tech architect, and venture builder. You are sardonically honest yet deeply supportive. Your job is to perform a realistic 'smoke-test' on a user's passionate, late-night, 2 A.M. side hustle idea.
      
Provide structured, highly practical analysis, giving real-world competitor context, identifying alternative solutions, framing a clean technical architecture, calculating scores, and delivering a reality check.

Tone guidelines:
- Witty, slightly sarcastic about classic developer tendencies (e.g., spending 3 days configuring Webpack/ESLint/Docker, buying expensive premium domains before writing a line of code, writing a custom CSS framework, or over-engineering Kubernetes clusters for 5 active users), but fundamentally encouraging, pragmatic, and helpful.
- Avoid flowery corporate startup jargon. Keep it actionable, developer-friendly, and highly direct. Use realistic competitor insights.`;

      const prompt = `Here is the user's side hustle idea:
"${idea}"

${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${budget ? `Budget context: ${budget}` : ""}
${timeCommitment ? `Time Commitment constraint: ${timeCommitment}` : ""}

Please analyze this idea and return a structured JSON response matching the required schema. Focus on finding real-world competitors (or similar products) and outlining a practical, rapid tech architecture.`;

      const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite"];
      let response = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        let attempt = 0;
        const maxAttempts = 3;
        while (attempt < maxAttempts) {
          try {
            console.log(`Attempting analysis with model ${modelName} (Attempt ${attempt + 1}/${maxAttempts})...`);
            response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    projectTitle: { type: Type.STRING, description: "A polished, catchy, descriptive title for the side hustle idea." },
                    tagline: { type: Type.STRING, description: "A punchy one-sentence tagline summarizing the unique value proposition." },
                    feasibilityScore: { type: Type.INTEGER, description: "A score from 0 to 100 on how realistic/feasible this is to build and launch (higher score = easier/more feasible)." },
                    passionMultiplier: { type: Type.INTEGER, description: "A score from 0 to 100 on how much raw energy/excitement/grit is needed to sustain it (lower score means it practically runs itself, higher score means it requires intense labor of love)." },
                    analysisSummary: { type: Type.STRING, description: "A highly realistic, sardonically honest yet deeply supportive startup veteran perspective reality-check verdict of their late-night 2 A.M. idea." },
                    marketData: {
                      type: Type.OBJECT,
                      properties: {
                        targetAudienceSize: { type: Type.STRING, description: "A descriptive estimation of their beachhead target audience." },
                        marketTrends: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "3-4 bullet points highlighting relevant real-world market trends or macroeconomic factors."
                        },
                        demandScore: { type: Type.INTEGER, description: "A score from 0 to 100 on customer demand and willingness to pay." }
                      },
                      required: ["targetAudienceSize", "marketTrends", "demandScore"]
                    },
                    competitors: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING, description: "Name of competitor or alternative solution." },
                          strength: { type: Type.STRING, description: "Their key competitive advantage or why people use them." },
                          weakness: { type: Type.STRING, description: "Their vulnerability, shortcoming, or customer complaints." },
                          differentiationAngle: { type: Type.STRING, description: "How the user's side hustle can carve out a unique space or 10x them." }
                        },
                        required: ["name", "strength", "weakness", "differentiationAngle"]
                      },
                      description: "3 competitors or status-quo alternatives."
                    },
                    techArchitecture: {
                      type: Type.OBJECT,
                      properties: {
                        recommendedStack: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "A realistic, lightweight, fast-to-build dev stack (e.g., ['Vite + React', 'Supabase', 'Vercel', 'Tailwind'])."
                        },
                        architectureOverview: { type: Type.STRING, description: "A brief overview of how this system should be built in the simplest way possible." },
                        developmentComplexity: { type: Type.STRING, description: "Complexity description: Low, Medium, High, or 'Extreme (2 A.M. Special)'" },
                        estimatedBuildTime: { type: Type.STRING, description: "Estimated time to build a fully functional MVP (e.g. '3 weeks')." },
                        keyRisks: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: "2-3 technical risks, bottlenecks, or learning curves (e.g., API limits, cold starts)."
                        }
                      },
                      required: ["recommendedStack", "architectureOverview", "developmentComplexity", "estimatedBuildTime", "keyRisks"]
                    },
                    monetization: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          model: { type: Type.STRING, description: "Monetization model, e.g. SaaS subscription, microtransactions, transactional cuts." },
                          description: { type: Type.STRING, description: "How the user charges for it and who pays." },
                          revenuePotential: { type: Type.STRING, description: "Low, Medium, or High." },
                          difficulty: { type: Type.STRING, description: "Easy, Moderate, or Hard." }
                        },
                        required: ["model", "description", "revenuePotential", "difficulty"]
                      },
                      description: "2-3 highly viable monetization models."
                    },
                    growthRoadmap: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          phase: { type: Type.STRING, description: "Phase name, e.g. 'Phase 1: Smoke Test & Landing Page'" },
                          timeline: { type: Type.STRING, description: "Recommended timeline, e.g. 'Week 1-2'" },
                          actions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "3 concrete, low-effort action items."
                          }
                        },
                        required: ["phase", "timeline", "actions"]
                      },
                      description: "A 3-phase growth roadmap starting from smoke test to launch."
                    },
                    realityCheckQuestions: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "3 hard-hitting, sardonically funny but critical reflective questions they must answer honestly before spending $100 on domain names."
                    }
                  },
                  required: [
                    "projectTitle", "tagline", "feasibilityScore", "passionMultiplier", "analysisSummary",
                    "marketData", "competitors", "techArchitecture", "monetization", "growthRoadmap", "realityCheckQuestions"
                  ]
                }
              }
            });

            if (response && response.text) {
              break; // Success!
            }
          } catch (err: any) {
            lastError = err;
            attempt++;
            console.warn(`Model ${modelName} attempt ${attempt} failed:`, err.message || err);
            if (attempt < maxAttempts) {
              const delay = Math.pow(2, attempt) * 1000;
              console.log(`Waiting ${delay}ms before retrying ${modelName}...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }
        if (response && response.text) {
          break; // Exit outer model loop on success
        }
      }

      if (!response || !response.text) {
        throw lastError || new Error("Failed to generate response after trying fallback models and retries.");
      }

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text received from Gemini.");
      }

      const result = JSON.parse(responseText.trim());
      return res.json(result);
    } catch (error: any) {
      console.error("Analysis failed:", error);
      return res.status(500).json({
        error: error.message || "An unexpected error occurred during side hustle analysis."
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
