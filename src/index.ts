import { makeDeepLTranslator } from "./translators/deepL/translator";
import { makeMicrosoftTranslator } from "./translators/microsoft/translator";
import { makeGoogleTranslator } from "./translators/google/translator";

type ApiKeys = {
  microsoft?: string;
  deepL?: string;
  google?: string;
};

export const makeTranslators = (apiKeys?: ApiKeys) => {
  const deepLApiKey = process.env.DEEPL_API_KEY || apiKeys?.deepL;
  const microsoftApiKey = process.env.MICROSOFT_API_KEY || apiKeys?.microsoft;
  const googleApiKey = process.env.GOOGLE_API_KEY || apiKeys?.google;

  const deepL = makeDeepLTranslator(deepLApiKey as string);
  const microsoft = makeMicrosoftTranslator(microsoftApiKey as string);
  const google = makeGoogleTranslator(googleApiKey); //as Google.Translator;

  return {
    deepL,
    microsoft,
    google,
  };
};
