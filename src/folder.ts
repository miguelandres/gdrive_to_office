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
import { isUserEditor, isUserOwner } from './files';

export const getContainingFolders = (
  file: GoogleAppsScript.Drive.File
): GoogleAppsScript.Drive.Folder[] => {
  const parents = file.getParents();
  const folders: GoogleAppsScript.Drive.Folder[] = [];
  while (parents.hasNext()) {
    folders.push(parents.next());
  }
  return folders;
};

export const getContainingFoldersWithEditPermissions = (
  file: GoogleAppsScript.Drive.File
): GoogleAppsScript.Drive.Folder[] =>
  getContainingFolders(file).filter(folder =>
    isUserEditor(folder, Session.getEffectiveUser().getEmail())
  );

export const getContainingFoldersWithOwnerPermissions = (
  file: GoogleAppsScript.Drive.File
): GoogleAppsScript.Drive.Folder[] =>
  getContainingFolders(file).filter(folder =>
    isUserOwner(folder, Session.getEffectiveUser().getEmail())
  );
