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
  readonly file: DriveFile
  readonly mimeType: string
  readonly mimeTypeMapping: MimeTypeMapping
  readonly name: string

  constructor(file: DriveFile, mimeTypeMapping: MimeTypeMapping) {
    this.file = file
    this.name = file.getName()
    this.mimeType = file.getMimeType()
    this.mimeTypeMapping = mimeTypeMapping
    this.verifyMimeType()
  }

  abstract verifyMimeType(): void

  convertToOffice(): void { }
  convertToGoogle(): void { }
}

class GoogleFileConverter extends FileConverter {
  constructor(file: DriveFile, mimeTypeMapping: MimeTypeMapping) {
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

  getOfficeFile(folder: DriveFolder): DriveFile | undefined {
    const filesResult = folder.getFilesByName(this.getOfficeFileName())
    // Assume only one file returned.
    if (filesResult.hasNext())
      return filesResult.next()
    return undefined
  }

  convertToOffice(): void {
  }

}

class OfficeFileConverter extends FileConverter {
  constructor(file: DriveFile, mimeTypeMapping: MimeTypeMapping) {
    super(file, mimeTypeMapping)
  }

  verifyMimeType(): void {
    if (this.mimeType != this.mimeTypeMapping.office) {
      throw new UnexpectedMimeTypeError(this.file, this.mimeTypeMapping.office)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createFileConverter(
  file: DriveFile
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
