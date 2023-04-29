import { Translate } from "../types";

export namespace DeepL {
  type Formality = "default" | "prefer_less" | "prefer_more" | "more" | "less";
  type TagHandling = "xml" | "html";
  type OnOff = "0" | "1";
  type SplitSentences = "nonewlines" | OnOff;

  export interface Options extends Translate.Options {
    target_lang?: string;
    source_lang?: string;
    formality?: Formality;
    tagHandling?: TagHandling;
    splitSentences?: SplitSentences;
    ignoreTags?: string[] | string;
    preserveFormatting?: OnOff;
    outlineDetection?: OnOff;
    nonSplittingTags?: string[] | string;
    splittingTags?: string[] | string;
    glossaryId?: string;
    [key: string]: any;
  }

  export interface Input extends Translate.Input {
    options?: Options;
  }

  export type FetchResponse = {
    translations: { text: string; detected_source_language: string }[];
  };

  export type LanguageResponse = {
    language: string;
    name: string;
    supports_formality?: boolean;
  }[];

  export type UsageResponse = Promise<{
    character_count: number;
    character_limit: number;
  }>;
}
