import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import FileDrop from 'react-dropzone';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import faker from 'faker/locale/en_US';
import superagent from 'superagent';
import { toast } from 'react-toastify';
import db from '../../db';
const { analyze } = require('../../../bpm');

import {
    Card,
    Container,
    Badge,
    Row,
    Col,
    UncontrolledTooltip,
} from '../../../airframe/components';

import { CustomSearch } from '../../../airframe/routes/Tables/ExtendedTable/components/CustomSearch';
import { randomArray } from '../../../airframe/utilities';

const sortCaret = (order) => {
    if (!order)
        return <i className="fa fa-fw fa-sort text-muted"></i>;
    if (order)
        return <i className={`fa fa-fw text-muted fa-sort-${order}`}></i>
};

const formatTracks = tracks => tracks.map((name, id) => ({
    id,
    name: name.name ?? name,
    bpm: randomArray([90, 98, 83, 94, 122, 101, 110, 113, 109, 114, 98, 102, 115]),
    duration: faker.random.number(8),
    mixes: faker.random.number(8),
    sets: faker.random.number(8),
    uploaded: faker.date.past()
}))

export const Tracks = () => {
    const [isOver, setIsOver] = useState(false);
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        // pull list of tracks from the server
        superagent.get('/api/tracks').then(res => setTracks(formatTracks(res.body)));
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
                sortCaret
            }, {
                dataField: 'duration',
                text: 'Duration',
                sort: true,
                headerStyle,
                classes,
                sortCaret
            },
            {
                dataField: 'mixes',
                text: 'Mixes',
                sort: true,
                headerStyle,
                classes,
                sortCaret,
            }, {
                dataField: 'sets',
                text: 'Sets',
                sort: true,
                headerStyle,
                classes,
                sortCaret
            },
            {
                dataField: 'uploaded',
                text: 'Uploaded',
                sort: true,
                headerStyle,
                classes,
                sortCaret,
                formatter: (cell, row) => (
                    <span>
                        {new Date(cell).toDateString()}
                    </span>
                )
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

    const _removeFile = (e, row) => {
        e.preventDefault();

    }

    const _filesDropped = files => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        var reader = new FileReader();
        reader.onloadend = function (e) {
            audioCtx.decodeAudioData(e.target.result).then(audioBuffer => {
                analyze(audioBuffer)
                    .then(data => {
                        console.log({ data })
                    })
            }).catch(e => console.error(e));

            //resolve(e.target.result);
        };
        reader.onerror = function (e) {
            reject(e.target.error);
        };

        reader.readAsArrayBuffer(files[0]);




        /*
                const todo = {
                    title,
                    done: false,
                };
                db.table('todos')
                    .add(todo)
                    .then((id) => {
                        const newList = [...this.state.todos, Object.assign({}, todo, { id })];
                        this.setState({ todos: newList });
                    });
                
                if (!err) {
                    toast.success(res.text);
                    return setTracks(formatTracks([...files, ...tracks]));
                }
        
                toast.error(res.text)
        */
        setIsOver(false)
    }

    return (
        <Container>
            <div className="mt-4 mb-4">
                <FileDrop
                    multiple
                    onDragEnter={() => setIsOver(true)}
                    onDragLeave={() => setIsOver(false)}
                    onDrop={_filesDropped}
                >
                    {
                        ({ getRootProps, getInputProps }) => (
                            <div {...getRootProps()} className={dropzoneClass}>
                                <i className="fa fa-cloud-upload fa-fw fa-3x"></i>
                                <h5 className='mt-0'>
                                    Upload Tracks
                                    </h5>
                                <div>
                                    Drag a file here or <span className='text-primary'>browse</span> for a file to upload.
                                    </div>
                                <input {...getInputProps()} />
                            </div>
                        )
                    }

                </FileDrop>
            </div>
            {!tracks.length ? null :
                <ToolkitProvider
                    keyField="id"
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