# Convert Google Docs/Slides/Sheets to Office

[![Hope](https://img.shields.io/badge/tested%20by-H%C2%AF%5C__(%E3%83%84)__%2F%C2%AFPE-green.svg)](http://www.hopedrivendevelopment.com)
[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

This is a Google Apps Script script written in TypeScript using [clasp](https://github.com/clasp/clasp)
that allows the user to convert all Google Docs/Slides/Sheets into Microsoft
Office formats

I plan to add logic for conversion in the opposite direction but it has not
been a priority.
> [!CAUTION]
> By nature this is a risky script to run. I have taken precautions to minimize
> the dangerous operations but, run it at your own risk and review the code.

## Risk Minimization

- The script will only create copies of documents in directories you own.
- The script will only create an office version of your document if there is no
  office file with the same name that has a newer timestamp.

## Development

Make sure you [enable the Google Apps Script API for your Google Account](https://script.google.com/home/usersettings).

```sh
# Install clasp
npm install -g @google/clasp

# Login into your google account with clasp
clasp login

# Install autocomplete for Google Apps Script
npm install --save @types/google-apps-script

# Add all the ESLint stuff
npm install @typescript-eslint/eslint-plugin@latest --save-dev
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install --save-dev eslint-config-prettier
npm i -D @stylistic/eslint-plugin
npm install eslint
```

## How to deploy and run

When you're done with your local edits, use `clasp push` to push them to Google.

You can then use `clasp open` to open the script on your browser and run it from
there.

Alternatively you can use `clasp run` but I haven't tried that.
