export namespace Translate {
  export interface Options {
    ignore?: RegExp[];
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
    original: string;
    transliteration?: string | null;
  }[];

  export type ServiceName = "google" | "deepL" | "microsoft";
  // export type Output = Promise<Response | string>;

  export type Output<T extends boolean = false> = Promise<
    T extends true ? string : Response
  >;
}
