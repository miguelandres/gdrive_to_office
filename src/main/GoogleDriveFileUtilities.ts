

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

function getContainingFolders(file: DriveFile): DriveFolder[] {
  const parents = file.getParents()
  const folders: DriveFolder[] = []
  while (parents.hasNext()) { folders.push(parents.next()) }
  return folders
}

function isUserEditor(fileOrFolder: DriveFile | DriveFolder, userEmail: string): boolean {
  const permission = fileOrFolder.getAccess(userEmail)
  switch (permission) {
    case DrivePermission.EDIT:
    case DrivePermission.OWNER:
      return true
    default:
      return false
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getFilesByType(mimeType: string): DriveFile[] {
  const iterator = DriveApp.getFilesByType(mimeType)
  const result: DriveFile[] = []
  while (iterator.hasNext()) {
    result.push(iterator.next())
  }
  return result
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getContainingFoldersWithEditPermissions(file: DriveFile): DriveFolder[] {
  return getContainingFolders(file).filter((folder) => isUserEditor(folder, Session.getEffectiveUser().getEmail()))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isFileNewer(file: DriveFile, lastUpdated: GoogleAppsScript.Base.Date): boolean {
  if (file.getLastUpdated() >= lastUpdated) {
    Logger.log(`Found ${file.getName()} with a timestamp ${file.getLastUpdated().toDateString()} newer than ${lastUpdated.toDateString()}`)
    return true
  }
  return false
}
