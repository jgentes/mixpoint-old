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
                <Card className="mb-3">
                    <CardBody>
                        <div className="d-flex mb-3">
                            <CardTitle tag="h6" className="mb-0 align-self-center">
                                Right Input Button
                                </CardTitle>
                            <Form inline className="ml-auto">
                                <FormGroup>
                                    <InputGroup size="sm">
                                        <Input type="text" name="text" id="text" className="ml-auto" placeholder="Enter..." />
                                        <InputGroupAddon addonType="append">
                                            <Button color="primary">
                                                Search
                                                </Button>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                            </Form>
                        </div>
                            TEst card

                        <TrackForm />
                    </CardBody>
                </Card>
            </div>
        </Container>
  )
}
