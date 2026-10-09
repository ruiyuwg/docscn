// Adapted from Fumadocs UI (https://github.com/fuma-nama/fumadocs)
// Copyright (c) 2023 Fuma, MIT License
import type { TranslationExtension } from "fumadocs-core/i18n";
import { keys as translationKeys } from "./.translations";
import type { Translations } from "./.translations";

export type { Translations };
export function aiChatTranslations(): TranslationExtension<keyof Translations> {
  return { keys: translationKeys as never };
}
