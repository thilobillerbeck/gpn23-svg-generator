import pluginVue from "eslint-plugin-vue";

export default [
  ...pluginVue.configs["flat/recommended"],
  {
    rules: {},
    languageOptions: {
      sourceType: "module",
    },
  },
];
