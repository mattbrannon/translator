import { TranslatorInput, TranslatorResponse } from "./shared";

export type DeepLConfig = {
  formality?: "default" | "prefer_less" | "prefer_more" | "more" | "less";
  ignoreRegex?: RegExp[];
  tagHandling?: "xml" | "html";
  splitSentences?: "nonewlines" | 0 | 1;
  source_lang?: string;
};

export type DeepLResponse = {
  translations: [{ text: string; detected_source_language: string }];
};

export type MethodDeepLTranslate = (
  input: TranslatorInput,
  config?: DeepLConfig
) => Promise<TranslatorResponse>;

export type MethodDeepLLanguages = () => Promise<string[]>;

export type MethodDeepLUsage = () => Promise<{
  character_count: number;
  character_limit: number;
}>;

export type DeepLTranslator = {
  name: "deepL";
  translate: MethodDeepLTranslate;
  sourceLanguages: MethodDeepLLanguages;
  targetLanguages: MethodDeepLLanguages;
  usage: MethodDeepLUsage;
};
