import type { Microsoft } from "./types";
import type { Translate } from "../types";
import { config } from "dotenv";
import { env } from "../../env";
import { v4 as uuidv4 } from "uuid";
import {
  setSearchParams,
  createLanguageArray,
  getRequestBody,
  getResult,
  parseResponse,
} from "../utils";

config({ path: ".env" });

export function makeMicrosoftTranslator(apiKey?: string) {
  const baseUrl = "https://api.cognitive.microsofttranslator.com";
  const endpoints = {
    detect: "/detect",
    translate: "/translate",
    transliterate: "/transliterate",
    languages: "/languages",
  };

  const headers = {
    "Ocp-Apim-Subscription-Key": apiKey as string,
    "Ocp-Apim-Subscription-Region": env.microsoft.region,
    "Content-type": "application/json",
    "X-ClientTraceId": uuidv4().toString(),
  };

  async function getLanguages(
    scope: "translation" | "transliteration" | "dictionary"
  ) {
    const endpoint = endpoints.languages;
    const url = new URL(endpoint, baseUrl);
    const params = new URLSearchParams({
      "api-version": "3.0",
      scope: scope,
    });

    url.search = params.toString();

    try {
      const response = await fetch(url);
      const data = await response.json();
      return data[scope];
    }
    catch (error) {
      console.error(error);
    }
  }

  const getURL = async ({ target, source, options }: Microsoft.Input) => {
    const url = new URL(endpoints.translate, baseUrl);
    const languages = await getLanguages("transliteration");
    const languageArray = createLanguageArray(languages);
    const scripts = languageArray.find(
      (item: any) => item.languageCode === target
    );

    const params = setSearchParams({
      "api-version": "3.0",
      from: source,
      to: target,
      fromScript: scripts?.scripts[0],
      toScript: scripts?.scripts[1],
      textType: options?.ignore ? "html" : undefined,
      ...options,
    });

    url.search = params.toString();

    return url;
  };

  return {
    name: "microsoft",
    languages: {
      async translation(): Promise<Microsoft.Language.Translation> {
        return await getLanguages("translation");
      },
      async transliteration(): Promise<Microsoft.Language.Response> {
        const obj = await getLanguages("transliteration");
        return createLanguageArray(obj);
      },
      async dictionary(): Promise<Microsoft.Language.Dictionary> {
        return await getLanguages("dictionary");
      },
    },

    async translate({
      text,
      target,
      source,
      options,
    }: Microsoft.Input): Promise<Translate.Output> {
      const url = await getURL({ text, target, source, options });
      const requestBody = getRequestBody(text, options);
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      const json = await response.json();
      const translations = parseResponse.microsoft(json);
      const result = await getResult(translations, text, options);

      return result;
    },
  };
}
