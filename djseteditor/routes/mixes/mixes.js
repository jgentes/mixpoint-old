import React from 'react'
import { Container, Button } from 'reactstrap'
import TrackForm from './trackform.js'

export const Mixes = () => {
  const login = () => console.log('login')

  return (
    <Container>
      <div className='d-flex'>
        <div className='mb-5 mt-4'>
          <h1 className='display-4 mr-3 mb-0 align-self-start'>
            Mixing Canvas
          </h1>
        </div>

        <Button
          onClick={login}
          className='ml-auto align-self-center'
          color='primary'
          outline
        >
          Login to Spotify
        </Button>
      </div>

      <div className='mb-5'>
        <TrackForm />
      </div>
    </Container>
  )
}
