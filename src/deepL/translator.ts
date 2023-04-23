import { env } from "../env";
const { deepL } = env;
import { DeepLTranslator } from "../types/deepl";

export function makeDeepL(): DeepLTranslator {
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

    async translate({ text, target, source }, config) {},
  };
}
