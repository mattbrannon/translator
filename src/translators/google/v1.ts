import { Google } from "./types";
import { env } from "../../env";
import { sendGetRequest } from "../utils";

async function googleTranslate({ text, target, source }: Google.Input) {
  const result = Array.isArray(text)
    ? await translateArray({ text, target, source })
    : await translateString({ text, target, source });

  return result;
}

function buildUrl({ text, target, source = "detect" }: Google.Input) {
  const baseUrl = env.google.v1.baseUrl;
  const endpoint = env.google.v1.endpoints.translate;
  const params = {
    client: "gtx",
    dt: "t",
    sl: source,
    tl: target,
    q: text as string,
  };

  const url = new URL(endpoint, baseUrl);
  url.search = new URLSearchParams(params).toString();
  return url;
}

async function translateString(input: Google.Input) {
  const endpoint = buildUrl(input);
  const response: Google.V1FetchResponse = await sendGetRequest(endpoint);

  const [[[ translation, original ]], _, detectedLanguage ] = response;
  return [
    {
      translation,
      original,
      detectedLanguage,
    },
  ];
}

async function translateArray(input: {
  text: string[];
  target: string;
  source?: string;
}): Promise<Google.Output> {
  const { text, target, source } = input;
  return (
    await Promise.all(
      text.map((text) => googleTranslate({ text, target, source }))
    )
  ).flat(Infinity) as [];
}

export const makeV1Translator = () => {
  return {
    name: "google",
    version: "v1",
    async translate(input: Google.Input) {
      if (input.options) {
        console.warn(
          "options are not supported in this version of the Google translator."
        );
      }
      return googleTranslate(input);
    },
    getLanguages() {
      return "getLanguages() is not supported in this version of the Google translator.";
    },
    detectLanguage() {
      return "detectLanguage() is not supported in this version of the Google translator.";
    },
  };
};
