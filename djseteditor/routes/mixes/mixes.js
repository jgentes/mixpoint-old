import React, { useState } from 'react'
import { Container, Button } from 'reactstrap'
import TrackForm from './trackform.js'

export const Mixes = () => {
  const [tracks, addTrack] = useState([Date.now()])
  console.log({ tracks })
  return (
    <Container>
      <div className='d-flex'>
        <div className='mb-5 mt-4'>
          <h1 className='display-4 mr-3 mb-0 align-self-start'>
            Mixing Canvas
          </h1>
        </div>

        <Button
          onClick={() => addTrack([...tracks, Date.now()])}
          className='ml-auto align-self-center'
          color='primary'
          outline
        >
          Add Track
        </Button>
      </div>

      <div className='mb-5'>
        {tracks?.map(trackKey => (
          <TrackForm key={trackKey} trackKey={trackKey} />
        ))}
      </div>
    </Container>
  )
}
