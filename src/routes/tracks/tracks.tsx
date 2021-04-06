import { useEffect, useState } from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider from 'react-bootstrap-table2-toolkit'
import moment from 'moment'
import { db, Track, removeTrack, putTracks } from '../../db'
import { initTrack, processAudio } from '../../audio'
import { getPermission } from '../../fileHandlers'
import Loader from '../../layout/loader'
import { SearchBar } from './searchbar'
import { Card, Container, Button, UncontrolledTooltip, Row } from 'reactstrap'
import { useLiveQuery } from 'dexie-react-hooks'

export const Tracks = (props: { baseProps?: object; searchProps?: object }) => {
  const [isOver, setIsOver] = useState(false) // for dropzone
  const [processing, setProcessing] = useState(false) // show progress if no table
  const [analyzingTracks, setAnalyzing] = useState<Track[]>([])
  const [dirtyTracks, setDirty] = useState<Track[]>([])

  // monitor db for track updates
  const tracks: Track[] | null = useLiveQuery(() => db.tracks.toArray()) ?? null

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

    await putTracks(trackArray)
    setProcessing(false)
    setAnalyzing(trackArray)

    for (const track of trackArray) await processAudio(track)
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
        ? dirtyTracks.filter(t => t.dirHandle?.name == track.dirHandle?.name)
        : [track]
      setAnalyzing(siblingTracks)
      for (const sibling of siblingTracks) {
        await processAudio(sibling)
        setAnalyzing(siblingTracks.filter(s => s.name !== sibling.name))
      }
    }
  }

  const actions = (cell: void, row: { name: string }) => (
    <>
      <div
        onClick={e => {
          e.preventDefault()
          removeTrack(row.name)
        }}
        id='removeTrack'
        style={{ cursor: 'pointer' }}
      >
        <i className='las la-15em la-times-circle text-danger'></i>
      </div>
      <UncontrolledTooltip placement='left' target='removeTrack'>
        Remove Track
      </UncontrolledTooltip>
    </>
  )

  const sortCaret = (order: 'desc' | 'asc' | undefined) => (
    <i
      className={`las la-fw text-muted ${
        order ? `la-sort-${order}` : `la-sort`
      }`}
    ></i>
  )

  const createColumnDefinitions = () => {
    const classes = 'text-center'
    const headerStyle = {
      color: '#333',
      textAlign: 'center' as const
    }

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
        dataField: 'name',
        text: 'Track Name',
        sort: true,
        headerStyle: {
          color: '#333',
          textAlign: 'left' as const
        },
        formatter: (cell: string) => cell.replace(/\.[^/.]+$/, ''), // remove suffix (ie. .mp3)
        sortCaret
      },
      {
        dataField: 'bpm',
        text: 'BPM',
        sort: true,
        headerStyle,
        classes,
        sortCaret,
        formatter: (
          cell: number | undefined,
          row: any,
          rowIndex: number,
          dirtyState: {
            dirtyTracks: Track[]
            analyzingTracks: Track[]
          }
        ) =>
          cell?.toFixed(0) ||
          (dirtyState.dirtyTracks.some(t => t.name == row.name) &&
          !dirtyState.analyzingTracks.some(a => a.name == row.name) ? (
            getBpmButton(row)
          ) : (
            <Loader style={{ margin: 0 }} />
          )),
        formatExtraData: { dirtyTracks, analyzingTracks }
      },
      {
        dataField: 'duration',
        text: 'Duration',
        sort: true,
        headerStyle,
        classes,
        sortCaret,
        formatter: (cell: number | undefined) =>
          cell ? formatMinutes(cell / 60) : <></>
      },
      {
        dataField: 'mixes',
        text: 'Mixes',
        sort: true,
        headerStyle,
        classes,
        sortCaret
      },
      {
        dataField: 'sets',
        text: 'Sets',
        sort: true,
        headerStyle,
        classes,
        sortCaret
      },
      {
        dataField: 'lastModified',
        text: 'Updated',
        sort: true,
        headerStyle,
        classes,
        sortCaret,
        style: { minWidth: '140px', fontSize: 'small' },
        formatter: (cell: moment.MomentInput) => moment(cell).fromNow()
      },
      {
        dataField: 'actions',
        text: 'Actions',
        sort: false,
        headerStyle,
        classes,
        formatter: actions
      }
    ]
  }

  const columnDefs = createColumnDefinitions()

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
        <ToolkitProvider
          keyField='name'
          data={tracks}
          columns={columnDefs}
          search
        >
          {props => (
            <>
              <div className='d-flex mb-2 align-items-baseline'>
                <div>
                  <SearchBar {...props.searchProps} />
                </div>
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
              <Card className='mb-3 p-0 bt-0'>
                <BootstrapTable
                  classes='table-responsive-lg mb-0'
                  bordered={false}
                  hover
                  defaultSorted={[{ dataField: 'name', order: 'asc' }]}
                  {...props.baseProps}
                />
              </Card>
            </>
          )}
        </ToolkitProvider>
      )}
    </Container>
  )
}
