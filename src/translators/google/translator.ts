import { makeV2Translator } from "./v2";
import { makeV1Translator } from "./v1";
import { env } from "../../env";

export const makeGoogleTranslator = (apiKey?: string) => {
  const secretKey = apiKey || env.google.apiKey;
  return secretKey ? makeV2Translator(secretKey) : makeV1Translator();
};
