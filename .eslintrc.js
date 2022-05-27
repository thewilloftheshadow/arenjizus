module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ["plugin:@typescript-eslint/eslint-recommended", "plugin:@typescript-eslint/recommended", "airbnb-base"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
    },
    plugins: ["@typescript-eslint", "eslint-plugin-tsdoc"],
    rules: {
        quotes: ["error", "double", { allowTemplateLiterals: true }],
        semi: ["error", "never"],
        indent: ["error", 4],
        "import/extensions": ["error", "never"],
        "max-len": ["error", { code: 250 }],
        "tsdoc/syntax": "warn",
        "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
        "class-methods-use-this": "off",
        "no-underscore-dangle": "off",
        "implicit-arrow-linebreak": "off",
        "consistent-return": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "comma-dangle": "off",
        "function-paren-newline": ["error", "consistent"],
        "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-empty-function": "off",
        "no-plusplus": "off",
    },
    ignorePatterns: ["dist/*"],
    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },
}
