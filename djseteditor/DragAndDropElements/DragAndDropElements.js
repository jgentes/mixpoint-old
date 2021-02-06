import React from 'react';

import {
    Container,
    Button,
} from '../../airframe/components';
import {
    HeaderMain
} from '../../airframe/routes/components/HeaderMain';
import {
    HeaderDemo
} from '../../airframe/routes/components/HeaderDemo';

import {
    DraggableTable
} from './components';

export class DragAndDropElements extends React.Component {
    draggableTableRef = React.createRef();

    onResetState = () => {
        this.draggableTableRef.current.recoverInitialState();
    }

    render() {
        return (
            <Container>
            <div className="d-flex">
                <div>
                    <HeaderMain title="Drag &amp; Drop Elements" 
                        className="mb-5 mt-4"
                    />
                </div>
                <Button onClick={ this.onResetState } className="ml-auto align-self-center" color="primary" outline>
                    Reset Layout
                </Button>
            </div>

            <div className="mb-5">
                <HeaderDemo
                    no="2"
                    title="Table"
                    subTitle="Allows reordering of the table rows"
                />
                <DraggableTable ref={ this.draggableTableRef }/>
            </div>
        </Container>
        );
    }
}
