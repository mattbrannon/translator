import type { DeepL } from "./types";
import { makeDeepLFormatter } from "../utils";

const requiresTags = (options: DeepL.Options) => {
  return !!options?.ignore?.length;
};

const setTagHandling = (options: DeepL.Options) => {
  const tagHandling = requiresTags(options) ? "html" : options?.tagHandling;
  return tagHandling;
};

const setIgnoreTags = (options: DeepL.Options) => {
  if (!requiresTags(options)) return;

  const ignoreTags = Array.isArray(options.ignoreTags)
    ? [ ...options.ignoreTags, "ignore" ]
    : [ options.ignoreTags, "ignore" ];

  const tags = [...new Set(ignoreTags.filter((v) => v))];

  return tags;
};

const checkTarget = (input: DeepL.Input) => {
  if (input.target === "en" || input.target === "EN") {
    console.warn(
      `DeepL does not support EN as a target language. Please use either EN-US or EN-GB instead.
      Using EN-US as default.
      See https://www.deepl.com/docs-api/translating-text/request/ for more information.
      `
    );
    input.target = "en-us";
  }

  if (input.target === "pt" || input.target === "PT") {
    console.warn(
      `DeepL does not support PT as a target language. Please use either PT-PT or PT-BR instead.
      Using PT-PT as default.
      See https://www.deepl.com/docs-api/translating-text/request/ for more information.
      `
    );
    input.target = "pt-pt";
  }
};

export const setRequestBody = (input: DeepL.Input) => {
  const customKeys = [ "ignore", "join" ];
  const options = input.options as DeepL.Options;

  const formatText = makeDeepLFormatter(options);
  const inputText = formatText(input.text);
  const tagHandling = setTagHandling(options);
  const ignoreTags = setIgnoreTags(options);

  checkTarget(input);

  const config = {
    ...options,
    ...inputText,
    targetLang: input.target,
    sourceLang: input.source,
    tagHandling,
    ignoreTags,
  };

  const requestBody = Object.fromEntries(
    Object.entries(config)
      .filter(([ k, v ]) => !customKeys.includes(k) && v)
      .map(([ k, v ]) => {
        return [ k.replace(/([A-Z])/g, "_$1").toLowerCase(), v ];
      })
  );

  return requestBody;
};
