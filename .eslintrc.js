module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    overrides: [],
    parserOptions: {
        ecmaVersion: "latest",
    },
    rules: {},
    plugins: ["@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
    ],
};
