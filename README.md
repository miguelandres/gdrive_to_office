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
```

### Setting up your own Google script

For anyone other than the original author, please remove the `.clasp-dev.json`
and `.clasp-prod.json` files and initialize them again using clasp create.

This clasp configuration is set to my own instance of the script on my Google
account to which you likely have no access.

Therefore run the following commands before doing anything

```sh
rm .clasp.json
# Create a new standalone script in your account
clasp create
```

## Run Lint

```sh
npm run lint
```

## Run Tests

```sh
npm run test
```

## Deploy

```sh
npm run deploy

npm run deploy:prod
```
