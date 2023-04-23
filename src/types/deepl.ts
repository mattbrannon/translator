import { TranslatorInput, TranslatorResponse } from "./shared";

type IgnorePatterns = {
  unicode?: string[];
  regex?: RegExp[];
};

export type DeepLConfig = {
  formality?: "default" | "prefer_less" | "prefer_more" | "more" | "less";
  tagHandling?: "xml" | "html";
  splitSentences?: "nonewlines" | 0 | 1;
  source_lang?: string;
  ignore: IgnorePatterns;
};

export type DeepLResponse = {
  translations: [{ text: string; detected_source_language: string }];
};

type MethodDeepLTranslate = (
  input: TranslatorInput,
  config?: DeepLConfig
) => Promise<TranslatorResponse>;

type MethodDeepLSourceLanguages = () => Promise<
  [{ language: string; name: string }]
>;

type MethodDeepLTargetLanguages = () => Promise<
  [
    {
      language: string;
      name: string;
      supports_formality: boolean;
    }
  ]
>;

type MethodDeepLUsage = () => Promise<{
  character_count: number;
  character_limit: number;
}>;

export interface DeepLTranslator {
  name: "deepL";
  translate: MethodDeepLTranslate;
  sourceLanguages: MethodDeepLSourceLanguages;
  targetLanguages: MethodDeepLTargetLanguages;
  usage: MethodDeepLUsage;
}
