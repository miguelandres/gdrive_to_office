// Copyright (c) 2024 Miguel Barreto and others
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

abstract class FileConverter {
  readonly file: GoogleAppsScript.Drive.File
  readonly mimeType: string
  readonly mimeTypeMapping: MimeTypeMapping
  readonly name: string

  constructor(
    file: GoogleAppsScript.Drive.File,
    mimeTypeMapping: MimeTypeMapping
  ) {
    this.file = file
    this.name = file.getName()
    this.mimeType = file.getMimeType()
    this.mimeTypeMapping = mimeTypeMapping
    this.verifyMimeType()
    Logger.log(
      `Created ${this.constructor.name} for ${this.name} (${this.mimeType})`)
  }

  /**
   * Verifies that the mime type in the file is actually the type we expect
   * @throws UnexpectedMimeTypeError if file is the wrong type
   */
  abstract verifyMimeType(): void

  /**
   * Converts the current file to Office formats
   * @returns Number of new files generated
   */
  convertToOffice(): number { return 0 }
  /**
   * Converts the current file to Google formats
   * @returns Number of new files generated
   */
  convertToGoogle(): number { return 0 }
}

class GoogleFileConverter extends FileConverter {
  constructor(
    file: GoogleAppsScript.Drive.File,
    mimeTypeMapping: MimeTypeMapping
  ) {
    super(file, mimeTypeMapping)
  }

  verifyMimeType(): void {
    if (this.mimeType != this.mimeTypeMapping.google) {
      throw new UnexpectedMimeTypeError(this.file, this.mimeTypeMapping.google)
    }
  }

  getOfficeFileName(): string {
    return `${this.name}.${this.mimeTypeMapping.extension}`
  }

  getOfficeFiles(
    folder: GoogleAppsScript.Drive.Folder
  ): GoogleAppsScript.Drive.File[] {
    const filesResult = folder.getFilesByName(this.getOfficeFileName())
    const result: GoogleAppsScript.Drive.File[] = []
    while (filesResult.hasNext())
      result.push(filesResult.next())
    // double check the MIME type ;)
    return result.filter((found) =>
      found.getMimeType() == this.mimeTypeMapping.office)
  }

  convertToOffice(): number {
    // Find all folders that need new copies
    const folders = getContainingFoldersWithOwnerPermissions(this.file)
    const fileName = this.getOfficeFileName()
    const lastUpdated: GoogleAppsScript.Base.Date = this.file.getLastUpdated()
    let conversionCount = 0
    folders.forEach((folder) => {
      const existingFiles = this.getOfficeFiles(folder)

      if (existingFiles
        .find((found) => isFileNewer(found, lastUpdated)) === undefined) {
        // Didn't find an office version that was newer!
        // Need to create it, How fun!
        const conversionUrl =
          `https://www.googleapis.com/drive/v3/files/${this.file.getId()}/export?mimeType=${this.mimeTypeMapping.office}`

        const blob = UrlFetchApp.fetch(conversionUrl, {
          method: "get",
          headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
          muteHttpExceptions: true
        }).getBlob()
        folder.createFile(blob).setName(fileName)
        Logger.log(`Created file ${fileName} in ${folder.getName()}`)
        conversionCount++
      }
    })
    return conversionCount
  }

}

class OfficeFileConverter extends FileConverter {
  constructor(
    file: GoogleAppsScript.Drive.File,
    mimeTypeMapping: MimeTypeMapping
  ) {
    super(file, mimeTypeMapping)
  }

  verifyMimeType(): void {
    if (this.mimeType != this.mimeTypeMapping.office) {
      throw new UnexpectedMimeTypeError(this.file, this.mimeTypeMapping.office)
    }
  }

  convertToGoogle(): number {
    throw Error("Unimplemented!")
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createFileConverter(
  file: GoogleAppsScript.Drive.File
): FileConverter {
  const mimeType = file.getMimeType()
  const googleMapping = GOOGLE_TO_OFFICE.get(mimeType)
  const officeMapping = OFFICE_TO_GOOGLE.get(mimeType)
  if (googleMapping instanceof MimeTypeMapping) {
    return new GoogleFileConverter(file, googleMapping)
  } else if (officeMapping instanceof MimeTypeMapping) {
    return new OfficeFileConverter(file, officeMapping)
  }
  throw new UnsupportedMimeTypeError(file)
}
