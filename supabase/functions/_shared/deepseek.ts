// Shared DeepSeek AI helper for all edge functions
// Uses DeepSeek API as the primary AI provider

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export interface DeepSeekMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
}

export interface DeepSeekOptions {
  model?: string;
  messages: DeepSeekMessage[];
  tools?: any[];
  tool_choice?: string | object;
  temperature?: number;
  max_tokens?: number;
}

export async function callDeepSeek(options: DeepSeekOptions) {
  const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
  if (!DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY not configured");
  }

  const body: any = {
    model: options.model || "deepseek-chat",
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2000,
  };

  if (options.tools) {
    body.tools = options.tools;
    body.tool_choice = options.tool_choice || "auto";
  }

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("DeepSeek API error:", response.status, errorText);
    
    if (response.status === 429) {
      throw new Error("DeepSeek rate limit exceeded. Try again later.");
    }
    if (response.status === 402) {
      throw new Error("DeepSeek credits exhausted.");
    }
    throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

// Simple helper for text completion (no tools)
export async function deepSeekComplete(
  systemPrompt: string,
  userPrompt: string,
  options?: { temperature?: number; max_tokens?: number; model?: string }
): Promise<string> {
  const data = await callDeepSeek({
    model: options?.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: options?.temperature,
    max_tokens: options?.max_tokens,
  });

  return data.choices?.[0]?.message?.content || "";
}
