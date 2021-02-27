import React from 'react'
import {
  Container,
  Card,
  Button,
  Input,
  Form,
  InputGroup,
  InputGroupAddon,
  FormGroup,
  CardBody,
  CardTitle
} from '../../../airframe/components'

import {
  HeaderMain
} from '../../../airframe/routes/components/HeaderMain'
import TrackForm from './trackform.js'

export const Mixes = () => {
  const login = () => console.log('login')

  return (
        <Container>
            <div className="d-flex">
                <div>
                    <HeaderMain title="Mixing Canvas"
                        className="mb-5 mt-4"
                    />
                </div>
                <Button onClick={login} className="ml-auto align-self-center" color="primary" outline>
                    Login to Spotify
                </Button>
            </div>

            <div className="mb-5">
                <TrackForm />
            </div>
        </Container>
  )
}
