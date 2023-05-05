module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "brace-style": [ "error", "stroustrup" ],
    semi: [ "error", "always" ],
    "space-before-function-paren": "off",
    "comma-dangle": [ "error", "only-multiline" ],
    "no-unused-expressions": "off",
    "no-sequences": "off",
    eqeqeq: "error",
    "array-element-newline": [
      "error",
      { ArrayExpression: "consistent", ArrayPattern: "never" },
    ],
    "array-bracket-newline": [ "error", { multiline: true }],
    "array-bracket-spacing": [
      "error",
      "always",
      {
        arraysInArrays: false,
        objectsInArrays: false,
        singleValue: false,
      },
    ],
    "no-unneeded-ternary": "error",
    indent: [
      2,
      2,
      {
        flatTernaryExpressions: true,
        ignoredNodes: ["ConditionalExpression > *"],
        SwitchCase: 1,
      },
    ],
    "newline-per-chained-call": [ "error", { ignoreChainWithDepth: 3 }],
  }
};
