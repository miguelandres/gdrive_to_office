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
import util from 'util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createIteratorMock = (files: any[]) => {
  let index = 0;
  return {
    hasNext: jest.fn(() => index < files.length),
    next: jest.fn(() => files[index++]),
    getContinuationToken: jest.fn(() => 'token-mock'),
  };
};
export const createUserMock = (email: string): GoogleAppsScript.Base.User => {
  return {
    getEmail: jest.fn(() => email),
  } as unknown as GoogleAppsScript.Base.User;
};

export const DEFAULT_USER_EMAIL = 'user@example.com';

export const setupMockEffectiveUser = (email = DEFAULT_USER_EMAIL) => {
  MockSession.getEffectiveUser = jest
    .fn()
    .mockReturnValue(createUserMock(email));
};

export const MockDriveApp = {
  getFilesByType: jest.fn(),
  Permission: {
    EDIT: 'edit',
    OWNER: 'owner',
    VIEW: 'view',
    COMMENT: 'comment',
    ORGANIZER: 'organizer',
    NONE: 'none',
  },
};

export const MockScriptApp = {
  getOAuthToken: jest.fn().mockReturnValue('mock-oauth-token'),
};
export const MockSession = {
  getEffectiveUser: jest
    .fn()
    .mockReturnValue(createUserMock(DEFAULT_USER_EMAIL)),
};
export const MockUrlFetchApp = {
  fetch: jest.fn(),
};

class ConsoleLoggerWithRecord {
  logs: string[] = [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(message: any, ...args: any[]) {
    let formatted: string;
    if (args.length > 0 && typeof message === 'string') {
      formatted = util.format(message, ...args);
    } else if (typeof message === 'string') {
      formatted = message;
    } else {
      formatted = [message.toString(), ...args.map(a => a.toString())].join(
        ' '
      );
    }
    this.logs.push(formatted);
    console.log(formatted);
  }

  public clear() {
    this.logs = [];
  }
  public getLogs() {
    return this.logs;
  }
}

// ⭐ inject the mocks into the global scope
global.DriveApp = MockDriveApp as unknown as GoogleAppsScript.Drive.DriveApp;
global.Logger =
  new ConsoleLoggerWithRecord() as unknown as GoogleAppsScript.Base.Logger;
global.ScriptApp =
  MockScriptApp as unknown as GoogleAppsScript.Script.ScriptApp;
global.Session = MockSession as unknown as GoogleAppsScript.Base.Session;
global.UrlFetchApp =
  MockUrlFetchApp as unknown as GoogleAppsScript.URL_Fetch.UrlFetchApp;
