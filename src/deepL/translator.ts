import { env } from "../env";
const { deepL } = env;
import { DeepLResponse, DeepLTranslator } from "../types/deepl";
import { appendText, appendConfig, setInputText, getOutput } from "./utils";

export function makeDeepL() {
  const baseUrl = deepL.endpoint;

  const endpoints = {
    translate: `/v2/translate`,
    usage: `/v2/usage`,
    languages: `/v2/languages`,
  };

  const headers = {
    Authorization: `DeepL-Auth-Key ${deepL.apiKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const getLanguages = async (type: "source" | "target") => {
    const endpoint = `${endpoints.languages}?type=${type}`;
    const url = new URL(endpoint, baseUrl);
    const response = await fetch(url, { headers });
    const json = await response.json();
    return json;
  };

  return {
    name: "deepL",
    sourceLanguages: async () => await getLanguages("source"),
    targetLanguages: async () => await getLanguages("target"),

    async translate({ text, target, source }, config) {
      try {
        const method = "POST";
        const inputText = setInputText(text, config);

        let params = new URLSearchParams({
          target_lang: target,
          ignore_tags: "ignore",
          tag_handling: "xml",
        });

        if (source) {
          params.append("source_lang", source);
        }
        if (config) {
          params = appendConfig(params, config);
        }

        params = appendText(params, inputText);
        params.delete("ignoreRegex");

        const apiUrl = new URL(endpoints.translate, baseUrl);
        apiUrl.search = params.toString();

        const response = await fetch(apiUrl, { method, headers });
        const data: DeepLResponse = await response.json();

        const output = getOutput(data, inputText);

        return output;
      }
      catch (error) {
        console.error(error);
        return text;
      }
    },

    async usage() {
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
        return error;
      }
    },
  } as DeepLTranslator;
}
