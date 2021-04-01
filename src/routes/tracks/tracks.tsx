import { useState } from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider from 'react-bootstrap-table2-toolkit'
import { toast } from 'react-toastify'
import moment from 'moment'
import { db, Track, removeTrack, putTrack } from '../../db'
import { processTrack } from '../../audio'
import Loader from '../../layout/loader'
import { success, failure } from '../../utils'
import { SearchBar } from './searchbar'
import { Card, Container, Badge, UncontrolledTooltip } from 'reactstrap'
import { useLiveQuery } from 'dexie-react-hooks'

export const Tracks = (props: { baseProps?: object; searchProps?: object }) => {
  const [isOver, setIsOver] = useState(false)

  // monitor db for track updates
  const tracks: Track[] | null = useLiveQuery(() => db.tracks.toArray()) ?? null

  const getFile = async (name: string, fileHandle?: FileSystemFileHandle) => {
    let file

    if (!fileHandle) {
      file = await db.tracks.get(name)
      if (!file) {
        removeFile(undefined, name)
        throw new Error('File not found, deleting from tracklist')
      }
      fileHandle = file.fileHandle
    }

    try {
      file = await fileHandle.getFile()
      if (file) return success(name)
    } catch (e) {
      const perms = await fileHandle.requestPermission()
      if (perms === 'granted') return success(name)
    }

    return failure(name)
  }

  const removeFile = async (name: string) => {
    await removeTrack(name)
    toast.success(
      <>
        Removed <strong>{name}</strong>
      </>,
      { autoClose: 3000 }
    )
    //setTracks(tracks.filter((t: Track) => t.name !== name))
  }

  // first add the track to the db with the initial data we have
  // and show a loader icon while processing the file
  const initTrack = async (fileHandle: FileSystemFileHandle) => {
    const { name, size, type } = await fileHandle.getFile()
    const track = { name, size, type, fileHandle }

    await putTrack(track)
    return fileHandle
  }

  // queue files for processing after they are added to the DB
  // this provides a more responsive UI experience
  const queueTracks = async (handles: FileSystemFileHandle[]) => {
    for (const handle of handles) await initTrack(handle)
    for (const handle of handles) await processTrack(handle)
  }

  // careful wtih DataTransferItemList: https://stackoverflow.com/questions/55658851/javascript-datatransfer-items-not-persisting-through-async-calls
  const filesDropped = async (files: DataTransferItemList) => {
    const handles = [...files].map(item => {
      if (item.kind === 'file') return item.getAsFileSystemHandle()
    })

    const handleArray = []

    for await (const handle of handles) {
      if (!handle) return failure()

      if (handle?.kind === 'directory') {
        for await (const entry of handle.values()) {
          if (entry.kind === 'file') {
            handleArray.push(entry)
          }
        }
      } else {
        handleArray.push(handle)
      }
    }

    await queueTracks(handleArray)
    setIsOver(false)
  }

  const browseFile = async () => {
    try {
      const files = await window.showOpenFilePicker({ multiple: true })
      queueTracks(files)
    } catch (e) {
      if (e?.message?.includes('user aborted a request')) return
      throw e
    }
  }

  const actions = (cell: void, row: { name: string }) => (
    <>
      <div
        onClick={e => {
          e.preventDefault()
          removeFile(row.name)
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

    return [
      {
        dataField: 'name',
        text: 'Track Name',
        sort: true,
        headerStyle: {
          color: '#333',
          textAlign: 'left' as const
        },
        sortCaret
      },
      {
        dataField: 'bpm',
        text: 'BPM',
        sort: true,
        headerStyle,
        classes,
        sortCaret,
        formatter: (cell: number | undefined) =>
          cell?.toFixed(0) || <Loader style={{ margin: 0 }} />
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
          </div>
        </div>
      </div>

      {!tracks ? (
        <Loader className='my-5' />
      ) : !tracks.length ? null : (
        <ToolkitProvider
          keyField='name'
          data={tracks}
          columns={columnDefs}
          search
        >
          {props => (
            <>
              <div className='d-flex mb-2'>
                <div>
                  <SearchBar {...props.searchProps} />
                </div>
                <div className='ml-auto px-2'>
                  <Badge className='mr-2 text-white' color='blue'>
                    {tracks.length}
                  </Badge>
                  {`Track${tracks.length === 1 ? '' : 's'}`}
                </div>
              </div>
              <Card className='mb-3 p-0 bt-0'>
                <BootstrapTable
                  classes='table-responsive-lg mb-0'
                  bordered={false}
                  hover
                  defaultSorted={[{ dataField: 'lastModified', order: 'desc' }]}
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
