import { env } from "../../env";
import { Google } from "./types";
import {
  setIgnoreTags,
  parseResponse,
  makePostRequester,
  makeGetRequester,
} from "../utils";

export function makeV2Translator(apiKey: string) {
  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const sendPostRequest = makePostRequester(headers);
  const sendGetRequest = makeGetRequester(headers);

  const getUrl = (endpoint: "translate" | "detect" | "languages") => {
    const baseUrl = env.google.v2.baseUrl;
    const endpoints = env.google.v2.endpoints;

    const url = new URL(endpoints[endpoint], baseUrl);
    const params = new URLSearchParams({ key: apiKey as string });

    url.search = params.toString();

    return url;
  };

  const translateEndpoint = getUrl("translate");
  const detectEndpoint = getUrl("detect");
  const languagesEndpoint = getUrl("languages");

  return {
    name: "google",
    version: "v2",

    async translate({ text, target, source, options }: Google.Input) {
      text = Array.isArray(text) ? text : [text];
      const textArray = setIgnoreTags(text, options);

      const body = JSON.stringify({ q: textArray, target, source });
      const response = await sendPostRequest(translateEndpoint, body);

      const translations = parseResponse.google(response, text, options);
      return translations;
    },

    async detectLanguage({ text }: Google.DetectInput) {
      try {
        const body = JSON.stringify({ q: text });
        const response = await sendPostRequest(detectEndpoint, body);
        return response;
      }
      catch (error) {
        console.error(error);
      }
    },

    async getLanguages(target: string = "en") {
      languagesEndpoint.searchParams.set("target", target);

      try {
        const response = await sendGetRequest(languagesEndpoint);
        const languages = response.data.languages;
        return languages;
      }
      catch (error) {
        console.error(error);
      }
    },
  };
}
