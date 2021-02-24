import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import { toast } from 'react-toastify';
import moment from 'moment';
import { db, deleteTrack } from '../../db';
import { processTrack } from '../../audio';
import Loader from '../../layout/loader';

import {
    Card,
    Container,
    Badge,
    UncontrolledTooltip,
} from '../../../airframe/components';

import { CustomSearch } from '../../../airframe/routes/Tables/ExtendedTable/components/CustomSearch';

const sortCaret = (order) => {
    if (!order)
        return <i className="fa fa-fw fa-sort text-muted"></i>;
    if (order)
        return <i className={`fa fa-fw text-muted fa-sort-${order}`}></i>
};

export const Tracks = () => {
    const [isOver, setIsOver] = useState(false);
    const [tracks, setTracks] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const getTracks = async () => {
            db.tracks.toArray().then(tracks => setTracks(tracks));
        };
        getTracks();
    }, []);

    const actions = (cell, row) => <>
        <div onClick={e => _removeFile(e, row)} id="UncontrolledTooltipDelete" style={{ cursor: 'pointer' }}>
            <i className="fa fa-fw fa-close text-danger"></i>
        </div>
        <UncontrolledTooltip placement="left" target="UncontrolledTooltipDelete">
            Delete Track
    </UncontrolledTooltip>
    </>

    const createColumnDefinitions = () => {
        const classes = 'text-center';
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
            }, {
                dataField: 'bpm',
                text: 'BPM',
                sort: true,
                headerStyle,
                classes,
                sortCaret,
                formatter: cell => cell.toFixed(0)
            }, {
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
            }, {
                dataField: 'sets',
                text: 'Sets',
                sort: true,
                headerStyle,
                classes,
                sortCaret
            },
            {
                dataField: 'lastModified',
                text: 'Uploaded',
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
        ];
    }

    const dropzoneClass = classNames({
        'dropzone--active': isOver
    }, 'dropzone');

    const columnDefs = createColumnDefinitions();

    const _removeFile = async (e, row) => {
        e.preventDefault();
        await deleteTrack(row.name);
        toast.success(<>Deleted <strong>{row.name}</strong></>)
        setTracks(tracks.filter(t => t.name !== row.name));
    }

    const _filesDropped = event => {
        event.preventDefault();
        for (const item of event.dataTransfer.items) {
            if (item.kind === 'file') {
                setAnalyzing(true)
                // do not await here!
                item.getAsFileSystemHandle().then(async fileHandle => {
                    if (fileHandle.kind === 'directory') {
                        toast.error('Sorry, folder support is not ready yet. For now, you can select multiple files to add.')
                    } else {
                        await processTrack(fileHandle);
                        setAnalyzing(false)
                    }
                })
            }
        }
        setIsOver(false)
    }

    const browseFile = async () => {
        const files = await window.showOpenFilePicker({ multiple: true });
        files.forEach(async fileHandle => {
            setAnalyzing(true)
            await processTrack(fileHandle);
            setAnalyzing(false)
        })
    }

    return (
        <Container>
            <div className="mt-4 mb-4">
                <div
                    onClick={browseFile}
                    className={dropzoneClass}
                    onDrop={e => _filesDropped(e)}
                    onDragOver={e => e.preventDefault()}
                    onDragEnter={() => setIsOver(true)}
                    onDragLeave={() => setIsOver(false)}
                >
                    <i className="fa fa-cloud-upload fa-fw fa-3x drop"></i>
                    <h5 className='mt-0 drop'>
                        Add Tracks
                    </h5>
                    <div className='drop'>
                        Drag a file here or <span className='text-primary'>browse</span> for a file to add.
                    </div>
                </div>
            </div>

            <Loader hidden={!analyzing} />

            {!tracks.length ? null :
                <ToolkitProvider
                    keyField="name"
                    data={tracks}
                    columns={columnDefs}
                    search
                >
                    {
                        props => (
                            <React.Fragment>
                                <div className="d-flex mb-2">
                                    <div>
                                        <CustomSearch
                                            {...props.searchProps}
                                        />
                                    </div>
                                    <div className="ml-auto px-2">
                                        <Badge
                                            className="mr-2 text-white"
                                            color="blue"
                                        >
                                            {tracks.length}
                                        </Badge>
                                        {`Track${tracks.length == 1 ? '' : 's'}`}
                                    </div>
                                </div>
                                <Card className="mb-3 p-0 bt-0">
                                    <BootstrapTable
                                        classes="table-responsive-lg mb-0"
                                        bordered={false}
                                        responsive
                                        hover
                                        {...props.baseProps}
                                    />
                                </Card>

                            </React.Fragment>
                        )
                    }
                </ToolkitProvider>
            }
        </Container>
    );
}