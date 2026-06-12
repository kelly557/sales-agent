import { useCallback, useRef } from "react";

export interface StreamMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "streaming" | "done" | "error";
}

interface StreamEventPayload {
  choices?: Array<{ delta?: { content?: string } }>;
  error?: { message?: string };
}

export function useAssistantStream(
  setChatMessages: React.Dispatch<React.SetStateAction<StreamMessage[]>>,
) {
  const activeAssistantMessageId = useRef<string | null>(null);

  const streamAnswer = useCallback(
    async (history: StreamMessage[], assistantMessageId: string) => {
      const response = await fetch("/api/qwen/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((item) => item.content.trim())
            .map((item) => ({ role: item.role, content: item.content })),
        }),
      });
      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "AI 助手连接失败");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let bufferedText = "";
      while (true) {
        const { done, value } = await reader.read();
        bufferedText += decoder.decode(value, { stream: !done });
        bufferedText = consumeBuffer(bufferedText, assistantMessageId, setChatMessages, activeAssistantMessageId);
        if (done) break;
      }
    },
    [setChatMessages],
  );

  const setActiveMessageId = useCallback((id: string | null) => {
    activeAssistantMessageId.current = id;
  }, []);

  return { streamAnswer, setActiveMessageId };
}

function consumeBuffer(
  bufferedText: string,
  assistantMessageId: string,
  setChatMessages: React.Dispatch<React.SetStateAction<StreamMessage[]>>,
  activeAssistantMessageId: React.MutableRefObject<string | null>,
) {
  const events = bufferedText.split("\n\n");
  const remaining = events.pop() ?? "";
  for (const event of events) {
    for (const line of event.split("\n")) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      const parsed = JSON.parse(data) as StreamEventPayload;
      if (parsed.error?.message) throw new Error(parsed.error.message);
      const content = parsed.choices?.[0]?.delta?.content;
      if (content) appendChunk(assistantMessageId, content, setChatMessages, activeAssistantMessageId);
    }
  }
  return remaining;
}

function appendChunk(
  assistantMessageId: string,
  chunk: string,
  setChatMessages: React.Dispatch<React.SetStateAction<StreamMessage[]>>,
  activeAssistantMessageId: React.MutableRefObject<string | null>,
) {
  if (activeAssistantMessageId.current !== assistantMessageId) return;
  setChatMessages((messages) =>
    messages.map((item) =>
      item.id === assistantMessageId ? { ...item, content: item.content + chunk } : item,
    ),
  );
}
