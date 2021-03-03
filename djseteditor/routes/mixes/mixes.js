import React from 'react'
import { Container, Button, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import TrackForm from './trackform.js'

export const Mixes = () => {
  const tracks = [1, 2]

  return (
    <Container>
      <div className='d-flex'>
        <Breadcrumb className='align-self-start'>
          <BreadcrumbItem>
            <a href='/mixes'>Mixes</a>
          </BreadcrumbItem>
          <BreadcrumbItem active>Mix Editor</BreadcrumbItem>
        </Breadcrumb>

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
