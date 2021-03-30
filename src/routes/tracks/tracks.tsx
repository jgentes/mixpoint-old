import { useState, useEffect } from 'react'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider from 'react-bootstrap-table2-toolkit'
import { toast } from 'react-toastify'
import moment from 'moment'
import { db, Track, deleteTrack } from '../../db'
import { processTrack } from '../../audio'
import Loader from '../../layout/loader'
import { SearchBar } from './searchbar'
import { Card, Container, Badge, UncontrolledTooltip } from 'reactstrap'

export const Tracks = (props: {
  baseProps?: object
  searchProps?: object
  getTracksMock: Function
}) => {
  const [isOver, setIsOver] = useState(false)
  const [tracks, setTracks] = useState<Track[]>([])
  const [analyzing, setAnalyzing] = useState(false)

  const getTracks = () =>
    db.tracks.toArray().then(gotTracks => setTracks(gotTracks))

  useEffect(
    () => (props.getTracksMock ? props.getTracksMock() : getTracks()),
    []
  )

  const success = (trackName: string) => {
    toast.success(
      <>
        Loaded <strong>{trackName}</strong>
      </>,
      { autoClose: 3000 }
    )
  }

  const failure = (trackName?: string) => {
    toast.error(
      <>
        Sorry, there was a problem loading{' '}
        <strong>{trackName || `the track`}</strong>
      </>,
      { autoClose: 4000 }
    )
  }

  const getFile = async (name: string, fileHandle?: FileSystemFileHandle) => {
    let file

    if (!fileHandle) {
      file = await db.tracks.get(name)
      if (!file) {
        _removeFile(undefined, name)
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

  const _removeFile = async (e: MouseEvent | undefined, name: string) => {
    e?.preventDefault()
    await deleteTrack(name)
    toast.success(
      <>
        Deleted <strong>{name}</strong>
      </>,
      { autoClose: 3000 }
    )
    setTracks(tracks.filter((t: Track) => t.name !== name))
  }

  const _filesDropped = async (files: DataTransferItemList) => {
    for (const item of files) {
      if (item.kind === 'file') {
        setAnalyzing(true)
        console.warn('double check // do not await here!')

        const handle = await item.getAsFileSystemHandle()
        if (handle?.kind === 'directory') {
          toast.error(
            'Sorry, folder support is not ready yet. For now, you can select multiple files to add.'
          )
        } else {
          const track = await processTrack(handle)
          setAnalyzing(false)
          if (!track) failure()
          else success(track.name)
        }
      }
    }
    setIsOver(false)
  }

  const browseFile = async () => {
    try {
      const files = await window.showOpenFilePicker({ multiple: true })
      for (const fileHandle of files) {
        setAnalyzing(true)
        const track = await processTrack(fileHandle)
        if (!track) failure(fileHandle.name)
        else success(track.name)
      }

      setAnalyzing(false)
      getTracks()
    } catch (e) {
      if (e?.message?.includes('user aborted a request')) return
      throw e
    }
  }

  const actions = (cell: void, row: { name: string }) => (
    <>
      <div
        //onClick={e => _removeFile(e, row)}
        onClick={e => {
          e.preventDefault()
          getFile(row.name)
        }}
        id='UncontrolledTooltipDelete'
        style={{ cursor: 'pointer' }}
      >
        <i className='las la-15em la-times-circle text-danger'></i>
      </div>
      <UncontrolledTooltip placement='left' target='UncontrolledTooltipDelete'>
        Delete Track
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
        formatter: (cell: number) => cell.toFixed(0)
      },
      {
        dataField: 'duration',
        text: 'Duration',
        sort: true,
        headerStyle,
        classes,
        sortCaret,
        formatter: (cell: number) => `${(cell / 60).toFixed(1)}m`
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
        style: { minWidth: '140px' },
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
            _filesDropped(e.dataTransfer.items)
          }}
          onDragOver={e => e.preventDefault()}
          onDragEnter={() => setIsOver(true)}
          onDragLeave={() => setIsOver(false)}
        >
          <i className='las la-cloud-upload-alt la-fw la-3x drop'></i>
          <h5 className='mt-0 drop'>Add Tracks</h5>
          <div className='drop'>
            Drag a file here or <span className='text-primary'>browse</span> for
            a file to add.
          </div>
        </div>
      </div>

      <Loader
        style={{
          display: analyzing ? 'block' : 'none'
        }}
      />

      {!tracks.length ? null : (
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
