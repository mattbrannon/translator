## Translator

This project aims to combine the functionality of multiple translation services into a single API. Each translation service requires an API key. You can get an API key for each translator at the following links:

- [Google Translate](https://console.cloud.google.com/getting-started)
- [Microsoft Translate](https://docs.microsoft.com/en-us/azure/cognitive-services/translator/translator-how-to-signup)
- [DeepL Translate](https://www.deepl.com/pro#developer)

Note - These are listed in order of most difficult to easiest (in my opinion). Google Translate requires you to create a Google Cloud account, create a project and enable the Translate API. Microsoft Translate requires you to create an Azure account, create a Cognitive Services resource and enable the Translator Text API. DeepL Translate only requires you to create an account and generate an API key.

You don't have to get an API key for every translation service. For example if you only wanted to use the DeepL Translator, you need only supply the DeepL API key. If you wanted to use all three services, you would need to supply all three API keys.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [Google Translate](#google-translate)
  - [Microsoft Translate](#microsoft-translate)
  - [DeepL Translate](#deepl-translate)
- [Contributing](#contributing)

## Installation

```bash
npm install @mattbrannon/translator
```

## Usage

```js
import { makeTranslators } from "@mattbrannon/translator";
const translators = makeTranslators({
  google: process.env.GOOGLE_API_KEY,
  microsoft: process.env.MICROSOFT_API_KEY,
  deepL: process.env.DEEPL_API_KEY,
});

(async () => {
  const { google, microsoft, deepL } = translators;

  const text = ["Hello World!", "Goodbye World!"];
  const target = "es";

  const googleTranslation = await google.translate({ text, target });
  const microsoftTranslation = await microsoft.translate({ text, target });
  const deepLTranslation = await deepL.translate({ text, target });

  console.log({
    googleTranslation,
    microsoftTranslation,
    deepLTranslation,
  });
})();
```

## API

Each translator has a `translate` method that takes an object with the following properties:

- `text` - An array of strings or a single string to be translated.
- `target` - The language code of the language to translate to.
- `source` - The language code of the language to translate from. This is optional. If not provided each translator will attempt to detect the source language.
- `options` - An object containing additional options. This is optional. See below for more details.

The `options` object is used set translator specific options as well as options that are common to all translators. The following options are common to all translators:

- `ignore` - An array of regular expressions to match words that should be ignored by the translator.
- `join` - A boolean value indicating whether the translated text should be joined into a single string.

```js
const text = [
  "She sells seashells 🐚 down by the seashore.",
  "I scream, 😱 you scream, we all scream for 🍨 ice cream.",
];
const target = "es";

const wordsThatStartWithS = /\b[sS]\w+\b/g;
const emoji = /\p{Extended_Pictographic}/gu;

const options = {
  ignore: [wordsThatStartWithS, emoji],
  join: true,
};

await microsoft.translate({ text, target, options });
```

The following sections describe the differences between each translator.

### Google Translate

The `google` translator has the following additional methods:

- `detectLanguage` - Takes an object with a `text` property and returns the detected language code.
- `getLanguages` - Takes an object with an optional `target` property and returns an array of supported language codes in the specified target language.

```js
const translators = makeTranslators({
  google: process.env.GOOGLE_API_KEY,
});

const { google } = translators;

const detectedLanguage = await google.detectLanguage({ text: "Hello World!" });
const supportedLanguages = await google.getLanguages({ target: "es" });

console.log({
  detectedLanguage,
  supportedLanguages,
});
```

### Microsoft Translate

The microsoft translator has transliteration capabilities in addition to translation. You don't have to do anything special to use transliteration. Just provide a target language code and if transliteration is supported for that language, it will be included in the response.

The `microsoft` translator has the following additional methods on the languages property:

- `translation` - Returns an array of supported language codes for translation.
- `transliteration` - Returns an array of supported language codes for transliteration.
- `dictionary` - Returns an array of supported language codes for dictionary operations.

```js
const translators = makeTranslators({
  microsoft: process.env.MICROSOFT_API_KEY,
});

const { microsoft } = translators;

const translationLanguages = await microsoft.languages.translation();
const transliterationLanguages = await microsoft.languages.transliteration();
const dictionaryLanguages = await microsoft.languages.dictionary();

console.log({
  translationLanguages,
  transliterationLanguages,
  dictionaryLanguages,
});
```

### DeepL Translate

The `deepL` translator has the following additional methods:

- `sourceLanguages` - Returns an array of valid source language codes.
- `targetLanguages` - Returns an array of valid target language codes.
- `usage` - Returns an object containing usage statistics for the current billing period.

```js
(async () => {
  const translators = makeTranslators({
    deepL: process.env.DEEPL_API_KEY,
  });

  const { deepL } = translators;

  const sourceLanguages = await deepL.sourceLanguages();
  const targetLanguages = await deepL.targetLanguages();
  const usageStatistics = await deepL.usage();

  console.log({
    sourceLanguages,
    targetLanguages,
    usageStatistics,
  });
})();
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.
