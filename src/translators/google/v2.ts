import { env } from "../../env";
import { Translate } from "../types";
import { setIgnoreTags, removeTags } from "../utils";

type DetectInput = {
  text: string | string[];
};

type GoogleV2Response = {
  translatedText: string;
  detectedSourceLanguage: string;
};

const parseResponse = async (response: Response) => {
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
    const json = await parseResponse(response);
    return json;
  }
  catch (error) {
    throw error;
  }
};

const sendPostRequest = async (url: URL, body: string) => {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const method = "POST";
  const config = { method, headers, body };
  const response = await sendRequest(url, config);

  return response;
};

const sendGetRequest = async (url: URL) => {
  const method = "GET";
  const config = { method };
  const response = await sendRequest(url, config);

  return response;
};

const getTranslationObject = (
  translations: GoogleV2Response[],
  text: string[]
) => {
  const result = translations.map((item, index) => {
    return {
      translation: removeTags(item.translatedText),
      original: text[index],
      detectedLanguage: item.detectedSourceLanguage,
    };
  });
  return result;
};

const joinTranslations = (translations: GoogleV2Response[]) => {
  const result = translations
    .map((item) => removeTags(item.translatedText))
    .join(" ");
  return result;
};

export function makeV2Translator(apiKey?: string) {
  const getUrl = (endpoint: "translate" | "detect" | "languages") => {
    const baseUrl = env.google.endpoint;
    const endpoints = {
      translate: "/language/translate/v2",
      detect: "/language/translate/v2/detect",
      languages: "/language/translate/v2/languages",
    };

    const url = new URL(endpoints[endpoint], baseUrl);
    const params = new URLSearchParams({ key: apiKey as string });

    url.search = params.toString();

    return url;
  };

  return {
    name: "google",
    async translate({ text, target, source, options }: Translate.Input) {
      text = Array.isArray(text) ? text : [text];

      const url = getUrl("translate");
      const textArray = setIgnoreTags(text, options);

      const body = JSON.stringify({ q: textArray, target, source });
      const response = await sendPostRequest(url, body);
      const translations = response.data.translations;

      const result = options?.join
        ? joinTranslations(translations)
        : getTranslationObject(translations, text);

      return result;
    },

    async detectLanguage({ text }: DetectInput) {
      try {
        const url = getUrl("detect");
        const body = JSON.stringify({ q: text });
        const response = await sendPostRequest(url, body);
        return response;
      }
      catch (error) {
        console.error(error);
      }
    },

    async getLanguages({ target = "en" }) {
      const url = getUrl("languages");
      url.searchParams.append("target", target);
      try {
        const response = await sendGetRequest(url);
        const {
          data: { languages },
        } = response;

        return languages;
      }
      catch (error) {
        console.error(error);
      }
    },
  };
}
