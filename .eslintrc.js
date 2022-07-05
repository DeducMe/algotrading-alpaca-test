module.exports = {
  extends: [
    "airbnb",
    "airbnb-typescript",
    "airbnb/hooks",
    // 'plugin:@typescript-eslint/recommended',
    // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  env: {
    jest: true,
  },
  rules: {
    "global-require": "off",
    "max-len": ["warn", { code: 120 }],
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["warn"],

    "react/no-children-prop": ["warn"],

    "react/require-default-props": ["off"],

    "func-names": ["off"],

    "import/prefer-default-export": ["off"],
    "react/jsx-filename-extension": "off",
    "react/tsx-filename-extension": "off",
    "arrow-parens": "off",

    "react/jsx-props-no-spreading": "off",

    "react/prop-types": "off",

    "comma-dangle": "off",

    "no-underscore-dangle": "off",

    "import/extensions": [
      "off",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],

    "@typescript-eslint/member-delimiter-style": [
      "warn",
      {
        multiline: {
          delimiter: "semi",
          requireLast: true,
        },
        singleline: {
          delimiter: "semi",
          requireLast: false,
        },
        multilineDetection: "brackets",
      },
    ],
  },
  globals: {
    fetch: false,
  },
};
