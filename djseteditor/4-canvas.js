import React from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Badge,
    ButtonGroup,
    Progress,
    Button,
    ButtonToolbar,
    Nav,
    CustomInput,
    NavItem,
    Input,
    Form,
    InputGroup,
    InputGroupAddon,
    FormGroup,
    Pagination,
    PaginationItem,
    PaginationLink,
    TabPane,
    UncontrolledTabs,
    UncontrolledButtonDropdown,
    DropdownMenu,
    DropdownItem,
    DropdownToggle,
    CardHeader,
    CardBody,
    CardTitle
} from '../airframe/components';

import {
    HeaderMain
} from '../airframe/routes/components/HeaderMain';
import {
    HeaderDemo
} from '../airframe/routes/components/HeaderDemo';

import {
    DraggableTable
} from './Canvas/DraggableTable';

const LOCALSTORAGE_ACCESS_TOKEN_KEY = 'djseteditor-spotify-token';
const LOCALSTORAGE_ACCESS_TOKEN_EXPIRY_KEY = 'djseteditor-spotify-token-expires-in';


export const Canvas = () => {
    const draggableTableRef = React.createRef();

    const login = () => console.log('login');

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
                <HeaderDemo
                    no="2"
                    title="Table"
                    subTitle="Allows reordering of the table rows"
                />
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
                        </CardBody>
                </Card>
                <DraggableTable ref={draggableTableRef} />
            </div>
        </Container>
    );
}
