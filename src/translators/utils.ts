import { Translate } from "./types";
import type { DeepL } from "./deepL/types";
import type { Microsoft } from "./microsoft/types";

// const removeExtraSpaces = (text: string[]) => {
//   return text.map((t) => t.replace(/\s+/g, " ").trim());
// };

const setIgnoreUnicodes = (unicodes: string[]) => {
  return [...new Set([...unicodes])]
    .map((unicode) => {
      try {
        return new RegExp(`\\p{${unicode}}`, "gu");
      }
      catch {
        return null;
      }
    })
    .filter((v) => v);
};

const setIgnoreRegexes = (regexes: RegExp[]) => {
  return regexes
    .map((regex) => {
      try {
        return regex instanceof RegExp ? regex : new RegExp(regex, "g");
      }
      catch {
        return null;
      }
    })
    .filter((v) => v);
};

const setTextArray = (text: string | string[]) => {
  text = Array.isArray(text) ? text : [text];
  const textArray = text.map((str) => str.replace(/\s+/g, " ").trim());
  return textArray;
};

export const setIgnoreTags = (
  text: string | string[],
  options?: Translate.Options
) => {
  return setTextArray(text).map((str) => {
    const regex = options?.ignore?.regex || [];
    const unicodes = options?.ignore?.unicode || [];
    const expressions = [
      ...setIgnoreUnicodes(unicodes),
      ...setIgnoreRegexes(regex),
    ];
    expressions.forEach((regex) => {
      const matches = [...new Set(str.match(regex as RegExp))];

      matches?.forEach((match) => {
        const re = new RegExp(match, "g");
        const markup =
          // @ts-ignore
          options?.tagHandling === "xml"
            ? `<ignore>${match}</ignore>`
            : `<span class="notranslate">${match}</span>`;
        str = str.replace(re, markup);
      });
    });
    return str;
  });
};

export const removeTags = (text: string) => {
  return text
    .replace(/\s(?=\p{P})|<\/?[^>]+(>|$)/gu, "") // replace tags and any whitespace before punctuation
    .replace(/\s+/g, " ")
    .trim();
};

export const getRequestBody = (
  text: string | string[],
  options?: Microsoft.Options
) => {
  const textArray = setIgnoreTags(text, options).map((text) => ({ text }));
  return JSON.stringify(textArray);
};

export const setSearchParams = (options: DeepL.Options | Microsoft.Options) => {
  const customKeys = new Set([ "ignore", "join" ]);
  const params = new URLSearchParams();
  Object.keys(options).forEach((key) => {
    const value = options[key];
    if (!customKeys.has(key) && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          params.append(key, item);
        });
      }
      else {
        params.set(key, value);
      }
    }
  });
  return params;
};

type GoogleV2Response = {
  data: {
    translations: {
      translatedText: string;
      detectedSourceLanguage: string;
    }[];
  };
};

const joinTranslations = (translations: Translate.Response) => {
  const result = translations
    .map((item) => removeTags(item.translation))
    .join(" ");
  return result;
};

const formatMicrosoftResponse = (
  json: Microsoft.FetchResponse,
  text: string[]
) => {
  return json.map((item: any, i: number) => {
    return {
      translation: removeTags(item.translations[0].text),
      transliteration:
        removeTags(item.translations[0]?.transliteration?.text) || null,
      detectedLanguage: item.detectedLanguage.language as string,
      original: text[i],
    };
  });
};

const parseMicrosoftResponse = (
  json: Microsoft.FetchResponse,
  text: string[],
  options?: Translate.Options
) => {
  const translations = formatMicrosoftResponse(json, text);
  return options?.join ? joinTranslations(translations) : translations;
};

export const formatDeepLResponse = (
  json: DeepL.FetchResponse,
  text: string[]
) => {
  const translations = json.translations.map((t, i) => {
    return {
      detectedLanguage: t.detected_source_language,
      translation: removeTags(t.text), //replace(/<\/?ignore>/g, "").trim(),
      original: text[i],
    };
  });
  return translations;
};

const parseDeepLResponse = (
  json: DeepL.FetchResponse,
  text: string[],
  options?: Translate.Options
) => {
  const translations = formatDeepLResponse(json, text);
  return options?.join ? joinTranslations(translations) : translations;
};

const formatGoogleResponse = (json: GoogleV2Response, text: string[]) => {
  return json.data.translations.map((item, index) => {
    return {
      translation: removeTags(item.translatedText),
      original: text[index],
      detectedLanguage: item.detectedSourceLanguage,
    };
  });
};

const parseGoogleResponse = (
  json: GoogleV2Response,
  text: string[],
  options?: Translate.Options
) => {
  const translations = formatGoogleResponse(json, text);
  return options?.join ? joinTranslations(translations) : translations;
};

export const parseResponse = {
  deepL(
    json: DeepL.FetchResponse,
    text: string[],
    options?: Translate.Options
  ) {
    const translations = parseDeepLResponse(json, text, options);
    return translations;
  },
  microsoft(
    json: Microsoft.FetchResponse,
    text: string[],
    options?: Translate.Options
  ) {
    const translations = parseMicrosoftResponse(json, text, options);
    return translations;
  },
  google(json: GoogleV2Response, text: string[], options?: Translate.Options) {
    const translations = parseGoogleResponse(json, text, options);
    return translations;
  },
};

export const formatInputText = (text: string | string[]) => {
  const textArray = Array.isArray(text) ? text : [text];

  return {
    google: () => textArray,
    deepL: () => ({ text: textArray }),
    microsoft: () => textArray.map((text) => ({ text })),
  };
};

export const makeTextFormatter =
  (name: string) =>
    (options: Translate.Options) =>
      (text: string | string[]) => {
        const textArray = Array.isArray(text) ? text : [text];
        const taggedText = setIgnoreTags(textArray, options);
        const getInputText = formatInputText(taggedText);

        const inputText = getInputText[name as Translate.ServiceName]();
        return inputText;
      };

export const makeDeepLFormatter = makeTextFormatter("deepL");
export const makeGoogleFormatter = makeTextFormatter("google");
export const makeMicrosoftFormatter = makeTextFormatter("microsoft");

export function createLanguageArray(obj: Microsoft.Language.Response) {
  const languageArray = [];

  for (const key in obj) {
    const name = obj[key].name;
    const codes = obj[key].scripts;
    const isDuplex = codes.length > 1;
    const scripts = [ codes[0].code, codes[0].toScripts[0].code ];

    const languageObj = {
      languageName: name,
      languageCode: key,
      isDuplex,
      scripts,
    };

    languageArray.push(languageObj);
  }

  return languageArray;
}

const parseFetchResponse = async (response: Response) => {
  const { status, statusText } = response;
  const json = await response.json();

  if (status >= 200 && status < 300) {
    return json;
  }
  else {
    const error = new Error(statusText);
    throw error;
  }
};

const sendRequest = async (url: URL, config: RequestInit) => {
  try {
    const response = await fetch(url, config);
    const json = await parseFetchResponse(response);
    return json;
  }
  catch (error) {
    throw error;
  }
};

export const sendGetRequest = async (url: URL) => {
  const method = "GET";
  const config = { method };
  const response = await sendRequest(url, config);

  return response;
};

export const makePostRequester = (headers: Headers) => {
  return async (url: URL, body: string) => {
    const method = "POST";
    const config = { method, headers, body };
    const response = await sendRequest(url, config);

    return response;
  };
};

export const makeGetRequester = (headers: Headers) => {
  return async (url: URL) => {
    const method = "GET";
    const config = { method, headers };
    const response = await sendRequest(url, config);

    return response;
  };
};
