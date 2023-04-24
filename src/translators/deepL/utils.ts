// import { DeepLConfig, DeepLResponse } from "../../src/types/deepl";
// import type { DeepLConfig, DeepLResponse } from "./types";
import type { DeepL } from "./types";

type DeepLResponse = {
  translations: [{ text: string; detected_source_language: string }];
};

export const appendConfig = (params: URLSearchParams, config: DeepL.Config) => {
  Object.entries(config).forEach(([ key, value ]) => {
    params.append(key, value as string);
  });
  return params;
};

export const appendText = (params: URLSearchParams, text: string[]) => {
  text.forEach((t) => params.append("text", t));
  return params;
};

const removeExtraSpaces = (text: string[]) => {
  return text.map((t) => t.replace(/\s+/g, " ").trim());
};

const setTextArray = (text: string | string[]) => {
  return removeExtraSpaces(Array.isArray(text) ? text : [text]);
};

const setIgnoreUnicodes = (unicodes: string[]) => {
  return [...new Set([ ...unicodes, "Extended_Pictographic" ])]
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

const setIgnoreTags = (tags: RegExp[], texts: string[]) => {
  const result: string[] = [];
  texts.forEach((text) => {
    tags.forEach((tag) => {
      const matches = text.match(tag);
      matches?.forEach((match) => {
        text = text.replace(match, `<ignore>${match}</ignore>`);
      });
    });
    result.push(text);
  });
  return result;
};

export const setInputText = (
  text: string | string[],
  ignore: DeepL.IgnorePatterns
  // config?: DeepL.Config
) => {
  const textArray = setTextArray(text);
  const unicodes = ignore?.unicode || [];
  const regexes = ignore?.regex || [];

  const ignoreUnicodes = setIgnoreUnicodes(unicodes) as RegExp[];
  const ignoreRegexes = setIgnoreRegexes(regexes) as RegExp[];

  const ignoreTags = [ ...ignoreUnicodes, ...ignoreRegexes ];
  const inputText = setIgnoreTags(ignoreTags, textArray);

  return inputText;
};

const replaceIgnore = (input: string) => {
  return input.replace(/<\/?ignore>/g, "");
};

export const getOutput = (
  data: DeepLResponse,
  inputText: string[],
  join: boolean
) => {
  if (join) {
    return data.translations
      .map((obj, i) => {
        return replaceIgnore(obj.text);
      })
      .join(" ");
  }

  const result = data.translations.map((obj, i) => {
    return {
      translation: replaceIgnore(obj.text),
      detectedLanguage: obj.detected_source_language,
      original: replaceIgnore(inputText[i]),
    };
  });

  return result;
};
