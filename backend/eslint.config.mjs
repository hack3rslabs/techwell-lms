import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
                fetch: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "off",
            "no-undef": "off",
            "no-useless-escape": "off",
            "no-case-declarations": "off",
            "no-dupe-keys": "off",
            "no-useless-assignment": "off",
            "preserve-caught-error": "off"
        }
    }
];
