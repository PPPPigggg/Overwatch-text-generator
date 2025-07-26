module.exports = {
  root: true,
  globals: {
    _: "writable",
  },
  extends: [
    "@unocss",
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-typescript",
    "@vue/eslint-config-prettier/skip-formatting",
  ],
  env: {
    node: true,
  },
  parserOptions: {
    ecmaVersion: "latest",
    parser: "@typescript-eslint/parser",
  },
  parser: "vue-eslint-parser",
  rules: {
    "no-async-promise-executor": "off",
    "vue/multi-word-component-names": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@unocss/order": "warn", // unocss 类名排序规则,
    // vue属性顺序
    "vue/attributes-order": [
      "error",
      {
        order: [
          "DEFINITION", // is, v-is
          "LIST_RENDERING", // v-for item in items
          "CONDITIONALS", // v-if, v-else-if, v-else, v-show, v-cloak
          "RENDER_MODIFIERS", // v-once, v-pre
          "GLOBAL", // id
          "UNIQUE", // ref, key, slot
          "TWO_WAY_BINDING", // v-model
          "OTHER_DIRECTIVES", // v-custom-directive
          "OTHER_ATTR", // class, style
          "EVENTS", // v-on
          "CONTENT", // v-text, v-html
        ],
        alphabetical: false, // 使用字母顺序排序，如果需要按字母顺序，可以设为 true
      },
    ],
    // 组件使用自闭合标签
    "vue/html-self-closing": [
      "warn",
      {
        html: {
          void: "any",
          normal: "any",
          component: "always",
        },
      },
    ],
  },
  overrides: [
    {
      files: ["src/**/**/*.vue"],
      rules: {
        "vue/multi-word-component-names": 0,
      },
    },
    {
      files: ["index.html"],
      rules: {
        "vue/comment-directive": "off",
      },
    },
  ],
  // rules: {
  //   'no-warning-comments': [
  //     'error',
  //     { terms: ['TODO', 'FIXME'], location: 'anywhere' },
  //   ],
  // },
}
