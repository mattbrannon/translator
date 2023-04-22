import { config } from "dotenv";
config();

export const env = {
  deepL: {
    apiKey: process.env.DEEPL_API_KEY,
    endpoint: "https://api-free.deepl.com",
    active: !!process.env.DEEPL_API_KEY,
  },
  microsoft: {
    apiKey: process.env.MICROSOFT_API_KEY,
    endpoint: "https://api.cognitive.microsofttranslator.com",
    region: process.env.MICROSOFT_REGION || "centralus",
    active: !!process.env.MICROSOFT_API_KEY,
  },
  google: {
    endpoint: "https://translation.googleapis.com",
    apiKey: process.env.GOOGLE_API_KEY!,
    applicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    active:
      !!process.env.GOOGLE_API_KEY ||
      !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
};
