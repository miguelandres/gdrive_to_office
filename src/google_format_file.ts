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
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
import { isFileNewer, unrollFileIterator } from './files';
import {
  getContainingFoldersWithEditPermissions,
  getContainingFoldersWithOwnerPermissions,
} from './folder';
import { SupportedMimeType } from './mime_types';
import { UnsupportedMimeTypeError } from './errors';
/**
 * Class that represents a Google Docs/Slides/Sheets file
 */
export class GoogleFormatFile {
  readonly file: GoogleAppsScript.Drive.File;
  readonly mimeType: string;
  readonly name: string;
  readonly id: string;
  readonly officeEquivalentFileName: string;
  readonly officeEquivalentMimeType: string;
  readonly lastUpdated: GoogleAppsScript.Base.Date;
  readonly containingFolders: GoogleAppsScript.Drive.Folder[];

  constructor(
    file: GoogleAppsScript.Drive.File,
    createConvertedCopyInOwnedFoldersOnly = true
  ) {
    this.file = file;
    this.id = file.getId();
    this.name = file.getName();
    this.mimeType = file.getMimeType();
    this.lastUpdated = file.getLastUpdated();
    switch (this.mimeType) {
      case SupportedMimeType.GOOGLE_DOCS:
        this.officeEquivalentMimeType = SupportedMimeType.OFFICE_WORD;
        this.officeEquivalentFileName = `${this.name}.docx`;
        break;
      case SupportedMimeType.GOOGLE_SHEETS:
        this.officeEquivalentMimeType = SupportedMimeType.OFFICE_EXCEL;
        this.officeEquivalentFileName = `${this.name}.xlsx`;
        break;
      case SupportedMimeType.GOOGLE_SLIDES:
        this.officeEquivalentMimeType = SupportedMimeType.OFFICE_POWERPOINT;
        this.officeEquivalentFileName = `${this.name}.pptx`;
        break;
      default:
        throw new UnsupportedMimeTypeError(file);
    }
    this.containingFolders = createConvertedCopyInOwnedFoldersOnly
      ? getContainingFoldersWithOwnerPermissions(file)
      : getContainingFoldersWithEditPermissions(file);
  }

  public convert = (): GoogleAppsScript.Drive.File[] =>
    this.containingFolders
      .map(folder => {
        const folderName = folder.getName();
        const matchingOfficeFiles = unrollFileIterator(
          folder.getFilesByName(this.officeEquivalentFileName)
        );
        const newerFile = matchingOfficeFiles.find(found =>
          isFileNewer(found, this.lastUpdated)
        );
        if (newerFile) {
          Logger.log(
            `Skipping conversion of ${this.name} in ${folderName} - newer file already exists`
          );
          return undefined;
        } else {
          Logger.log(
            `Starting conversion of ${this.officeEquivalentFileName} in ${folderName}`
          );
          try {
            const conversionUrl = `https://www.googleapis.com/drive/v3/files/${this.id}/export?mimeType=${this.officeEquivalentMimeType}`;
            const blob = UrlFetchApp.fetch(conversionUrl, {
              method: 'get',
              headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
              muteHttpExceptions: true,
            }).getBlob();
            const createdFile = folder
              .createFile(blob)
              .setName(this.officeEquivalentFileName);
            Logger.log(
              `Created file ${this.officeEquivalentFileName} in ${folderName}`
            );
            return createdFile;
          } catch (e) {
            Logger.log(
              `Error converting file ${this.name} in ${folderName}: ${e}`
            );
            return undefined;
          }
        }
      })
      .filter(Boolean) as GoogleAppsScript.Drive.File[];
}

/**
 * Convert a Google Drive file to a Google Document if it is of a supported type
 * @returns The GoogleFormatFile instance or undefined if the file is not of a
 *     supported type
 */
export const buildGoogleFormatFileFromFile = (
  file: GoogleAppsScript.Drive.File,
  createConvertedCopyInOwnedFoldersOnly = true
): GoogleFormatFile | undefined => {
  if (
    ![
      SupportedMimeType.GOOGLE_DOCS,
      SupportedMimeType.GOOGLE_SHEETS,
      SupportedMimeType.GOOGLE_SLIDES,
    ].find(mimeType => mimeType === file.getMimeType())
  ) {
    return undefined;
  }

  return new GoogleFormatFile(file, createConvertedCopyInOwnedFoldersOnly);
};
