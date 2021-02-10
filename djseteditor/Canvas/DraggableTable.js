import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
    DragDropContext,
    Droppable,
    Draggable
} from 'react-beautiful-dnd';
import classNames from 'classnames';

import {
    Table,
    Card,
    CardHeader,
    CardTitle
} from '../../airframe/components';
import { reorder } from './utilities';
import classes from './common.scss';



import TrackForm from './TrackForm.js';

const getTableClass = (isDraggedOver) =>
    classNames(classes['table'], {
        [classes['table--drag-over']]: isDraggedOver
    });

const getRowClass = (isDragging) =>
    classNames(classes['row'], {
        [classes['row--dragging']]: isDragging
    });

// Custom Table Cell - keeps cell width when the row
// is detached from the table
// ========================================================
class TableCell extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        isDragOccurring: PropTypes.bool
    };


    ref = React.createRef();

    getSnapshotBeforeUpdate(prevProps) {
        if (!this.ref) {
            return null;
        }
        const ref = this.ref.current;

        const isDragStarting =
            this.props.isDragOccurring && !prevProps.isDragOccurring;

        if (!isDragStarting) {
            return null;
        }

        const { width, height } = ref.getBoundingClientRect();

        const snapshot = { width, height };

        return snapshot;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.ref) {
            return;
        }
        const ref = this.ref.current;

        if (snapshot) {
            if (ref.style.width === snapshot.width) {
                return;
            }
            ref.style.width = `${snapshot.width}px`;
            ref.style.height = `${snapshot.height}px`;
            return;
        }

        if (this.props.isDragOccurring) {
            return;
        }

        // inline styles not applied
        if (ref.style.width == null) {
            return;
        }

        // no snapshot and drag is finished - clear the inline styles
        ref.style.removeProperty('height');
        ref.style.removeProperty('width');
    }



    render() {
        // eslint-disable-next-line no-unused-vars
        const { children, isDragOccurring, ...otherProps } = this.props;
        return <td ref={this.ref} {...otherProps}>{children}</td>;
    }
}

// Draggable Table Row
// ========================================================
const DraggableRow = (props) => {



    return (
        <Draggable
            draggableId={props.id}
            index={props.index}
        >
            {(provided, snapshot) => (
                <tr
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={getRowClass(snapshot.isDragging)}
                >
                    <TableCell
                        className="align-middle pl-0"
                        isDragOccurring={snapshot.isDragging}
                    >

                        <TrackForm />

                    </TableCell>

                    <TableCell
                        className="align-middle"
                        isDragOccurring={snapshot.isDragging}
                        {...provided.dragHandleProps}
                        width={'20px'}
                    >
                        <i className="fa fa-fw fa-arrows-v fa-lg d-block mx-auto text-muted" />
                    </TableCell>
                </tr>
            )}
        </Draggable>
    )
};
DraggableRow.propTypes = {
    index: PropTypes.number.isRequired
}

// Demo Component
// ========================================================
const initialState = [{ id: 'test' }];

export class DraggableTable extends React.Component {
    static propTypes = {
        className: PropTypes.string,
    }

    state = {
        users: initialState
    }

    constructor(props) {
        super(props);

        this.onDragEnd = this.onDragEnd.bind(this);
    }

    onDragEnd({ source, destination }) {
        if (!destination) {
            return;
        }

        const users = reorder(this.state.users,
            source.index, destination.index);
        this.setState({ users });
    }

    render() {
        return (
            <Card className={this.props.className}>
                <CardHeader className="bg-none bb-0">
                    <CardTitle className="h6">
                        Tracks
                    </CardTitle>
                </CardHeader>

                <DragDropContext onDragEnd={this.onDragEnd}>
                    <Table className="mb-0">
                        <thead>
                            <tr>
                                <th className="bt-0 text-center">Reorder</th>
                                <th className="bt-0">Wave</th>
                            </tr>
                        </thead>
                        <Droppable droppableId="table">
                            {(provided, snapshot) => (
                                <tbody
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={getTableClass(snapshot.isDraggingOver)}
                                >
                                    {_.map(this.state.users, (user, index) => (
                                        <DraggableRow
                                            key={user.id}
                                            index={index}
                                            {...user}
                                        />
                                    ))}
                                </tbody>
                            )}
                        </Droppable>
                    </Table>
                </DragDropContext>
            </Card>
        );
    }
}
