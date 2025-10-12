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

import { createFileConverter } from './FileConverter';
import { getFilesByType } from './GoogleDriveFileUtilities';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function convertToOffice() {
  const userEmail = Session.getEffectiveUser().getEmail();
  let conversionCount = 0;

  Logger.log(`Starting conversion to office for all files for ${userEmail}`);
  GOOGLE_TYPES.forEach(googleType => {
    const converters = getFilesByType(googleType).map(file =>
      createFileConverter(file)
    );
    conversionCount = converters
      .map(fileConverter => fileConverter.convertToOffice())
      .reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        conversionCount
      );
  });

  Logger.log(`Converted ${conversionCount} files total`);
}
