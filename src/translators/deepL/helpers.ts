import type { DeepL } from "./types";
import { makeDeepLFormatter } from "../utils";

const requiresTags = (options: DeepL.Options) => {
  return !!(options?.ignore?.regex?.length || options?.ignore?.unicode?.length);
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
  console.log({ tags });

  return tags;
};

export const setRequestBody = (input: DeepL.Input) => {
  const customKeys = [ "ignore", "join" ];
  const options = input.options as DeepL.Options;

  const formatText = makeDeepLFormatter(options);
  const inputText = formatText(input.text);
  const tagHandling = setTagHandling(options);
  const ignoreTags = setIgnoreTags(options);

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
