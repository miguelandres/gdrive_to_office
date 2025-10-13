// Copyright (c) 2025 Miguel Barreto and others
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// --- Native Flat Config Setup (No FlatCompat) ---

import prettier from "eslint-plugin-prettier";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
// NOTE: You must ensure 'eslint-config-prettier' is installed and up-to-date
import prettierConfig from "eslint-config-prettier";

// FIX: Exporting the configuration array directly.
export default [
    // 1. Ignore files (equivalent to globalIgnores)
    {
        ignores: [
            "template/**/*",
            "template-ui/**/*",
            "**/node_modules/*",
            "**/dist/*",
            "build/*",
            "**/rollup.config.mjs",
            "**/testing",
        ],
    },

    // 2. Core JavaScript Rules (equivalent to part of gts/recommended)
    js.configs.recommended,

    // 3. TypeScript Configuration Block (equivalent to the TypeScript parts of gts)
    {
        files: ['**/*.ts', '**/*.tsx'],

        plugins: {
            '@typescript-eslint': tseslint,
            prettier,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },

            parser: tsParser, // Set the TypeScript parser
            ecmaVersion: "latest",
            sourceType: "module",

            parserOptions: {
                project: "./tsconfig.json",
                // If you removed path/dirname imports, these are no longer needed:
                // __filename: false,
                // __dirname: false,
            },
        },

        // Apply TypeScript Recommended Rules
        extends: [tseslint.configs.recommended],

        rules: {
            // Your custom rules
            "prettier/prettier": "error",
            "@typescript-eslint/no-unused-vars": ["error", {
                args: "all",
                argsIgnorePattern: "^_",
                caughtErrors: "all",
                caughtErrorsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                ignoreRestSiblings: true,
            }],
        },
    },

    // 4. Prettier Config (must be last to disable conflicting rules)
    prettierConfig
];
