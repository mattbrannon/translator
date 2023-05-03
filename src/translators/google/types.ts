import { Translate } from "../types";

export namespace Google {
  export type V1FetchResponse = [[[string, string]], any, string];

  export type DetectInput = {
    text: string | string[];
  };

  export type Input = Translate.Input;
  export type Options = Translate.Options;
  export type Output = Translate.Output;
}
