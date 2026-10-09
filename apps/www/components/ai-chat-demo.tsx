"use client";

import { useChat } from "@ai-sdk/react";
import type { ChatTransport, UIMessageChunk } from "ai";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import {
  AIChatPanel,
  AIChatProvider,
  AIChatSearch,
  useAIChat,
} from "@/components/ai/chat";
import type { ChatUIMessage } from "@/components/ai/search";
import { Button } from "@/components/ui/button";
import {
  DocsLayout as Layout,
  type DocsLayoutProps,
} from "@/registry/base/docs/layouts/docs";

// docscn.dev has no chat backend: this transport plays a canned answer in the
// browser, so the chat UI can be tried without an API key.
const answer = `This demo has no backend, so it can't search the docs for you. In your app, the \`ai-chat-openrouter\` block's chat route searches your pages and answers through [OpenRouter](https://openrouter.ai), linking to the pages it used, like [AI chat](/docs/components/ai-chat).

Install it with:

\`\`\`bash
npx shadcn@latest add @docscn/ai-chat-openrouter
\`\`\``;

const transport: ChatTransport<ChatUIMessage> = {
  async sendMessages({ messages, abortSignal }) {
    const question = messages
      .findLast((message) => message.role === "user")
      ?.parts.find((part) => part.type === "text")?.text;

    return new ReadableStream<UIMessageChunk>({
      async start(controller) {
        const wait = (ms: number) =>
          new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(resolve, ms);
            abortSignal?.addEventListener("abort", () => {
              clearTimeout(timeout);
              reject(abortSignal.reason);
            });
          });

        try {
          controller.enqueue({ type: "start" });
          controller.enqueue({ type: "start-step" });
          controller.enqueue({
            type: "tool-input-available",
            toolCallId: "search",
            toolName: "search",
            input: { query: question ?? "", limit: 10 },
          });
          await wait(900);
          controller.enqueue({
            type: "tool-output-available",
            toolCallId: "search",
            output: [
              { doc: { url: "/docs/components/ai-chat", title: "AI chat" } },
              {
                doc: {
                  url: "/docs/components/docs-layout",
                  title: "DocsLayout",
                },
              },
            ],
          });
          controller.enqueue({ type: "finish-step" });
          controller.enqueue({ type: "start-step" });
          await wait(500);
          controller.enqueue({ type: "text-start", id: "answer" });
          for (const word of answer.split(/(?<=\s)/)) {
            controller.enqueue({
              type: "text-delta",
              id: "answer",
              delta: word,
            });
            await wait(25);
          }
          controller.enqueue({ type: "text-end", id: "answer" });
          controller.enqueue({ type: "finish-step" });
          controller.enqueue({ type: "finish" });
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  },
  async reconnectToStream() {
    return null;
  },
};

function renderPart(part: ChatUIMessage["parts"][number], live: boolean) {
  if (part.type === "tool-search")
    return <AIChatSearch part={part} live={live} />;
}

function AIChatDemo({ children }: { children: ReactNode }) {
  const chat = useChat<ChatUIMessage>({ id: "demo", transport });

  return (
    <AIChatProvider
      chat={chat}
      renderPart={renderPart}
      description="A demo with a canned answer: docscn.dev has no chat backend."
    >
      {children}
    </AIChatProvider>
  );
}

/** The docs layout with the demo chat in `aiChat`. */
export function DocsLayout(props: DocsLayoutProps) {
  return (
    <AIChatDemo>
      <ChatLayout {...props} />
    </AIChatDemo>
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

/** Opens the demo chat, for the AI chat page. */
export function TryAIChat() {
  const { setOpen } = useAIChat();

  return (
    <Button variant="outline" onClick={() => setOpen(true)}>
      <MessageCircle />
      Try the AI chat
    </Button>
  );
}
