// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License

// The keys of the AI chat's UI strings, as in `@fumadocs/ai-chat`: the English
// text followed by each note, in parentheses.
export const keys = [
  "1 result(AI chat)",
  "Answers come from the docs, AI can make mistakes.(AI chat)",
  "Ask AI(AI chat)",
  "Ask a follow-up(AI chat)",
  "Ask a question(AI chat)",
  "Close(AI chat)",
  "Copied(AI chat)",
  "Copy(AI chat)",
  "How do I get started?(AI chat)",
  "Message(AI chat)(aria-label)",
  "New chat(AI chat)",
  "Retry(AI chat)",
  "Scroll to latest(AI chat)(aria-label)",
  "Search failed(AI chat)",
  "Search stopped(AI chat)",
  "Searched(AI chat)",
  "Searching(AI chat)",
  "Send(AI chat)(aria-label)",
  "Something went wrong.(AI chat)",
  "Sources(AI chat)(aria-label)",
  "Stop(AI chat)(aria-label)",
  "Suggestions(AI chat)(aria-label)",
  "Summarize this page(AI chat)",
  "Thinking(AI chat)",
  "Try again(AI chat)",
  "What can I customize?(AI chat)",
  "What do you want to know?(AI chat)",
  "{count} results(AI chat)",
] as const;

export type Translations = Record<(typeof keys)[number], string>;
