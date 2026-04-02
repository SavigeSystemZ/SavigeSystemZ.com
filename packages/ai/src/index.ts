export interface ConciergeMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export function sanitizePromptInput(input: string): string {
  return input.replace(/[<>]/g, "");
}
