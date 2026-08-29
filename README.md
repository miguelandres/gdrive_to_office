# Google Drive to Office Converter

[![Build and test](https://github.com/miguelandres/gdrive_to_office/actions/workflows/ci.yml/badge.svg)](https://github.com/miguelandres/gdrive_to_office/actions/workflows/ci.yml)
[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE.txt)

A Google Apps Script written in TypeScript using [clasp](https://github.com/google/clasp) that automatically converts Google Docs, Google Sheets, and Google Slides in your Google Drive into Microsoft Office formats (`.docx`, `.xlsx`, `.pptx`).

> [!CAUTION]
> This script performs bulk file creation across your Google Drive. Precautions have been built in to prevent accidental overwrites and unintended folder modifications, but please review the code and run at your own risk.

---

## Supported Conversions

| Google Workspace Format | Microsoft Office Format | Extension |
| :---------------------- | :---------------------- | :-------- |
| Google Docs             | Microsoft Word          | `.docx`   |
| Google Sheets           | Microsoft Excel         | `.xlsx`   |
| Google Slides           | Microsoft PowerPoint    | `.pptx`   |

---

## Safety & Risk Minimization

- **Ownership Restriction**: By default, the script only creates converted files inside folders you own, preventing accidental file pollution in shared or team drives.
- **Timestamp Protection**: If an Office file with the target name already exists and has a timestamp newer than the Google file, conversion is skipped to avoid overwriting recent changes.
- **Non-Destructive**: The original Google Docs, Sheets, and Slides files are never modified or deleted. Converted Office files are placed directly alongside the originals.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (version 22 or later recommended) and `npm`
- A Google Account with the [Google Apps Script API enabled](https://script.google.com/home/usersettings)

---

## Setup & Installation

### 1. Clone the repository and install dependencies

```sh
git clone https://github.com/miguelandres/gdrive_to_office.git
cd gdrive_to_office
npm install

npm install -g @google/clasp  
```

### 2. Log in with clasp

Authenticate `clasp` with your Google account:

```sh
clasp login
```

### 3. Configure your Google Apps Script project

The repository includes `.clasp-dev.json` and `.clasp-prod.json` templates. If you are setting up your own instance of the script:

1. Create a new standalone Google Apps Script project in your Google account:

   ```sh
   clasp create --title "GDrive to Office Converter" --type standalone --rootDir dist
   ```

2. Note the generated `scriptId` from the resulting `.clasp.json` file.
3. Update `.clasp-dev.json` and `.clasp-prod.json` with your project's `scriptId`:

   ```json
   {
     "scriptId": "YOUR_SCRIPT_ID_HERE",
     "rootDir": "dist"
   }
   ```

---

## Deployment & Execution

### Deploy to Google Apps Script

To bundle and deploy the script to your development or production Apps Script project:

```sh
# Deploy to development project (.clasp-dev.json)
npm run deploy

# Deploy to production project (.clasp-prod.json)
npm run deploy:prod
```

### Run the Conversion

1. Open your script project in the Google Apps Script web editor:

   ```sh
   npx clasp open
   ```

2. Select the `convertAllGoogleFilesToOffice` function from the function dropdown at the top.
3. Click **Run**.
4. On first run, Google will prompt you to authorize the necessary Drive and external request permissions.
5. Check the **Execution log** at the bottom to view the conversion progress and file counts.

> [!TIP]
> You can schedule automatic conversions by setting up a time-driven trigger in the Google Apps Script dashboard (**Triggers** > **Add Trigger** > select `convertAllGoogleFilesToOffice` > choose time-based schedule).

---

## Development Scripts

| Command               | Description                                                                  |
| :-------------------- | :--------------------------------------------------------------------------- |
| `npm run build`       | Cleans `dist/`, bundles TypeScript via Rollup, and copies `appsscript.json`  |
| `npm run lint`        | Checks license headers and runs ESLint with auto-fix                         |
| `npm run test`        | Runs unit tests using Jest                                                   |
| `npm run deploy`      | Runs lint, test, build, copies `.clasp-dev.json`, and pushes to Apps Script  |
| `npm run deploy:prod` | Runs lint, test, build, copies `.clasp-prod.json`, and pushes to Apps Script |

---

## License

This project is licensed under the [Apache-2.0 License](LICENSE.txt).
