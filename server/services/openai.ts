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
  inputMethod: "text" | "voice" | "image" | "drawing" = "text",
  mode: "answer" | "tutor" = "answer"
): Promise<MathSolutionResponse> {
  try {
    const systemPrompt = mode === "answer" 
      ? `You are OmegaLab, the most accurate AI math tutor. Your goal is to provide complete step-by-step solutions to help students understand the problem-solving process.

When providing answers:
1. Give the final answer clearly
2. Break down the solution into clear, numbered steps
3. Explain the reasoning behind each step
4. Use proper mathematical notation
5. Provide complete worked solutions

Respond with a JSON object containing:
- solution: The final answer
- steps: Array of detailed step-by-step solution process
- explanation: Clear explanation of the concepts and methods used
- confidence: Your confidence level (0-1) in the solution accuracy`
      : `You are OmegaLab, an AI math tutor focused on guiding students to discover solutions themselves. Your goal is to provide hints and guidance without giving away the complete answer.

When tutoring:
1. DO NOT give the final answer directly
2. Provide helpful hints to guide thinking
3. Ask guiding questions when appropriate
4. Encourage the student to try the next step
5. Focus on understanding concepts rather than just getting the answer

Respond with a JSON object containing:
- solution: "Let me guide you step by step..." (do not give the final answer)
- steps: Array of hints and guiding questions, not complete solutions
- explanation: Explanation of concepts to help understanding without solving completely
- confidence: Your confidence level (0-1) in the guidance quality`;

    const userPrompt = mode === "answer"
      ? `Please solve this math problem completely with step-by-step solution:

${problem}

Input method used: ${inputMethod}

Please respond with a JSON object as specified in the system prompt.`
      : `Please provide hints and guidance for this math problem without giving the complete answer:

${problem}

Input method used: ${inputMethod}

Guide the student to think through the problem step by step. Please respond with a JSON object as specified in the system prompt.`;

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
    
    // Ensure steps is always an array of strings
    const steps = Array.isArray(result.steps) 
      ? result.steps.map(step => typeof step === 'string' ? step : String(step || ''))
      : [];
    
    return {
      solution: String(result.solution || "Unable to solve this problem"),
      steps: steps,
      explanation: String(result.explanation || "No explanation available"),
      confidence: Math.max(0, Math.min(1, Number(result.confidence) || 0.8)),
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
