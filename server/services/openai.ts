import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "your-openai-api-key"
});

export interface MathSolutionResponse {
  solution: string;
  steps: string[];
  explanation: string;
  confidence: number;
}

export async function solveMathProblem(
  problem: string,
  inputMethod: "text" | "voice" | "image" | "drawing" = "text"
): Promise<MathSolutionResponse> {
  try {
    const systemPrompt = `You are OmegaLab, the most accurate AI math tutor. Your goal is to help students learn math by providing step-by-step solutions and clear explanations.

When solving math problems:
1. Break down the solution into clear, numbered steps
2. Explain the reasoning behind each step
3. Use proper mathematical notation
4. Provide additional context or tips when helpful
5. Always encourage learning and understanding

Respond with a JSON object containing:
- solution: The final answer
- steps: Array of step-by-step solution process
- explanation: Clear explanation of the concepts used
- confidence: Your confidence level (0-1) in the solution accuracy`;

    const userPrompt = `Please solve this math problem and provide a detailed explanation:

${problem}

Input method used: ${inputMethod}

Please respond with a JSON object as specified in the system prompt.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      solution: result.solution || "Unable to solve this problem",
      steps: result.steps || [],
      explanation: result.explanation || "No explanation available",
      confidence: Math.max(0, Math.min(1, result.confidence || 0.8)),
    };
  } catch (error) {
    console.error("Error solving math problem:", error);
    throw new Error("Failed to solve math problem: " + (error as Error).message);
  }
}

export async function analyzeImageProblem(base64Image: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract and transcribe any mathematical expressions, equations, or problems you see in this image. Provide the math content in a clear, text format that can be used for solving."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Unable to extract math from image";
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to analyze image: " + (error as Error).message);
  }
}

export async function transcribeAudio(audioFilePath: string): Promise<string> {
  try {
    const fs = await import("fs");
    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
    });

    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error("Failed to transcribe audio: " + (error as Error).message);
  }
}
