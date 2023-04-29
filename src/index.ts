import { makeDeepL } from "./translators/deepL/translator";
import { makeMicrosoftTranslator } from "./translators/microsoft/translator";
import { env } from "./env";

type ApiKeys = {
  microsoft?: string;
  deepL?: string;
};

export const makeTranslators = (apiKeys: ApiKeys) => {
  const deepL = makeDeepL(apiKeys.deepL);
  const microsoft = makeMicrosoftTranslator(apiKeys.microsoft);
  return {
    deepL,
    microsoft,
  };
};
