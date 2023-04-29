import { Translate } from "./types";
import type { DeepL } from "./deepL/types";
import type { Microsoft } from "./microsoft/types";

const removeExtraSpaces = (text: string[]) => {
  return text.map((t) => t.replace(/\s+/g, " ").trim());
};

const setTextArray = (text: string | string[]) => {
  return removeExtraSpaces(Array.isArray(text) ? text : [text]);
};

const setIgnoreUnicodes = (unicodes: string[]) => {
  // [...new Set([ ...unicodes, "Extended_Pictographic" ])]
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

const setIgnoreTags = (tags: RegExp[], texts: string[], name: string) => {
  const result: string[] = [];
  texts.forEach((text) => {
    tags.forEach((tag) => {
      const matches = text.match(tag);
      matches?.forEach((match) => {
        const markup =
          name === "deepl"
            ? `<ignore>${match}</ignore>`
            : `<span class="notranslate">${match}</span>`;
        text = text.replace(match, markup);
      });
    });
    result.push(text);
  });
  return result;
};

const removeTags = (text: string) => {
  return text
    ?.replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

export const setInputText = (
  text: string | string[],
  ignore: Translate.IgnorePatterns = {},
  name: string
) => {
  const textArray = setTextArray(text);
  const unicodes = ignore?.unicode || [];
  const regexes = ignore?.regex || [];

  const ignoreUnicodes = setIgnoreUnicodes(unicodes) as RegExp[];
  const ignoreRegexes = setIgnoreRegexes(regexes) as RegExp[];

  const ignoreTags = [ ...ignoreUnicodes, ...ignoreRegexes ];
  const inputText = setIgnoreTags(ignoreTags, textArray, name);

  console.log("inputText", inputText);

  return inputText;
};

export const getRequestBody = (
  text: string | string[],
  options?: Microsoft.Options
) => {
  return setInputText(text, options?.ignore, "microsoft").map((text) => ({
    text,
  }));
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

const parseMicrosoftResponse = (json: Microsoft.FetchResponse) => {
  return json.map((item: any, i: number) => {
    return {
      translation: removeTags(item.translations[0].text),
      transliteration:
        removeTags(item.translations[0]?.transliteration?.text) || null,
      detectedLanguage: item.detectedLanguage.language as string,
      original: "",
    };
  });
};

const parseDeepLResponse = (json: DeepL.FetchResponse) => {
  const translations = json.translations.map((t, i) => {
    return {
      detectedLanguage: t.detected_source_language,
      translation: t.text.replace(/<\/?ignore>/g, "").trim(),
      original: "",
    };
  });
  return translations;
};

export const parseResponse = {
  deepL(json: DeepL.FetchResponse) {
    const translations = parseDeepLResponse(json);
    return translations;
  },
  microsoft(json: Microsoft.FetchResponse) {
    const translations = parseMicrosoftResponse(json);
    return translations;
  },
};

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

export const getResult = async (
  translations: Translate.Response[],
  text: string | string[],
  options?: DeepL.Options | Microsoft.Options
) => {
  const originalText = Array.isArray(text) ? text : [text];

  const result = options?.join
    ? translations.map((t) => t.translation).join(" ")
    : translations.map((translation, i) => {
      translation.original = originalText[i];
      return translation;
    });

  return result;
};
