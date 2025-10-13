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
import {
  checkPermissionIsOneOf,
  getFilesByType,
  isFileNewer,
  isUserEditor,
  isUserOwner,
} from '../src/files';
import { MockDriveApp, createIteratorMock } from './jest.setup';

describe('getFilesByType', () => {
  const mockFile1 = { id: '1' } as unknown as GoogleAppsScript.Drive.File;
  const mockFile2 = { id: '2' } as unknown as GoogleAppsScript.Drive.File;

  it('returns files when iterator has files', () => {
    const mockIterator = createIteratorMock([mockFile1, mockFile2]);

    MockDriveApp.getFilesByType = jest.fn().mockReturnValue(mockIterator);

    const result = getFilesByType('application/pdf');

    expect(MockDriveApp.getFilesByType).toHaveBeenCalledWith('application/pdf');
    expect(result).toEqual([mockFile1, mockFile2]);
  });

  it('returns empty array when iterator has no files', () => {
    const mockIterator = createIteratorMock([]);
    MockDriveApp.getFilesByType = jest.fn().mockReturnValue(mockIterator);
    const result = getFilesByType('application/pdf');
    expect(result).toEqual([]);
  });

  it('calls getFilesByType with the correct mimeType', () => {
    const mockIterator = createIteratorMock([]);
    MockDriveApp.getFilesByType.mockReturnValue(mockIterator);

    getFilesByType('image/png');

    expect(MockDriveApp.getFilesByType).toHaveBeenCalledWith('image/png');
  });
});

describe('checkPermissionIsOneOf', () => {
  it('returns true when  permission is in expectedPermissions', () => {
    const mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.EDIT),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(
      checkPermissionIsOneOf(mockFileOrFolder, 'user@example.com', [
        DriveApp.Permission.COMMENT,
        DriveApp.Permission.EDIT,
      ])
    ).toBe(true);
    expect(mockFileOrFolder.getAccess).toHaveBeenCalledWith('user@example.com');
  });
  it('returns false when permission is not in expectedPermissions', () => {
    const mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.VIEW),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(
      checkPermissionIsOneOf(mockFileOrFolder, 'user@example.com', [
        DriveApp.Permission.COMMENT,
        DriveApp.Permission.EDIT,
      ])
    ).toBe(false);
    expect(mockFileOrFolder.getAccess).toHaveBeenCalledWith('user@example.com');
  });
});

describe('isUserEditor', () => {
  let mockFileOrFolder:
    | GoogleAppsScript.Drive.File
    | (GoogleAppsScript.Drive.Folder & {
        getAccess: jest.Mock;
      });

  it('returns true for EDIT permission', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.EDIT),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserEditor(mockFileOrFolder, 'user@example.com')).toBe(true);
  });

  it('returns true for OWNER permission', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserEditor(mockFileOrFolder, 'user@example.com')).toBe(true);
  });

  it('returns false for VIEW permissions', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.VIEW),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserEditor(mockFileOrFolder, 'user@example.com')).toBe(false);
  });
  it('returns false for COMMENT permissions', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.COMMENT),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserEditor(mockFileOrFolder, 'user@example.com')).toBe(false);
  });
  it('returns false for ORGANIZER permissions', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.ORGANIZER),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserEditor(mockFileOrFolder, 'user@example.com')).toBe(false);
  });
  it('returns false for NONE permissions', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.NONE),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserEditor(mockFileOrFolder, 'user@example.com')).toBe(false);
  });
});

describe('isUserOwner', () => {
  let mockFileOrFolder:
    | GoogleAppsScript.Drive.File
    | (GoogleAppsScript.Drive.Folder & {
        getAccess: jest.Mock;
      });

  it('returns true for OWNER permission', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserOwner(mockFileOrFolder, 'user@example.com')).toBe(true);
  });
  it('returns false for EDIT permission', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.EDIT),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserOwner(mockFileOrFolder, 'user@example.com')).toBe(false);
  });

  it('returns false for VIEW permissions', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.VIEW),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserOwner(mockFileOrFolder, 'user@example.com')).toBe(false);
  });
  it('returns false for COMMENT permissions', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.COMMENT),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserOwner(mockFileOrFolder, 'user@example.com')).toBe(false);
  });
  it('returns false for ORGANIZER permissions', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.ORGANIZER),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserOwner(mockFileOrFolder, 'user@example.com')).toBe(false);
  });
  it('returns false for NONE permissions', () => {
    mockFileOrFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.NONE),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isUserOwner(mockFileOrFolder, 'user@example.com')).toBe(false);
  });
});

describe('isFileNewer', () => {
  it('returns true when file is newer than lastUpdated', () => {
    const mockDate = new Date('2025-01-02T00:00:00Z');
    const mockFile = {
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2025-01-03T00:00:00Z')),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isFileNewer(mockFile, mockDate)).toBe(true);
    expect(mockFile.getLastUpdated).toHaveBeenCalled();
  });
  it('returns true when file is same as lastUpdated', () => {
    const mockDate = new Date('2025-01-02T00:00:00Z');
    const mockFile = {
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2025-01-02T00:00:00Z')),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isFileNewer(mockFile, mockDate)).toBe(true);
    expect(mockFile.getLastUpdated).toHaveBeenCalled();
  });
  it('returns false when file is older than lastUpdated', () => {
    const mockDate = new Date('2025-01-02T00:00:00Z');
    const mockFile = {
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2025-01-01T00:00:00Z')),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(isFileNewer(mockFile, mockDate)).toBe(false);
    expect(mockFile.getLastUpdated).toHaveBeenCalled();
  });
});
