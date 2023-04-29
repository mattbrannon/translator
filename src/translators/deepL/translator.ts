import type { DeepL } from "./types";
import type { Translate } from "../types";
import {
  setSearchParams,
  setInputText,
  parseResponse,
  getResult,
} from "../utils";

export function makeDeepL(apiKey?: string) {
  const baseUrl = "https://api-free.deepl.com";
  const endpoints = {
    translate: `/v2/translate`,
    usage: `/v2/usage`,
    languages: `/v2/languages`,
  };

  const headers = {
    Authorization: `DeepL-Auth-Key ${apiKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const getLanguages = async (type: "source" | "target") => {
    const endpoint = `${endpoints.languages}?type=${type}`;
    const url = new URL(endpoint, baseUrl);
    const response = await fetch(url, { headers });
    const json = await response.json();
    return json;
  };

  const getURL = ({ text, target, source, options }: DeepL.Input) => {
    const url = new URL(endpoints.translate, baseUrl);

    const hasRegex = () => {
      return !!(
        options?.ignore?.regex?.length || options?.ignore?.unicode?.length
      );
    };

    const setTags = () => {
      if (!hasRegex()) return;

      const ignoreTags = Array.isArray(options?.ignoreTags)
        ? [ ...(options?.ignoreTags as []), "ignore" ]
        : [ options?.ignoreTags, "ignore" ];

      const tags = [...new Set(ignoreTags.filter((v) => v))];
      console.log({ tags });

      return tags;
      // return [...new Set(ignoreTags.filter((v) => v))];
    };

    const snakeCasedOptions = Object.fromEntries(
      Object.entries(options || {}).map(([ k, v ]) => [
        k.replace(/([A-Z])/g, "_$1").toLowerCase(),
        v,
      ])
    );

    const params = setSearchParams({
      ...snakeCasedOptions,
      source_lang: source,
      target_lang: target,
      tag_handling: "xml",
      ignore_tags: "ignore",
      text: setInputText(text, options?.ignore, "deepl"),
    });

    url.search = params.toString();

    return url;
  };

  return {
    name: "deepL",
    languages: {
      async source(): Promise<DeepL.LanguageResponse> {
        return await getLanguages("source");
      },
      async target(): Promise<DeepL.LanguageResponse> {
        return await getLanguages("target");
      },
    },

    async translate({
      text,
      target,
      source,
      options,
    }: DeepL.Input): Translate.Output {
      try {
        const method = "POST";
        const url = getURL({ text, target, source, options });

        const response = await fetch(url, { method, headers, body: null });

        const json: DeepL.FetchResponse = await response.json();
        const translations = parseResponse.deepL(json);
        const result = getResult(translations, text, options);

        return result;
      }
      catch (error) {
        const e = error as Error;
        throw new Error(e.message);
      }
    },

    /**
     * Checks the current usage of the DeepL API key.
     * @async @function
     * @returns {DeepL.UsageResponse} Returns an object containing the current usage of the DeepL API key.
     * @throws {Error} Throws an error if there was an issue with the request.
     *
     * @example <caption>Get the current usage of the DeepL API key.</caption>
     * const usage = await deepL.usage();
     * console.log(usage);
     * // {
     * //   character_count: 0,
     * //   character_limit: 5000000,
     * // }
     */

    async usage(): DeepL.UsageResponse {
      const method = "GET";
      const endpoint = endpoints.usage;
      try {
        const url = new URL(endpoint, baseUrl);
        const response = await fetch(url, { method, headers });
        const json = await response.json();
        return json;
      }
      catch (error) {
        console.error(error);
        const e = error as Error;
        throw new Error(e.message);
      }
    },
  };
}

// type DeepLResponse = {
//   translations: [{ text: string; detected_source_language: string }];
// };

// const camelToSnake = (str: string) => {
//   return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
// };

// const setJsonBody = (options: DeepL.Options) => {
//   const customKeys = new Set([ "ignore", "join" ]);
//   const json = Object.keys(options).reduce((body, key) => {
//     const value = options[key];
//     if (value !== undefined && !customKeys.has(key)) {
//       body[camelToSnake(key)] = value;
//     }
//     return body;
//   }, {} as DeepL.RequestBody);

//   return json;
// };

// const removeExtraSpaces = (text: string[]) => {
//   return text.map((t) => t.replace(/\s+/g, " ").trim());
// };

// const setTextArray = (text: string | string[]) => {
//   return removeExtraSpaces(Array.isArray(text) ? text : [text]);
// };

// const options: Options = {
//   target_lang: "EN",
//   source_lang: "DE",
//   formality: "prefer_less",
//   tagHandling: "xml",
//   splitSentences: "nonewlines",
//   ignoreTags: ["ignore"],
//   preserveFormatting: "0",
// };

// const getRequestBody = ({ text, target, source, options }: DeepL.Input) => {
//   const json = setJsonBody({
//     ...options,
//     source_lang: source,
//   } as DeepL.Options);

//   const textArray = setInputText(text, options?.ignore);
//   const body = { ...json, text: textArray, target_lang: target };
//   return JSON.stringify(body);
// };

// const setDeepLSearchParams = (options: DeepL.Options) => {
//   const customKeys = new Set([ "ignore", "join" ]);
//   const params = new URLSearchParams();
//   Object.keys(options).forEach((key) => {
//     const value = options[key];
//     const k = camelToSnake(key);
//     if (!customKeys.has(key) && value !== undefined) {
//       if (Array.isArray(value)) {
//         value.forEach((item) => {
//           params.append(k, item);
//         });
//       }
//       else {
//         params.set(k, value);
//       }
//     }
//   });
//   return params;
// };

// const getTranslation = (json: DeepLResponse) => {
//   const translations = json.translations.map((t) => {
//     return {
//       detectedLanguage: t.detected_source_language,
//       translation: t.text.replace(/<\/?ignore>/g, "").trim(),
//     };
//   });
//   return translations;
// };

// const getOriginal = (text: string[]) => {
//   return text.map((t) => t.replace(/<\/?ignore>/g, "").trim());
// };

// const getTranslationWithOriginal = (json: DeepLResponse, text: string[]) => {
//   const translations = json.translations.map((t, i) => {
//     return {
//       detectedLanguage: t.detected_source_language,
//       translation: t.text.replace(/<\/?ignore>/g, "").trim(),
//       original: text[i].replace(/<\/?ignore>/g, "").trim(),
//     };
//   });
//   return translations;
// };
