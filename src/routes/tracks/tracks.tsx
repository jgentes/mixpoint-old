import { useEffect, useState } from 'react'
import moment from 'moment'
import { db, Track, removeTrack, putTrack, useLiveQuery } from '../../db'
import { initTrack, processAudio } from '../../audio'
import { getPermission } from '../../fileHandlers'
import Loader from '../../layout/loader'
import { SearchBar } from './searchbar'
import { Card, Container, UncontrolledTooltip } from 'reactstrap'
import { Button } from '@blueprintjs/core'
import { Cross, DoubleCaretVertical } from '@blueprintjs/icons'
import { Cell, Column, ColumnHeaderCell, Table } from '@blueprintjs/table'

export const Tracks = (props: { baseProps?: object; searchProps?: object }) => {
  const [isOver, setIsOver] = useState(false) // for dropzone
  const [processing, setProcessing] = useState(false) // show progress if no table
  const [analyzingTracks, setAnalyzing] = useState<Track[]>([])
  const [dirtyTracks, setDirty] = useState<Track[]>([])

  // monitor db for track updates
  const tracks: Track[] | null = useLiveQuery(() => db.tracks.toArray()) ?? null
  let trackSort: string =
    useLiveQuery(() => db.appState.get('trackSort')) || 'name'

  // if we see any tracks that haven't been processed, process them, or
  // if we haven't had user activation, show button to resume processing
  // https://html.spec.whatwg.org/multipage/interaction.html#tracking-user-activation
  useEffect(() => setDirty(tracks?.filter(t => !t.bpm) || []), [tracks])

  // queue files for processing after they are added to the DB
  // this provides a more responsive UI experience
  const processTracks = async (
    handles: (FileSystemFileHandle | FileSystemDirectoryHandle)[]
  ) => {
    let trackArray = []

    // show indicator if no tracks exist
    setProcessing(true)

    for await (const fileOrDirectoryHandle of handles) {
      if (!fileOrDirectoryHandle) continue

      if (fileOrDirectoryHandle?.kind === 'directory') {
        const directoryHandle = fileOrDirectoryHandle
        for await (const entry of directoryHandle.values()) {
          if (entry.kind === 'file') {
            trackArray.push(await initTrack(entry, directoryHandle))
          }
        }
      } else {
        trackArray.push(await initTrack(fileOrDirectoryHandle))
      }
    }

    const idTracks = []
    for (const track of trackArray) idTracks.push(await putTrack(track))
    setProcessing(false)
    setAnalyzing(idTracks)

    for (const track of idTracks) await processAudio(track)
  }

  // careful wtih DataTransferItemList: https://stackoverflow.com/questions/55658851/javascript-datatransfer-items-not-persisting-through-async-calls
  const filesDropped = async (files: DataTransferItemList) => {
    const handleArray = []

    for (const file of files) {
      if (file.kind === 'file') {
        const handle = await file.getAsFileSystemHandle()
        if (handle) handleArray.push(handle)
      }
    }

    setIsOver(false)
    processTracks(handleArray)
  }

  const browseFile = async () => {
    const files = await window
      .showOpenFilePicker({ multiple: true })
      .catch(e => {
        if (e?.message?.includes('user aborted a request')) return []
        throw e
      })

    processTracks(files)
  }

  const analyzeTrack = async (track: Track) => {
    const ok = await getPermission(track)
    if (ok) {
      // if the user approves access to a folder, we can process all files in that folder :)
      const siblingTracks = track.dirHandle
        ? dirtyTracks.filter(t => t.id == track.id)
        : [track]
      setAnalyzing(siblingTracks)
      for (const sibling of siblingTracks) {
        await processAudio(sibling)
        setAnalyzing(siblingTracks.filter(s => s.id !== sibling.id))
      }
    }
  }

  const actions = (i: number) => (
    <Cell style={{ textAlign: 'center' }}>
      <Button
        icon={<Cross title='Remove Track' />}
        id='removeTrack'
        minimal={true}
        small={true}
        intent='danger'
        onClick={() => removeTrack(tracks![i].id!)}
      />
    </Cell>
  )

  const createColumnDefinitions = () => {
    const formatMinutes = (mins: number) => {
      return moment()
        .startOf('day')
        .add(mins, 'minutes')
        .format('m:ss')
    }

    const getBpmButton = (row: Track) => {
      return (
        <Button
          color='outline-primary'
          size='sm'
          onClick={e => {
            e.preventDefault()
            analyzeTrack(row)
          }}
        >
          Get BPM
        </Button>
      )
    }

    return [
      {
        key: 'name',
        name: 'Track Name',
        width: 500,
        formatter: (i: number) => {
          // remove suffix (ie. .mp3)
          return (
            <Cell wrapText={true}>
              {tracks![i].name?.replace(/\.[^/.]+$/, '')}
            </Cell>
          )
        }
      },
      {
        key: 'bpm',
        name: 'BPM',
        width: 100,
        formatter: (i: number) => (
          <Cell>
            {tracks![i].bpm?.toFixed(0) ||
              (dirtyTracks.some(t => t.id == tracks![i].id) &&
              !analyzingTracks.some(a => a.id == tracks![i].id) ? (
                getBpmButton(tracks![i])
              ) : (
                <Loader style={{ margin: 0 }} />
              ))}
          </Cell>
        )
      },
      {
        key: 'duration',
        name: 'Duration',
        width: 100,
        formatter: (i: number) =>
          tracks![i].duration ? (
            <Cell>{formatMinutes(tracks![i].duration! / 60)}</Cell>
          ) : (
            <Cell />
          )
      },
      {
        key: 'mixes',
        name: 'Mixes',
        width: 75,
        formatter: (i: number) => <Cell></Cell>
      },
      {
        key: 'sets',
        name: 'Sets',
        width: 75,
        formatter: (i: number) => <Cell></Cell>
      },
      {
        key: 'lastModified',
        name: 'Updated',
        width: 150,
        formatter: (i: number) => (
          <Cell>{moment(tracks![i].lastModified).fromNow()}</Cell>
        )
      },
      {
        key: 'actions',
        name: 'Remove',
        width: 80,
        formatter: actions
      }
    ]
  }

  const columnDefs = createColumnDefinitions()

  const sortColumns = (sortKey: string) => {
    const rev = /reverse/.test(sortKey)
    const key = sortKey.split('-')[0]

    // ugly function that handles various sorts for strings vs numbers
    const sortFunc = (a, b) => {
      return key == 'name'
        ? rev
          ? b[key].localeCompare(a[key])
          : a[key].localeCompare(b[key])
        : rev
        ? b[key] - a[key]
        : a[key] - b[key]
    }

    tracks?.sort(sortFunc)
  }

  sortColumns(trackSort)

  return (
    <Container>
      <div className='mt-4 mb-4 text-black-06'>
        <div
          onClick={browseFile}
          className={`dropzone ${isOver ? 'dropzone--active' : ''}`}
          onDrop={e => {
            e.preventDefault()
            filesDropped(e.dataTransfer.items)
          }}
          onDragOver={e => e.preventDefault()}
          onDragEnter={() => setIsOver(true)}
          onDragLeave={() => setIsOver(false)}
        >
          <i className='las la-cloud-upload-alt la-fw la-3x drop'></i>
          <h5 className='mt-0 drop'>Add Tracks</h5>
          <div className='drop'>
            Drag a file or <strong>folder</strong> here or{' '}
            <span className='text-primary'>browse</span> for a file to add.
            Folders are preferred.
          </div>
        </div>
      </div>

      {!tracks || processing ? (
        <Loader className='my-5' />
      ) : !tracks?.length ? null : (
        <>
          <div className='d-flex mb-2 align-items-baseline'>
            {!dirtyTracks.length ? null : (
              <div className='ml-auto'>
                <div>
                  <i
                    className='las la-exclamation-circle la-2x text-danger mr-1'
                    style={{ verticalAlign: 'middle' }}
                  />
                  <span className='text-danger align-middle fs-15'>
                    {`BPM needed for ${dirtyTracks.length} Track${
                      tracks.length === 1 ? '' : 's'
                    }`}
                  </span>
                </div>
              </div>
            )}
            <div className='ml-auto'>
              <Button
                color='primary'
                size='sm'
                className='mr-2 text-white py-0 fs-15'
                disabled={true}
              >
                {tracks.length}
              </Button>
              <span className='text-black-06 align-middle fs-15'>{`Track${
                tracks.length === 1 ? '' : 's'
              }`}</span>
            </div>
          </div>
          <Table
            numRows={tracks.length}
            columnWidths={columnDefs.map(c => c.width)}
            //defaultSorted={[{ dataField: 'name', order: 'asc' }]}
          >
            {columnDefs.map(c => (
              <Column
                id={c.name}
                key={c.name}
                cellRenderer={c.formatter}
                columnHeaderCellRenderer={() => (
                  <ColumnHeaderCell
                    name={c.name}
                    menuIcon={
                      <Button
                        icon={<DoubleCaretVertical title='Sort' />}
                        id={`${c.name}-sort`}
                        minimal={true}
                        small={true}
                        onClick={e => {
                          const rev = /reverse/.test(trackSort)
                          const key = trackSort.split('-')[0]
                          const sortKey =
                            trackSort.split('-')[0] == c.key
                              ? rev
                                ? key
                                : `${key}-reverse`
                              : c.key

                          db.appState.put(sortKey, 'trackSort')
                          e.stopPropagation()
                        }}
                      />
                    }
                    menuRenderer={() => <></>}
                  />
                )}
              />
            ))}
          </Table>
        </>
      )}
    </Container>
  )
}
