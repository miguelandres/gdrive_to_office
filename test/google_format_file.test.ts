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
import { SupportedMimeType } from '../src/mime_types';
import {
  buildGoogleFormatFileFromFile,
  GoogleFormatFile,
} from '../src/google_format_file';
import { createIteratorMock, MockUrlFetchApp } from './jest.setup';
import { UnsupportedMimeTypeError } from '../src/errors';

describe('GoogleFormatFile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  // Constructor tests for supported mime types end up being exercised in
  // convertFileToGoogleFormatFile tests below
  it('throws exception for unsupported mime type', () => {
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Document1'),
      getMimeType: jest
        .fn()
        .mockReturnValue('UnsupportedMimeType') as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([])),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(() => new GoogleFormatFile(mockFile)).toThrow(
      UnsupportedMimeTypeError
    );
  });

  it('filters containing folders correctly when set to only owned folders', () => {
    const ownerFolder = {
      getId: jest.fn().mockReturnValue('folder-1-id'),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const editorFolder = {
      getId: jest.fn().mockReturnValue('folder-2-id'),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.EDIT),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const viewerFolder = {
      getId: jest.fn().mockReturnValue('folder-3-id'),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.VIEW),
    } as unknown as GoogleAppsScript.Drive.Folder;

    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Document1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_DOCS) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest
        .fn()
        .mockReturnValue(
          createIteratorMock([ownerFolder, editorFolder, viewerFolder])
        ),
    } as unknown as GoogleAppsScript.Drive.File;

    const googleFormatFile = new GoogleFormatFile(mockFile, true);
    expect(googleFormatFile.containingFolders).toEqual([ownerFolder]);
  });

  it('includes all containing folders that you have edit access for when not restricted to owned folders', () => {
    const ownedFolder = {
      getId: jest.fn().mockReturnValue('folder-1-id'),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const editorFolder = {
      getId: jest.fn().mockReturnValue('folder-2-id'),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.EDIT),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const viewerFolder = {
      getId: jest.fn().mockReturnValue('folder-3-id'),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.VIEW),
    } as unknown as GoogleAppsScript.Drive.Folder;

    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Document1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_DOCS) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest
        .fn()
        .mockReturnValue(
          createIteratorMock([ownedFolder, editorFolder, viewerFolder])
        ),
    } as unknown as GoogleAppsScript.Drive.File;

    const googleFormatFile = new GoogleFormatFile(mockFile, false);
    expect(googleFormatFile.containingFolders).toEqual([
      ownedFolder,
      editorFolder,
    ]);
  });

  it('convert creates new word file when none exists', () => {
    const mockCreatedFile = {
      setName: jest.fn(),
    } as unknown as GoogleAppsScript.Drive.File;
    mockCreatedFile.setName = jest.fn().mockReturnValue(mockCreatedFile);
    const mockFolder = {
      getName: jest.fn().mockReturnValue('Folder1'),
      getFilesByName: jest.fn().mockReturnValue(createIteratorMock([])),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
      createFile: jest.fn((_name, _blob, _mime) => mockCreatedFile),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Document1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_DOCS) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([mockFolder])),
    } as unknown as GoogleAppsScript.Drive.File;

    MockUrlFetchApp.fetch.mockReturnValue({
      getBlob: jest.fn().mockReturnValue({} as GoogleAppsScript.Base.Blob),
    } as unknown as GoogleAppsScript.URL_Fetch.HTTPResponse);

    const googleFormatFile = new GoogleFormatFile(mockFile, true);
    const result = googleFormatFile.convert();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockCreatedFile);
    expect(MockUrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/drive/v3/files/file-id/export?mimeType=application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      {
        method: 'get',
        headers: { Authorization: 'Bearer mock-oauth-token' },
        muteHttpExceptions: true,
      }
    );
    expect(mockFolder.createFile).toHaveBeenCalledWith({});
    expect(mockCreatedFile.setName).toHaveBeenCalledWith('Document1.docx');
  });

  it('convert creates new powerpoint file when none exists', () => {
    const mockCreatedFile = {
      setName: jest.fn(),
    } as unknown as GoogleAppsScript.Drive.File;
    mockCreatedFile.setName = jest.fn().mockReturnValue(mockCreatedFile);
    const mockFolder = {
      getName: jest.fn().mockReturnValue('Folder1'),
      getFilesByName: jest.fn().mockReturnValue(createIteratorMock([])),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
      createFile: jest.fn((_name, _blob, _mime) => mockCreatedFile),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Presentation1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_SLIDES) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([mockFolder])),
    } as unknown as GoogleAppsScript.Drive.File;

    MockUrlFetchApp.fetch.mockReturnValue({
      getBlob: jest.fn().mockReturnValue({} as GoogleAppsScript.Base.Blob),
    } as unknown as GoogleAppsScript.URL_Fetch.HTTPResponse);

    const googleFormatFile = new GoogleFormatFile(mockFile, true);
    const result = googleFormatFile.convert();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockCreatedFile);
    expect(MockUrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/drive/v3/files/file-id/export?mimeType=application/vnd.openxmlformats-officedocument.presentationml.presentation',
      {
        method: 'get',
        headers: { Authorization: 'Bearer mock-oauth-token' },
        muteHttpExceptions: true,
      }
    );
    expect(mockFolder.createFile).toHaveBeenCalledWith({});
    expect(mockCreatedFile.setName).toHaveBeenCalledWith('Presentation1.pptx');
  });

  it('convert creates new excel file when none exists', () => {
    const mockCreatedFile = {
      setName: jest.fn(),
    } as unknown as GoogleAppsScript.Drive.File;
    mockCreatedFile.setName = jest.fn().mockReturnValue(mockCreatedFile);
    const mockFolder = {
      getName: jest.fn().mockReturnValue('Folder1'),
      getFilesByName: jest.fn().mockReturnValue(createIteratorMock([])),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
      createFile: jest.fn((_name, _blob, _mime) => mockCreatedFile),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Spreadsheet1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_SHEETS) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([mockFolder])),
    } as unknown as GoogleAppsScript.Drive.File;

    MockUrlFetchApp.fetch.mockReturnValue({
      getBlob: jest.fn().mockReturnValue({} as GoogleAppsScript.Base.Blob),
    } as unknown as GoogleAppsScript.URL_Fetch.HTTPResponse);

    const googleFormatFile = new GoogleFormatFile(mockFile, true);
    const result = googleFormatFile.convert();
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(mockCreatedFile);
    expect(MockUrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://www.googleapis.com/drive/v3/files/file-id/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      {
        method: 'get',
        headers: { Authorization: 'Bearer mock-oauth-token' },
        muteHttpExceptions: true,
      }
    );
    expect(mockFolder.createFile).toHaveBeenCalledWith({});
    expect(mockCreatedFile.setName).toHaveBeenCalledWith('Spreadsheet1.xlsx');
  });

  it('convert skips creating new file when newer file already exists', () => {
    const existingNewerFile = {
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-02-01T00:00:00Z')),
    } as unknown as GoogleAppsScript.Drive.File;
    const mockFolder = {
      getName: jest.fn().mockReturnValue('Folder1'),
      getFilesByName: jest
        .fn()
        .mockReturnValue(createIteratorMock([existingNewerFile])),
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
      createFile: jest.fn(),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Document1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_DOCS) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([mockFolder])),
    } as unknown as GoogleAppsScript.Drive.File;

    const googleFormatFile = new GoogleFormatFile(mockFile, true);
    const result = googleFormatFile.convert();
    expect(result).toHaveLength(0);
    expect(MockUrlFetchApp.fetch).not.toHaveBeenCalled();
    expect(mockFolder.createFile).not.toHaveBeenCalled();
  });
});

describe('convertFileToGoogleFormatFile', () => {
  it('returns GoogleFormatFile for Google Doc mime type', () => {
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Document1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_DOCS) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([])),
    } as unknown as GoogleAppsScript.Drive.File;

    const result = buildGoogleFormatFileFromFile(mockFile);
    expect(result).toBeInstanceOf(GoogleFormatFile);
    expect(result?.id).toBe('file-id');
    expect(result?.name).toBe('Document1');
    expect(result?.mimeType).toBe(SupportedMimeType.GOOGLE_DOCS);
    expect(result?.officeEquivalentMimeType).toBe(
      SupportedMimeType.OFFICE_WORD
    );
    expect(result?.officeEquivalentFileName).toBe('Document1.docx');
    expect(result?.lastUpdated).toEqual(new Date('2023-01-01T00:00:00Z'));
    expect(result?.containingFolders).toEqual([]);
  });

  it('returns GoogleFormatFile for Google Slides mime type', () => {
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Presentation1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_SLIDES) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([])),
    } as unknown as GoogleAppsScript.Drive.File;

    const result = buildGoogleFormatFileFromFile(mockFile);
    expect(result).toBeInstanceOf(GoogleFormatFile);
    expect(result?.id).toBe('file-id');
    expect(result?.name).toBe('Presentation1');
    expect(result?.mimeType).toBe(SupportedMimeType.GOOGLE_SLIDES);
    expect(result?.officeEquivalentMimeType).toBe(
      SupportedMimeType.OFFICE_POWERPOINT
    );
    expect(result?.officeEquivalentFileName).toBe('Presentation1.pptx');
    expect(result?.lastUpdated).toEqual(new Date('2023-01-01T00:00:00Z'));
    expect(result?.containingFolders).toEqual([]);
  });

  it('returns GoogleFormatFile for Google Sheets mime type', () => {
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Spreadsheet1'),
      getMimeType: jest
        .fn()
        .mockReturnValue(SupportedMimeType.GOOGLE_SHEETS) as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([])),
    } as unknown as GoogleAppsScript.Drive.File;

    const result = buildGoogleFormatFileFromFile(mockFile);
    expect(result).toBeInstanceOf(GoogleFormatFile);
    expect(result?.id).toBe('file-id');
    expect(result?.name).toBe('Spreadsheet1');
    expect(result?.mimeType).toBe(SupportedMimeType.GOOGLE_SHEETS);
    expect(result?.officeEquivalentMimeType).toBe(
      SupportedMimeType.OFFICE_EXCEL
    );
    expect(result?.officeEquivalentFileName).toBe('Spreadsheet1.xlsx');
    expect(result?.lastUpdated).toEqual(new Date('2023-01-01T00:00:00Z'));
    expect(result?.containingFolders).toEqual([]);
  });

  it('returns undefined for unsupported mime type', () => {
    const mockFile = {
      getId: jest.fn().mockReturnValue('file-id'),
      getName: jest.fn().mockReturnValue('Document1'),
      getMimeType: jest
        .fn()
        .mockReturnValue('UnsupportedMimeType') as () => string,
      getLastUpdated: jest
        .fn()
        .mockReturnValue(new Date('2023-01-01T00:00:00Z')) as () => Date,
      getParents: jest.fn().mockReturnValue(createIteratorMock([])),
    } as unknown as GoogleAppsScript.Drive.File;

    const result = buildGoogleFormatFileFromFile(mockFile);
    expect(result).toBeUndefined();
  });
});
