import { useEffect, useState } from 'react'
import { db, Track, putTrack, removeTrack, useLiveQuery } from '../../db'
import { initTrack, processAudio } from '../../audio'
import moment from 'moment'
import Loader from '../../layout/loader'
import { getPermission } from '../../fileHandlers'
import {
  Button,
  Card,
  Icon,
  InputGroup,
  HTMLTable,
  Classes,
  H4
} from '@blueprintjs/core'
import { Popover2 } from '@blueprintjs/popover2'

export const Tracks = ({
  hideDropzone,
  trackKey,
  openTable,
  getPeaks
}: {
  hideDropzone: boolean
  trackKey: number
  openTable: Function
  getPeaks: Function
}) => {
  const [isOver, setIsOver] = useState(false) // for dropzone
  const [processing, setProcessing] = useState(false) // show progress if no table
  const [analyzingTracks, setAnalyzing] = useState<Track[]>([])
  const [dirtyTracks, setDirty] = useState<Track[]>([])
  const [searchVal, setSearch] = useState('')

  // monitor db for track updates
  let tracks: Track[] | null = useLiveQuery(() => db.tracks.toArray()) ?? null
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
        ? dirtyTracks.filter(t => t.dirHandle?.name == track.dirHandle!.name)
        : [track]

      setAnalyzing(siblingTracks)
      for (const sibling of siblingTracks) {
        await processAudio(sibling)
        setAnalyzing(siblingTracks.filter(s => s.id !== sibling.id))
      }
    }
  }

  const addTrackToMix = (track: Track, trackKey: number) => {
    getPeaks(track, trackKey)
    openTable(false)
  }

  const actions = (t: Track) => (
    <div style={{ textAlign: 'center' }}>
      <Button
        icon={<Icon icon='cross' title='Remove Track' />}
        id='removeTrack'
        minimal={true}
        small={true}
        intent='danger'
        onClick={() => removeTrack(t.id!)}
      />
    </div>
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
          intent='primary'
          small={true}
          minimal={true}
          onClick={e => {
            e.preventDefault()
            analyzeTrack(row)
          }}
        >
          Get BPM
        </Button>
      )
    }

    const AddToMixButton = ({ track }: { track: Track }) => (
      <Button
        outlined={true}
        small={true}
        intent='primary'
        className='tr-hover'
        onClick={() => addTrackToMix(track, trackKey)}
      >
        Add to Mix
      </Button>
    )

    return [
      {
        key: 'name',
        name: 'Track Name',
        minWidth: '300px',
        width: '50%',
        formatter: (t: Track) => {
          // remove suffix (ie. .mp3)
          return (
            <>
              {t.name?.replace(/\.[^/.]+$/, '')}
              {hideDropzone ? (
                <AddToMixButton track={t} />
              ) : (
                <Popover2
                  interactionKind='click'
                  popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                  autoFocus={false}
                  content={
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Button
                        className={Classes.POPOVER_DISMISS}
                        intent='primary'
                        style={{ marginRight: 10 }}
                        onClick={() => addTrackToMix(t, 0)}
                      >
                        Track 1
                      </Button>
                      <Button
                        intent='primary'
                        className={Classes.POPOVER_DISMISS}
                        onClick={() => addTrackToMix(t, 1)}
                      >
                        Track 2
                      </Button>
                    </div>
                  }
                >
                  <AddToMixButton track={t} />
                </Popover2>
              )}
            </>
          )
        }
      },
      {
        key: 'bpm',
        name: 'BPM',
        width: '80px',
        formatter: (t: Track) =>
          t.bpm?.toFixed(0) ||
          (dirtyTracks.some(dt => dt.id == t.id) &&
          !analyzingTracks.some(a => a.id == t.id) ? (
            getBpmButton(t)
          ) : (
            <Loader style={{ margin: 0, height: '20px' }} />
          ))
      },
      {
        key: 'duration',
        name: 'Duration',
        width: '105px',
        formatter: (t: Track) =>
          t.duration ? formatMinutes(t.duration! / 60) : null
      },
      {
        key: 'mixes',
        name: 'Mixes',
        width: '85px',
        formatter: (t: Track) => null
      },
      {
        key: 'sets',
        name: 'Sets',
        width: '75px',
        formatter: (t: Track) => null
      },
      {
        key: 'lastModified',
        name: 'Updated',
        width: '140px',
        formatter: (t: Track) => moment(t.lastModified).fromNow()
      },
      {
        key: 'actions',
        name: 'Remove',
        width: '75px',
        formatter: actions
      }
    ]
  }

  const columnDefs = createColumnDefinitions()

  const tableHeaders = columnDefs.map(c => (
    <th
      key={c.key}
      style={{
        textAlign: c.key == 'actions' ? 'center' : 'left',
        minWidth: c.minWidth || c.width,
        width: c.width
      }}
    >
      {c.name}
      {c.key == 'actions' ? null : (
        <Button
          icon={<Icon icon='double-caret-vertical' title='Sort' />}
          id={`${c.key}-sort`}
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
      )}
    </th>
  ))

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
  if (searchVal && tracks)
    tracks = tracks.filter(t =>
      t.name?.toLowerCase().includes(searchVal.toLowerCase())
    )

  return (
    <>
      {/* DropZone */}
      {hideDropzone ? null : (
        <div style={{ margin: '10px 0' }} className='text-black-06'>
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
            <Icon
              icon='insert'
              size={26}
              className='drop'
              style={{ marginBottom: '10px' }}
            />
            <H4 className='drop'>Add Tracks</H4>
            <div className='drop'>
              Drag a file or <strong>folder</strong> here or{' '}
              <span className='text-primary'>browse</span> for a file to add.
              Folders are preferred.
            </div>
          </div>
        </div>
      )}
      {!tracks || processing ? (
        <Loader style={{ margin: '50px auto' }} />
      ) : (
        <>
          {/* Table search and info bar */}
          <Card
            elevation={1}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px'
            }}
          >
            <InputGroup
              leftIcon={<Icon icon='search' />}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search'
              value={searchVal}
            ></InputGroup>
            {!dirtyTracks.length ? null : (
              <div style={{ alignSelf: 'center' }}>
                <Icon icon='issue' style={{ marginRight: '5px' }} />
                {`BPM needed for ${dirtyTracks.length} Track${
                  tracks?.length === 1 ? '' : 's'
                }`}
              </div>
            )}
            <div style={{ alignSelf: 'center' }}>
              <Button
                intent='primary'
                small={true}
                onClick={browseFile}
                icon={<Icon icon='plus' />}
              >
                Add Track
              </Button>
            </div>
          </Card>
          {!tracks?.length ? null : (
            <div id='trackTable'>
              {/* Track Table */}
              <HTMLTable
                bordered={true}
                condensed={true}
                interactive={true}
                striped={true}
                style={{ width: '100%', tableLayout: 'fixed' }}
              >
                <thead>
                  <tr>{tableHeaders}</tr>
                </thead>
                <tbody>
                  {tracks.map((t, i) => (
                    <tr key={i}>
                      {columnDefs.map(c => (
                        <td key={c.key}>{c.formatter(t)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </HTMLTable>
            </div>
          )}
        </>
      )}
    </>
  )
}
