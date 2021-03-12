import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider from 'react-bootstrap-table2-toolkit'
import { toast } from 'react-toastify'
import moment from 'moment'
import { db, deleteTrack } from '../../db'
import { processTrack } from '../../audio'
import Loader from '../../layout/loader'
import { SearchBar } from './SearchBar'
import { Card, Container, Badge, UncontrolledTooltip } from 'reactstrap'

const sortCaret = order => {
  if (!order) {
    return <i className='las la-fw la-sort text-muted'></i>
  }
  if (order) {
    return <i className={`las la-fw text-muted la-sort-${order}`}></i>
  }
}

export const Tracks = () => {
  const [isOver, setIsOver] = useState(false)
  const [tracks, setTracks] = useState([])
  const [analyzing, setAnalyzing] = useState(false)

  const getTracks = () => {
    db.tracks.toArray().then(tracks => setTracks(tracks))
  }

  useEffect(() => getTracks(), [])

  const success = () => {
    toast.success(
      <>
        Loaded <strong>{track.name}</strong>
      </>,
      { autoClose: 3000 }
    )
  }

  const getFile = async (e, row) => {
    event.preventDefault()
    try {
      // const file = await get('file')
      let file
      try {
        file = await row.fileHandle.getFile()
        if (file) return toast.success(file.name)
      } catch (e) {
        console.log('GETFILE caught:', e)
        await row.fileHandle.requestPermission()
      }

      return toast.error('no file', file)
    } catch (e) {
      toast.error(`caught getfile ${e}`)
    }
  }

  const _removeFile = async (e, row) => {
    e.preventDefault()
    await deleteTrack(row.name)
    toast.success(
      <>
        Deleted <strong>{row.name}</strong>
      </>
    )
    setTracks(tracks.filter(t => t.name !== row.name))
  }

  const _filesDropped = event => {
    event.preventDefault()
    for (const item of event.dataTransfer.items) {
      if (item.kind === 'file') {
        setAnalyzing(true)
        // do not await here!
        item.getAsFileSystemHandle().then(async fileHandle => {
          if (fileHandle.kind === 'directory') {
            toast.error(
              'Sorry, folder support is not ready yet. For now, you can select multiple files to add.'
            )
          } else {
            await processTrack(fileHandle)
            setAnalyzing(false)
            success()
          }
        })
      }
    }
    setIsOver(false)
  }

  const browseFile = async () => {
    try {
      const files = await window.showOpenFilePicker({ multiple: true })
      for (let fileHandle of files) {
        setAnalyzing(true)
        await processTrack(fileHandle)
        await set('file', fileHandle)
      }

      setAnalyzing(false)
      success()
      getTracks()
    } catch (e) {
      if (e?.message?.includes('user aborted a request')) return
      throw e
    }
  }

  const actions = (cell, row) => (
    <>
      <div
        //onClick={e => _removeFile(e, row)}
        onClick={e => getFile(e, row)}
        id='UncontrolledTooltipDelete'
        style={{ cursor: 'pointer' }}
      >
        <i className='las la-fw la-close text-danger'></i>
      </div>
      <UncontrolledTooltip placement='left' target='UncontrolledTooltipDelete'>
        Delete Track
      </UncontrolledTooltip>
    </>
  )

  const createColumnDefinitions = () => {
    const classes = 'text-center'
    const headerStyle = {
      color: '#333',
      textAlign: 'center'
    }

    return [
      {
        dataField: 'name',
        text: 'Track Name',
        sort: true,
        headerStyle: {
          color: '#333',
          textAlign: 'left'
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
        formatter: cell => cell.toFixed(0)
      },
      {
        dataField: 'duration',
        text: 'Duration',
        sort: true,
        headerStyle,
        classes,
        sortCaret,
        formatter: cell => `${(cell / 60).toFixed(1)}m`
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
        formatter: cell => moment(cell).fromNow()
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
          onDrop={e => _filesDropped(e)}
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
            <React.Fragment>
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
                  boostrap4={true}
                  responsive
                  hover
                  {...props.baseProps}
                />
              </Card>
            </React.Fragment>
          )}
        </ToolkitProvider>
      )}
    </Container>
  )
}

Tracks.propTypes = {
  baseProps: PropTypes.object,
  searchProps: PropTypes.object
}
