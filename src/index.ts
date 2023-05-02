import { makeDeepLTranslator } from "./translators/deepL/translator";
import { makeMicrosoftTranslator } from "./translators/microsoft/translator";
import { makeGoogleTranslator } from "./translators/google/translator";

type ApiKeys = {
  microsoft?: string;
  deepL?: string;
  google?: string;
};

export const makeTranslators = (apiKeys: ApiKeys) => {
  const deepL = makeDeepLTranslator(apiKeys.deepL);
  const microsoft = makeMicrosoftTranslator(apiKeys.microsoft);
  const google = makeGoogleTranslator(apiKeys.google)!;

  return {
    deepL,
    microsoft,
    google,
  };
};
