import { Track } from './db'

const getFile = async (
  handle: FileSystemFileHandle | FileSystemDirectoryHandle
): Promise<File | null> => {
  let file = null,
    perms

  if (handle.kind == 'directory')
    handle = await handle.getFileHandle(handle.name)

  perms = await handle.queryPermission()
  console.log('perms:', perms, perms === 'granted')
  if (perms === 'granted') file = await handle.getFile()
  // in the case perms aren't granted, return null - we need to request permission
  return file
}

/** returns the file if permission has been granted to a file
 *  will prompt the user if necessary (user must have interacted with the page first!)
 *  otherwise returns null
 */
const getPermission = async (track: Track): Promise<File | null> => {
  // first check perms
  let file = await getFile(track.fileHandle)
  if (file) return file

  // directory handle is preferred over file handle
  // note: this will throw "DOMException: User activation is required
  // to request permissions" if user hasn't interacted with the page yet

  const handle = track.dirHandle || track.fileHandle
  await handle.requestPermission()

  return await getFile(handle)
}

export { getFile, getPermission }
