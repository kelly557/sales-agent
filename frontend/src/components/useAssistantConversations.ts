import { useCallback, useState } from "react";
import type { AssistantConversation } from "./AssistantPage";

const STORAGE_KEY = "doctech:assistant-conversations";

function loadInitialConversations(): AssistantConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AssistantConversation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistConversations(conversations: AssistantConversation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    /* storage quota or private mode; safe to ignore for demo */
  }
}

export function useAssistantConversations() {
  const [conversations, setConversations] = useState<AssistantConversation[]>(() => loadInitialConversations());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const saveConversation = useCallback((conversation: Omit<AssistantConversation, "updatedAt">) => {
    const savedConversation: AssistantConversation = {
      ...conversation,
      updatedAt: new Date().toISOString(),
    };
    setActiveConversationId(savedConversation.id);
    setConversations((current) => {
      const next = [savedConversation, ...current.filter((item) => item.id !== savedConversation.id)].slice(0, 20);
      persistConversations(next);
      return next;
    });
  }, []);

  const renameConversation = useCallback((conversationId: string, nextTitle: string) => {
    const trimmedTitle = nextTitle.trim();
    if (!trimmedTitle) return;
    setConversations((current) => updateConversationTitle(current, conversationId, trimmedTitle));
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations((current) => removeConversation(current, conversationId));
    setActiveConversationId((current) => (current === conversationId ? null : current));
  }, []);

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    saveConversation,
    renameConversation,
    deleteConversation,
  };
}

function updateConversationTitle(
  conversations: AssistantConversation[],
  conversationId: string,
  nextTitle: string,
): AssistantConversation[] {
  const next = conversations.map((conversation) =>
    conversation.id === conversationId ? { ...conversation, title: nextTitle } : conversation,
  );
  persistConversations(next);
  return next;
}

function removeConversation(
  conversations: AssistantConversation[],
  conversationId: string,
): AssistantConversation[] {
  const next = conversations.filter((conversation) => conversation.id !== conversationId);
  persistConversations(next);
  return next;
}
