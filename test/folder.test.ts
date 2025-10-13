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
  getContainingFolders,
  getContainingFoldersWithEditPermissions,
  getContainingFoldersWithOwnerPermissions,
} from '../src/folder';
import { createIteratorMock, DEFAULT_USER_EMAIL } from './jest.setup';

describe('getContainingFolders', () => {
  const mockFolder1 = {} as unknown as GoogleAppsScript.Drive.Folder;
  const mockFolder2 = {} as unknown as GoogleAppsScript.Drive.Folder;

  it('returns all containing folders', () => {
    const mockFile = {
      getParents: jest
        .fn()
        .mockReturnValue(createIteratorMock([mockFolder1, mockFolder2])),
    } as unknown as GoogleAppsScript.Drive.File;
    const result = getContainingFolders(mockFile);
    expect(result).toEqual([mockFolder1, mockFolder2]);
  });

  it('returns empty array when no containing folders', () => {
    const mockFile = {
      getParents: jest.fn().mockReturnValue(createIteratorMock([])),
    } as unknown as GoogleAppsScript.Drive.File;
    const result = getContainingFolders(mockFile);
    expect(result).toEqual([]);
  });
});

describe('getContainingFoldersWithEditPermissions', () => {
  it('allows folder with edit permissions', () => {
    const editFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.EDIT),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getParents: jest.fn().mockReturnValue(createIteratorMock([editFolder])),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(getContainingFoldersWithEditPermissions(mockFile)).toEqual([
      editFolder,
    ]);
    expect(editFolder.getAccess).toHaveBeenCalledWith(DEFAULT_USER_EMAIL);
  });
  it('allows folder with owner permissions', () => {
    const ownerFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.OWNER),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getParents: jest.fn().mockReturnValue(createIteratorMock([ownerFolder])),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(getContainingFoldersWithEditPermissions(mockFile)).toEqual([
      ownerFolder,
    ]);
    expect(ownerFolder.getAccess).toHaveBeenCalledWith(DEFAULT_USER_EMAIL);
  });
  it('filters out folder without edit permissions', () => {
    const viewFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.VIEW),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const organizerFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.ORGANIZER),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const commentFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.COMMENT),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const noneFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.NONE),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getParents: jest
        .fn()
        .mockReturnValue(
          createIteratorMock([
            viewFolder,
            organizerFolder,
            commentFolder,
            noneFolder,
          ])
        ),
    } as unknown as GoogleAppsScript.Drive.File;
    expect(getContainingFoldersWithEditPermissions(mockFile)).toEqual([]);
  });
});

describe('getContainingFoldersWithOwnerPermissions', () => {
  it('allows folder with owner permissions', () => {
    const ownerFolder = {
      getAccess: jest.fn(_ => DriveApp.Permission.OWNER),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const editFolder = {
      getAccess: jest.fn(_ => DriveApp.Permission.EDIT),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getParents: jest
        .fn()
        .mockReturnValue(createIteratorMock([editFolder, ownerFolder])),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(getContainingFoldersWithOwnerPermissions(mockFile)).toEqual([
      ownerFolder,
    ]);
    expect(ownerFolder.getAccess).toHaveBeenCalledWith(DEFAULT_USER_EMAIL);
    expect(editFolder.getAccess).toHaveBeenCalledWith(DEFAULT_USER_EMAIL);
  });
  it('filters out folder without owner permissions', () => {
    const viewFolder = {
      getAccess: jest.fn().mockReturnValue(DriveApp.Permission.VIEW),
    } as unknown as GoogleAppsScript.Drive.Folder;
    const mockFile = {
      getParents: jest.fn().mockReturnValue(createIteratorMock([viewFolder])),
    } as unknown as GoogleAppsScript.Drive.File;

    expect(getContainingFoldersWithOwnerPermissions(mockFile)).toEqual([]);
    expect(viewFolder.getAccess).toHaveBeenCalledWith(DEFAULT_USER_EMAIL);
  });
});
