// import { env } from "../../env";
// const { deepL } = env;
// import { DeepLResponse, DeepLTranslator } from "./types";
import { appendText, appendConfig, setInputText, getOutput } from "./utils";

import { DeepL } from "./types";

type DeepLResponse = {
  translations: [{ text: string; detected_source_language: string }];
};

const getConfig = ({
  config,
  source,
  inputText,
  target,
}: {
  config?: DeepL.Config;
  source?: string;
  inputText: string[];
  target: string;
}) => {
  const defaultConfig: DeepL.Config = {
    formality: "default",
    tagHandling: "xml",
    ignoreTags: "ignore",
    splitSentences: "nonewlines",
    preserveFormatting: "0",
    ignore: {
      unicode: ["Emoji_Presentation"],
      regex: [],
    },
  };

  const params = new URLSearchParams({
    ignore_tags: (config?.ignoreTags || defaultConfig.ignoreTags) as string,
    tag_handling: (config?.tagHandling || defaultConfig.tagHandling) as string,
    formality: (config?.formality || defaultConfig.formality) as string,
    split_sentences: (config?.splitSentences ||
      defaultConfig.splitSentences) as string,
    preserve_formatting: (config?.preserveFormatting ||
      defaultConfig.preserveFormatting) as string,
    target_lang: target,
  });

  inputText.forEach((text) => params.append("text", text));

  if (source) {
    params.append("source_lang", source);
    // params.source_lang = source;
  }

  return params;

  // let params = new URLSearchParams({
  //   target_lang: target,
  //   ignore_tags: ignoreTags as string,
  //   tag_handling: tagHandling as DeepL.TagHandling,
  //   formality: formality as DeepL.Formality,
  //   split_sentences: splitSentences as DeepL.SplitSentences,
  //   preserve_formatting: preserveFormatting as string,
  // });
};

export function makeDeepL(apiKey?: string) {
  // const baseUrl = deepL.endpoint;
  const baseUrl = "https://api-free.deepl.com";
  const endpoints = {
    translate: `/v2/translate`,
    usage: `/v2/usage`,
    languages: `/v2/languages`,
  };

  const headers = {
    Authorization: `DeepL-Auth-Key ${apiKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const getLanguages = async (type: "source" | "target") => {
    const endpoint = `${endpoints.languages}?type=${type}`;
    const url = new URL(endpoint, baseUrl);
    const response = await fetch(url, { headers });
    const json = await response.json();
    return json;
  };

  const defaultConfig: DeepL.Config = {
    formality: "default",
    tagHandling: "xml",
    ignoreTags: "ignore",
    splitSentences: "nonewlines",
    preserveFormatting: "0",
    ignore: {
      unicode: [],
      regex: [],
    },
    join: false,
  };

  return {
    name: "deepL",
    sourceLanguages: async () => await getLanguages("source"),
    targetLanguages: async () => await getLanguages("target"),

    async translate(
      { text, target, source }: DeepL.Input,
      config?: DeepL.Config
    ) {
      try {
        const ignore = config?.ignore || defaultConfig.ignore || {};
        const join = config?.join || defaultConfig.join || false;
        // const tagHandling = config?.tagHandling || defaultConfig.tagHandling;
        // const formality = config?.formality || defaultConfig.formality;
        // const ignoreTags = config?.ignoreTags || defaultConfig.ignoreTags;
        // const preserveFormatting =
        //   config?.preserveFormatting || defaultConfig.preserveFormatting;
        // const splitSentences =
        //   config?.splitSentences || defaultConfig.splitSentences;

        const method = "POST";
        const inputText = setInputText(text, ignore);
        const params = getConfig({ config, source, inputText, target });

        console.log("inputText", inputText);

        // let params = new URLSearchParams({
        //   target_lang: target,
        //   ignore_tags: ignoreTags as string,
        //   tag_handling: tagHandling as DeepL.TagHandling,
        //   formality: formality as DeepL.Formality,
        //   split_sentences: splitSentences as DeepL.SplitSentences,
        //   preserve_formatting: preserveFormatting as string,
        // });

        // if (source) {
        //   params.append("source_lang", source);
        // }
        // if (config) {
        //   params = appendConfig(params, config);
        // }

        // params = appendConfig(params, {
        //   formality,
        //   tagHandling,
        //   ignore,
        //   splitSentences,
        // });

        // params = appendText(params, inputText);
        // params.delete("ignoreRegex");

        const apiUrl = new URL(endpoints.translate, baseUrl);
        apiUrl.search = params.toString();

        const response = await fetch(apiUrl, { method, headers });
        const data: DeepLResponse = await response.json();

        const output = getOutput(data, inputText, join);
        return output;
      }
      catch (error: any) {
        const err = new Error(error.message);
        return {
          message: err.message,
          stack: err.stack,
          name: err.name,
        };
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
  };
}
