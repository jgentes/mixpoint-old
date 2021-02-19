import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import FileDrop from 'react-dropzone';
import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider from 'react-bootstrap-table2-toolkit';
import moment from 'moment';
import _ from 'lodash';
import faker from 'faker/locale/en_US';
import superagent from 'superagent';
import { toast } from 'react-toastify';

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

const actions = (cell, row, rowIndex) => <>
    <div onClick={e => _removeFile(e, row, rowIndex)} id="UncontrolledTooltipDelete">
        <i className="fa fa-fw fa-close text-danger"></i>
    </div>
    <UncontrolledTooltip placement="left" target="UncontrolledTooltipDelete">
        Delete Track
    </UncontrolledTooltip>
</>

const _removeFile = (e, row, rowIndex) => {
    e.preventDefault();
    console.log('row, rowIndex:', row, rowIndex)
}

const sortCaret = (order) => {
    if (!order)
        return <i className="fa fa-fw fa-sort text-muted"></i>;
    if (order)
        return <i className={`fa fa-fw text-muted fa-sort-${order}`}></i>
};

const formatTracks = tracks => tracks.map((name, id) => ({
    id,
    name,
    bpm: randomArray([90, 98, 83, 94, 122, 101, 110, 113, 109, 114, 98, 102, 115]),
    duration: faker.random.number(8),
    mixes: faker.random.number(8),
    sets: faker.random.number(8),
    uploaded: faker.date.past()
}))


export const Dropzone = () => {
    const [isOver, setIsOver] = useState(false);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        // pull list of tracks from the server
        superagent.get('http://localhost:3000/tracks').then(res => setFiles(formatTracks(res.body)));
    }, []);

    const createColumnDefinitions = () => {
        return [
            {
                dataField: 'name',
                text: 'Track Name',
                sort: true,
                sortCaret
            }, {
                dataField: 'bpm',
                text: 'BPM',
                sort: true,
                sortCaret
            }, {
                dataField: 'duration',
                text: 'Duration',
                sort: true,
                sortCaret
            },
            {
                dataField: 'mixes',
                text: 'Mixes',
                sort: true,
                sortCaret,
            }, {
                dataField: 'sets',
                text: 'Sets',
                sort: true,
                sortCaret
            },
            {
                dataField: 'uploaded',
                text: 'Uploaded',
                sort: true,
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
                formatter: actions
            }
        ];
    }

    const dropzoneClass = classNames({
        'dropzone--active': isOver
    }, 'dropzone');

    const columnDefs = createColumnDefinitions();

    const _filesDropped = files => {
        const req = superagent.post('http://localhost:3000/upload')
        console.log('files:', files)
        files.forEach(file => {
            req.attach(file.name, file)
        })

        req.end((err, res) => {
            if (!err) {
                toast.success(res.text);
                return setFiles(files);
            }

            toast.error(res.text)
        })

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

            <ToolkitProvider
                keyField="id"
                data={files}
                columns={columnDefs}
                search
            >
                {
                    props => (
                        <React.Fragment>
                            <div className="d-flex mb-2">
                                <div className="px-2">
                                    <Badge
                                        className="mr-2 text-white"
                                        pill
                                        color="secondary"
                                    >
                                        {files.length}
                                    </Badge>
                                    {`Track${files.length == 1 ? '' : 's'}`}
                                </div>
                                <div className="d-flex ml-auto">
                                    <CustomSearch
                                        {...props.searchProps}
                                    />
                                </div>
                            </div>
                            <Card className="mb-3 p-0 bt-0">
                                <BootstrapTable
                                    classes="table-responsive-lg"
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
        </Container>
    );
}