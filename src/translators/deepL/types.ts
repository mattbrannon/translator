export namespace DeepL {
  export type Input = {
    text: string | string[];
    target: string;
    source?: string;
  };

  export type IgnorePatterns = {
    unicode?: string[];
    regex?: RegExp[];
  };

  export type SourceLanguage = {
    language: string;
    name: string;
  };

  export type TargetLanguage = {
    language: string;
    name: string;
    supports_formality: boolean;
  };

  export type UsageResponse = {
    character_count: number;
    character_limit: number;
  };

  export type Formality =
    | "default"
    | "prefer_less"
    | "prefer_more"
    | "more"
    | "less";

  export type TagHandling = "xml" | "html";
  export type SplitSentences = "nonewlines" | "0" | "1";

  export type Config = {
    formality?: Formality;
    tagHandling?: TagHandling;
    splitSentences?: SplitSentences;
    source_lang?: string;
    ignoreTags?: string;
    preserveFormatting?: "0" | "1";
    ignore?: IgnorePatterns;
    join?: boolean;
  };
  export type Response = [
    {
      translation: string;
      detectedLanguage: string;
      original: string;
    }
  ];
  export type Translator = {
    name: "deepL";
    translate: (input: Input, config?: Config) => Promise<Response>;
    sourceLanguages: () => Promise<[SourceLanguage]>;
    targetLanguages: () => Promise<[TargetLanguage]>;
    usage: () => Promise<UsageResponse>;
  };
}
