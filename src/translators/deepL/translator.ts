import type { DeepL } from "./types";
import { parseResponse, makePostRequester, makeGetRequester } from "../utils";
import { setRequestBody } from "./helpers";
import { env } from "../../env";

export function makeDeepL(apiKey?: string) {
  const secretKey = apiKey || env.deepL.apiKey;

  if (!secretKey) return;

  const baseUrl = env.deepL.baseUrl;
  const endpoints = env.deepL.endpoints;

  const headers = new Headers({
    Authorization: `DeepL-Auth-Key ${secretKey}`,
    "Content-Type": "application/json",
  });

  const sendPostRequest = makePostRequester(headers);
  const sendGetRequest = makeGetRequester(headers);

  const getLanguages = async (type: "source" | "target") => {
    const endpoint = `${endpoints.languages}?type=${type}`;
    const url = new URL(endpoint, baseUrl);
    return await sendGetRequest(url);
  };

  return {
    name: "deepL",

    async sourceLanguages() {
      return await getLanguages("source");
    },
    async targetLanguages() {
      return await getLanguages("target");
    },

    async translate(input: DeepL.Input): DeepL.Output {
      try {
        const text = Array.isArray(input.text) ? input.text : [input.text];
        const body = JSON.stringify(setRequestBody({ ...input, text }));

        const url = new URL(endpoints.translate, baseUrl);
        const response = await sendPostRequest(url, body);
        const translations = parseResponse.deepL(response, text, input.options);

        return translations;
      }
      catch (error) {
        const e = error as Error;
        throw new Error(e.message);
      }
    },

    async usage(): DeepL.UsageResponse {
      try {
        const url = new URL(endpoints.usage, baseUrl);
        return await sendGetRequest(url);
      }
      catch (error) {
        console.error(error);
        const e = error as Error;
        throw new Error(e.message);
      }
    },
  };
}
