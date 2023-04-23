import { DeepLTranslator } from "../types/deepl";

export function makeDeepL(): DeepLTranslator {
  return {
    name: "deepL",
    sourceLanguages: async () => {},
    targetLanguages: async () => {},
    async translate({ text, target, source }, config) {},
    async usage() {},
  };
}
