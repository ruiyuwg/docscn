# AI chat

`@docscn/ai-chat-openrouter` adds an Ask AI chat to the docs layout. Its route searches the docs pages and answers through [OpenRouter](https://openrouter.ai) with the AI SDK. The current guide is at `https://docscn.dev/docs/components/ai-chat.md`.

## Install

```bash
npx shadcn@latest add @docscn/ai-chat-openrouter
```

It installs:

- `components/ai/chat/`: the chat UI (`@docscn/ai-chat`)
- `components/ai/search.tsx`: the chat state, from the AI SDK's `useChat`
- `components/ai/layout.tsx`: a client `DocsLayout` that passes the chat to the layout's `aiChat` option and adds a floating Ask AI button
- `app/api/chat/route.ts`: the chat route

## Finish the setup

1. In `app/docs/layout.tsx`, import `DocsLayout` from the client layout:

   ```tsx
   import { DocsLayout } from "@/components/ai/layout";
   ```

   For the notebook layout, change the import in `components/ai/layout.tsx` to `@/components/docs/layouts/notebook`.

2. Check that `lib/source.ts` turns on `includeProcessedMarkdown`, which the route searches. The `docs` block and `create-fumadocs-app` both do:

   ```ts
   const docs = defineDocs({
     dir: "content/docs",
     docs: {
       postprocess: {
         includeProcessedMarkdown: true,
       },
     },
   });
   ```

3. Ask the user to set `OPENROUTER_API_KEY` in `.env.local`. Never write a real key into the project yourself. `OPENROUTER_MODEL` picks the model.

To use another model provider, edit `app/api/chat/route.ts`. Any AI SDK provider works.

## Customise

`AIChatProvider` (from `@/components/ai/chat`) takes the `useChat()` result plus `description`, `suggestions`, `toMessage` and `renderPart`. `useAIChat()` returns `{ open, setOpen }`. The panel is built from `AIChatHeader`, `AIChatMessages`, `AIChatInput`, `AIChatSearch` and `AIChatSources`, which can be rearranged in the installed files.

The chat's UI strings have their own translation keys. Register them with `.extend(aiChatTranslations())` from `@/components/ai/chat/i18n`.
