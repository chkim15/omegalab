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
  mode: "answer" | "tutor" = "answer",
  images?: { url: string; name?: string }[]
): Promise<MathSolutionResponse> {
  try {
    const systemPrompt = mode === "answer" 
      ? `You are OmegaLab, an AI math tutor. Provide clear, step-by-step solutions.

IMPORTANT FORMATTING RULES:
- Keep each step concise and clear (max 50 words per step)
- Use simple language, avoid complex technical jargon
- Each step should be a complete sentence
- Use standard mathematical notation (x^2, not special symbols)
- Separate different concepts with clear breaks

Respond with a JSON object containing:
- solution: The final numerical answer only
- steps: Array of clear, concise solution steps (each step max 50 words)
- explanation: Brief overview of the method used (max 100 words)
- confidence: Your confidence level (0-1)`
      : `You are OmegaLab, an AI math tutor providing hints without giving the final answer.

IMPORTANT FORMATTING RULES:
- Keep hints short and focused (max 30 words per hint)
- Ask one guiding question per hint
- Don't reveal the final answer
- Use encouraging language
- Guide toward the next logical step

Respond with a JSON object containing:
- solution: "Let me guide you step by step..." (never give the final answer)
- steps: Array of short hints and guiding questions (each max 30 words)
- explanation: Brief explanation of the approach without solving (max 80 words)
- confidence: Your confidence level (0-1) in the guidance quality`;

    const userPrompt = mode === "answer"
      ? `Please solve this math problem completely with step-by-step solution:

${problem}

Input method used: ${inputMethod}
${images && images.length > 0 ? `\nImages provided: ${images.length} image(s) with math content` : ''}

Please respond with a JSON object as specified in the system prompt.`
      : `Please provide hints and guidance for this math problem without giving the complete answer:

${problem}

Input method used: ${inputMethod}
${images && images.length > 0 ? `\nImages provided: ${images.length} image(s) with math content` : ''}

Guide the student to think through the problem step by step. Please respond with a JSON object as specified in the system prompt.`;

    // Build message content - include images if provided
    const messageContent: any[] = [{ type: "text", text: userPrompt }];
    
    if (images && images.length > 0) {
      images.forEach(image => {
        messageContent.push({
          type: "image_url",
          image_url: {
            url: image.url
          }
        });
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: messageContent }
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
