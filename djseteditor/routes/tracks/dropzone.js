import React, { useState } from 'react';
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
    Col
} from '../../../airframe/components';

import { CustomSearch } from '../../../airframe/routes/Tables/ExtendedTable/components/CustomSearch';
import { randomArray } from '../../../airframe/utilities';

const generateRow = (id) => ({
    id,
    name: faker.name.firstName(),
    bpm: randomArray([90, 98, 83, 94, 122, 101, 110, 113, 109, 114, 98, 102, 115]),
    duration: faker.random.number(8),
    mixes: faker.random.number(8),
    sets: faker.random.number(8),
    uploaded: faker.date.past()
});

const sortCaret = (order) => {
    if (!order)
        return <i className="fa fa-fw fa-sort text-muted"></i>;
    if (order)
        return <i className={`fa fa-fw text-muted fa-sort-${order}`}></i>
};


export const Dropzone = () => {
    const [isOver, setIsOver] = useState(false);
    const [files, setFiles] = useState([]);
    const [tracks, setTracks] = useState(_.times(10, generateRow));

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
        ];
    }

    const dropzoneClass = classNames({
        'dropzone--active': isOver
    }, 'dropzone');

    const columnDefs = createColumnDefinitions();

    const expandRow = {
        renderer: row => (
            <Row>
                <Col md={6}>
                    <dl className="row">
                        <dt className="col-sm-6 text-right">Last Login</dt>
                        <dd className="col-sm-6">{moment(row.lastLoginDate).format('DD-MMM-YYYY')}</dd>

                        <dt className="col-sm-6 text-right">IP Address</dt>
                        <dd className="col-sm-6">{row.ipAddress}</dd>

                        <dt className="col-sm-6 text-right">Browser</dt>
                        <dd className="col-sm-6">{row.browser}</dd>
                    </dl>
                </Col>
                <Col md={6}>
                    <dl className="row">
                        <dt className="col-sm-6 text-right">Operating System</dt>
                        <dd className="col-sm-6">{row.os}</dd>

                        <dt className="col-sm-6 text-right">Selected Plan</dt>
                        <dd className="col-sm-6">{row.planSelected}</dd>

                        <dt className="col-sm-6 text-right">Plan Expiriation</dt>
                        <dd className="col-sm-6">{moment(row.planEnd).format('DD-MMM-YYYY')}</dd>
                    </dl>
                </Col>
            </Row>
        ),
        showExpandColumn: true,
        expandHeaderColumnRenderer: ({ isAnyExpands }) => isAnyExpands ? (
            <i className="fa fa-angle-down fa-fw fa-lg text-muted"></i>
        ) : (
                <i className="fa fa-angle-right fa-fw fa-lg text-muted"></i>
            ),
        expandColumnRenderer: ({ expanded }) =>
            expanded ? (
                <i className="fa fa-angle-down fa-fw fa-lg text-muted"></i>
            ) : (
                    <i className="fa fa-angle-right fa-fw fa-lg text-muted"></i>
                )
    }

    const _filesDropped = files => {
        const req = superagent.post('http://localhost:3000/upload')

        files.forEach(file => {
            req.attach(file.name, file)
        })

        req.end((err, res) => {
            if (!err) return setFiles(files);

            toast.error(err.message)
        })

        setIsOver(false)
    }

    const _removeFile = (file) => setFiles[_.reject(files, file)];

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
                data={tracks}
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
                                    expandRow={expandRow}
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