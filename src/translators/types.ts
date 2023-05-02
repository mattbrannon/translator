export namespace Translate {
  export type IgnorePatterns = {
    unicode?: string[];
    regex?: RegExp[];
  };

  export interface Options {
    ignore?: IgnorePatterns;
    join?: boolean;
  }

  export interface Input {
    text: string | string[];
    target: string;
    source?: string;
    options?: Options;
  }

  export type Response = {
    translation: string;
    detectedLanguage: string;
    original?: string;
    transliteration?: string | null;
  };

  export type ServiceName = "google" | "deepL" | "microsoft";
  export type Output = Promise<Response[] | string>;
}
