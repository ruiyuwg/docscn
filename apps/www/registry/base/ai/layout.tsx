// Adapted from the Fumadocs CLI's ai/openrouter component (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
"use client";
import {
  DocsLayout as Layout,
  type DocsLayoutProps,
} from "@/components/docs/layouts/docs";
import { AIChat, AIChatPanel, AIChatTrigger, useAIChat } from "./search";

export function DocsLayout(props: DocsLayoutProps) {
  return (
    <AIChat>
      <ChatLayout {...props} />
      <AIChatTrigger />
    </AIChat>
  );
}

function ChatLayout(props: DocsLayoutProps) {
  const { open, setOpen } = useAIChat();

  return (
    <Layout
      {...props}
      aiChat={{ open, onOpenChange: setOpen, panel: <AIChatPanel /> }}
    />
  );
}
