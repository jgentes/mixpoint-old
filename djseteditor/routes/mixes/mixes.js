import React, { useEffect, useState } from 'react'
import { Container, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import Toggle from 'react-toggle'
import TrackForm from './trackform.js'
import { getMixState, putMixState } from '../../db'

export const Mixes = () => {
  const tracks = [1, 2]
  const [mixState, setMixState] = useState({})

  const updateMix = async obj => {
    const newState = { ...mixState, ...obj }
    setMixState(newState)
    putMixState(newState)
  }

  const updateTrack = async obj => {
    const newState = {
      ...mixState,
      ...{ tracks: { ...mixState.tracks, ...obj } }
    }
    setMixState(newState)
    putMixState(newState)
  }

  useEffect(() => {
    // pull state from db to hyrdate component state
    const getState = async () => await getMixState()
    getState().then(setMixState)
  }, [])

  console.log('mixstate:', mixState)
  const bpmControl = (
    <div className='mt-3'>
      <Toggle
        checked={mixState.bpmSync || false}
        size='small'
        icons={{
          checked: <i className='fa fa-check text-white' />,
          unchecked: null
        }}
        onChange={() => updateMix({ bpmSync: true })}
      />
      <span className='ml-2' style={{ verticalAlign: 'top' }}>
        BPM Sync
      </span>
    </div>
  )

  return (
    <Container>
      <div className='d-flex justify-content-between'>
        <Breadcrumb className='align-self-start'>
          <BreadcrumbItem className='mt-1'>
            <a href='/mixes'>Mixes</a>
          </BreadcrumbItem>
          <BreadcrumbItem className='mt-1' active>
            Mix Editor
          </BreadcrumbItem>
        </Breadcrumb>

        {bpmControl}

        {/*
        <Button
          onClick={() => addTrack([...tracks, Date.now()])}
          className='ml-auto align-self-center'
          color='primary'
          outline
        >
          Add Track
        </Button>
        */}
      </div>

      <div className='mb-5'>
        {tracks?.map(trackKey => (
          <TrackForm
            key={trackKey}
            trackKey={trackKey}
            mixState={mixState}
            updateTrack={updateTrack}
          />
        ))}
      </div>
    </Container>
  )
}
