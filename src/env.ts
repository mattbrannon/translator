import { config } from "dotenv";
config();

export const env = {
  deepL: {
    apiKey: process.env.DEEPL_API_KEY,
    baseUrl: process.env.DEEPL_API_KEY?.endsWith(":fx")
      ? "https://api-free.deepl.com/v2"
      : "https://api.deepl.com/v2",

    active: !!process.env.DEEPL_API_KEY,

    endpoints: {
      translate: "/translate",
      languages: "/languages",
      usage: "/usage",
    },
  },
  microsoft: {
    apiKey: process.env.MICROSOFT_API_KEY,
    baseUrl: "https://api.cognitive.microsofttranslator.com",
    region: process.env.MICROSOFT_REGION || "centralus",
    active: !!process.env.MICROSOFT_API_KEY,
    endpoints: {
      detect: "/detect",
      translate: "/translate",
      transliterate: "/transliterate",
      languages: "/languages",
    },
  },
  google: {
    v2: {
      baseUrl: "https://translation.googleapis.com",
      endpoints: {
        translate: "/language/translate/v2",
        detect: "/language/translate/v2/detect",
        languages: "/language/translate/v2/languages",
      },
    },
    v1: {
      baseUrl: "https://translate.googleapis.com",
      endpoints: {
        translate: "/translate_a/single",
      },
    },
    apiKey: process.env.GOOGLE_API_KEY,
    applicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    active:
      !!process.env.GOOGLE_API_KEY ||
      !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
};
