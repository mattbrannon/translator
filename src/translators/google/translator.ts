import { makeV2Translator } from "./v2";
import { makeV1Translator } from "./v1";

export function makeGoogleTranslator(apiKey?: string) {
  return typeof apiKey === "string"
    ? makeV2Translator(apiKey)
    : makeV1Translator();
}
