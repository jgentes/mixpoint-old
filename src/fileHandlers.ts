import { Track } from './db'

const getFile = async (track: Track): Promise<File | null> => {
  let file = null,
    perms

  perms = await track.fileHandle.queryPermission()
  if (perms === 'granted') file = await track.fileHandle.getFile()
  // in the case perms aren't granted, return null - we need to request permission
  return file
}

/** returns the file if permission has been granted to a file
 *  will prompt the user if necessary (user must have interacted with the page first!)
 *  otherwise returns null
 */
const getPermission = async (track: Track): Promise<File | null> => {
  // first check perms
  let file = await getFile(track)
  if (file) return file

  // directory handle is preferred over file handle
  // note: this will throw "DOMException: User activation is required
  // to request permissions" if user hasn't interacted with the page yet

  track.dirHandle
    ? await track.dirHandle.requestPermission()
    : await track.fileHandle.requestPermission()

  return await getFile(track)
}

export { getFile, getPermission }
