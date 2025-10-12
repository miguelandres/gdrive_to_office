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

class MimeTypeMapping {
  google: string;
  office: string;
  extension: string;
  constructor(google: string, office: string, extension: string) {
    this.google = google;
    this.office = office;
    this.extension = extension;
  }
}

const DOCUMENT = new MimeTypeMapping(
  'application/vnd.google-apps.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'docx'
);

const PRESENTATION = new MimeTypeMapping(
  'application/vnd.google-apps.presentation',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'pptx'
);

const SPREADSHEET = new MimeTypeMapping(
  'application/vnd.google-apps.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'xlsx'
);

const ALL_MAPPINGS = [DOCUMENT, PRESENTATION, SPREADSHEET];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GOOGLE_TO_OFFICE = new Map(
  ALL_MAPPINGS.map(mapping => [mapping.google, mapping] as const)
);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GOOGLE_TYPES = ALL_MAPPINGS.map(mapping => mapping.google);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OFFICE_TO_GOOGLE = new Map(
  ALL_MAPPINGS.map(mapping => [mapping.office, mapping] as const)
);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OFFICE_TYPES = ALL_MAPPINGS.map(mapping => mapping.office);
