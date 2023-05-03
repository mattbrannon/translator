import { Translate } from "../types";

export namespace Microsoft {
  export interface Options extends Translate.Options {
    from?: string;
    fromScript?: string;
    toScript?: string;
    textType?: string | undefined;
    category?: string;
    profanityAction?: string;
    profanityMarker?: string;
    allowFallback?: boolean;
    includeSentenceLength?: boolean;
    includeAlignment?: boolean;
    suggestedFrom?: string;
    [key: string]: any;
  }

  export interface Input extends Translate.Input {
    options?: Options;
  }

  export type Output = Translate.Output;

  export type FetchResponse = {
    detectedLanguage: {
      language: string;
      score: number;
    };
    translations: {
      text: string;
      to: string;
    }[];
  }[];

  export namespace Language {
    export type Translation = {
      [key: string]: {
        name: string;
        nativeName: string;
        dir: "ltr" | "rtl";
      };
    };

    export type Scripts = {
      code: string;
      nativeName: string;
      name: string;
      dir: "ltr" | "rtl";
      toScripts?: Scripts[];
    };

    export type Dictionary = {
      [key: string]: any;
    };

    export type Transliteration = {
      [key: string]: {
        name: string;
        nativeName: string;
        scripts: Scripts[];
      };
    };

    export type Response = Translation | Dictionary | Transliteration;
  }
}