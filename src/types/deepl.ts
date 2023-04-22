import { TranslatorInput } from "./shared";

export type Config = {
  formality?: "default" | "prefer_less" | "prefer_more" | "more" | "less";
  ignoreRegex?: RegExp[];
  tagHandling?: "xml" | "html";
  splitSentences?: "nonewlines" | 0 | 1;
  source_lang?: string;
};

export type TranslatorResponse = Array<{
  translation: string;
  original: string;
  detectedLanguage: string;
}>;

export type DeepLResponse = {
  translations: [{ text: string; detected_source_language: string }];
};

export type DeepLTranslator = {
  name: string;
  translate: (
    input: TranslatorInput,
    config?: Config
  ) => Promise<TranslatorResponse>;
  sourceLanguages: () => Promise<string[]>;
  targetLanguages: () => Promise<string[]>;
};
