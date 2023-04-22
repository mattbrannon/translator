export type TranslatorInput = {
  text: string | string[];
  target: string;
  source?: string;
};

export type TranslatorResponse = Array<{
  translation: string;
  original: string;
  detectedLanguage: string;
}>;
