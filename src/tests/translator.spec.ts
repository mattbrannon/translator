import { config } from "dotenv";

import { makeTranslators } from "../index";
import { env } from "../env";

config({ path: ".env" });

type Expected = {
  translation: string;
  original: string;
  detectedLanguage: string;
  transliteration?: string | null;
};

const apiKeys = {
  microsoft: env.microsoft.apiKey,
  deepL: env.deepL.apiKey,
  google: env.google.apiKey,
};

const translators = makeTranslators(apiKeys);

describe("makeTranslators", () => {
  it("should return an object with the correct keys", () => {
    expect(Object.keys(translators)).toEqual([ "deepL", "microsoft", "google" ]);
  });
});

describe("Translators", () => {
  const { deepL, microsoft, google } = translators;

  [ deepL, microsoft, google ].forEach((translator) => {
    describe(translator.name, () => {
      it("should have a translate method", () => {
        expect(typeof translator.translate).toBe("function");
      });

      it("should have a translate method that returns a promise", () => {
        const result = translator.translate({ text: "Hello", target: "es" });

        expect(result).toBeInstanceOf(Promise);
      });

      it("should translate a string", async () => {
        const text = "Where is the bathroom?";
        const target = "es";
        const input = { text, target };

        const result = await translator.translate(input);

        const expected: Expected = {
          translation: "¿Dónde está el baño?",
          original: "Where is the bathroom?",
          detectedLanguage: "en",
          transliteration: null,
        };

        if (translator.name !== "microsoft") {
          delete expected.transliteration;
        }

        expect(result).toEqual([expected]);
      });

      it("should translate multiple strings", async () => {
        const text = [ "Where is the bathroom?", "What is your name?" ];

        const target = "es";
        const input = { text, target };

        const result = await translator.translate(input);

        // result[0].translation = result[0].translation.replace("?", "");

        const expected: Expected[] = [
          {
            translation: "¿Dónde está el baño?",
            original: "Where is the bathroom?",
            detectedLanguage: "en",
            transliteration: null,
          },
          {
            translation: "¿Cómo te llamas?",
            original: "What is your name?",
            detectedLanguage: "en",
            transliteration: null,
          },
        ];

        if (translator.name !== "microsoft") {
          expected.forEach((item) => delete item.transliteration);
        }

        expect(result).toEqual(expected);
      });
    });
  });
});
