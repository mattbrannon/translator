import type { Microsoft } from "./types";
import { env } from "../../env";
import { v4 as uuidv4 } from "uuid";
import {
  setSearchParams,
  createLanguageArray,
  parseResponse,
  makeMicrosoftFormatter,
  makePostRequester,
  makeGetRequester,
} from "../utils";

export function makeMicrosoftTranslator(apiKey?: string) {
  const secretKey = apiKey || env.microsoft.apiKey;

  if (!secretKey) return;

  const baseUrl = env.microsoft.baseUrl;
  const endpoints = env.microsoft.endpoints;

  const headers = new Headers({
    "Ocp-Apim-Subscription-Key": secretKey,
    "Ocp-Apim-Subscription-Region": env.microsoft.region,
    "Content-type": "application/json",
    "X-ClientTraceId": uuidv4().toString(),
  });

  const sendPostRequest = makePostRequester(headers);
  const sendGetRequest = makeGetRequester(headers);

  const params = new URLSearchParams({ "api-version": "3.0" });

  async function getLanguages(
    scope: "translation" | "transliteration" | "dictionary"
  ) {
    const url = new URL(endpoints.languages, baseUrl);
    params.set("scope", scope);
    url.search = params.toString();

    try {
      const response = await sendGetRequest(url);
      return response[scope];
    }
    catch (error) {
      console.error(error);
    }
  }

  const getScripts = async (target: string) => {
    const languages = await getLanguages("transliteration");
    const languageArray = createLanguageArray(languages);
    const scripts = languageArray.find(
      (item: any) => item.languageCode === target
    );

    return scripts;
  };

  const getURL = async ({ target, source, options }: Microsoft.Input) => {
    const url = new URL(endpoints.translate, baseUrl);
    const scripts = await getScripts(target);

    const getTextType = () => {
      const requiresTags = !!(
        options?.ignore?.regex?.length || options?.ignore?.unicode?.length
      );
      return requiresTags ? "html" : options?.textType;
    };

    const params = setSearchParams({
      "api-version": "3.0",
      from: source,
      to: target,
      fromScript: scripts?.scripts[0],
      toScript: scripts?.scripts[1],
      textType: getTextType(),
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

    async translate(input: Microsoft.Input): Microsoft.Output {
      const text = Array.isArray(input.text) ? input.text : [input.text];
      const options = input.options || {};

      const formatText = makeMicrosoftFormatter(options);

      const requestBody = formatText(text);
      const body = JSON.stringify(requestBody);

      const url = await getURL(input);
      const response = await sendPostRequest(url, body);

      const translations = parseResponse.microsoft(response, text, options);
      return translations;
    },
  };
}
