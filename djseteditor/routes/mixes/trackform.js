import React, { useRef, useState, useEffect } from "react";
import Peaks from 'peaks.js';
import { db } from '../../db';
import { Button, Row, Col, Card, CardBody, Form, FormGroup, InputGroup, InputGroupAddon, Input } from '../../../airframe/components';
import { processTrack, getAudioBuffer, analyze } from '../../audio';
import { toast } from 'react-toastify';
import Loader from '../../layout/loader';

let control; // for waveform play / pause controls;

export default function TrackForm() {
    const audioElement = useRef();

    const [sliderControl, setSliderControl] = useState({});
    const [audioSrc, setAudioSrc] = useState('');
    const [analyzing, setAnalyzing] = useState(0);
    const [primaryTrack, setTrack] = useState({});
    const [primaryBuffer, setBuffer] = useState();
    const [bpmOptions, setOptions] = useState({});
    const [adjustedBpm, setBpm] = useState();

    const initPeaks = async ({ track = primaryTrack, audioBuffer = primaryBuffer, audioCtx, offset, tempo }) => {
        const file = await track.fileHandle.getFile();

        if (!audioBuffer) {
            audioBuffer = await getAudioBuffer(file);
            setBuffer(audioBuffer);
        }

        const url = window.URL.createObjectURL(file);

        setAudioSrc(url);
        setAnalyzing(true)

        const options = {
            containers: {
                overview: document.getElementById('overview-container'),
                zoomview: document.getElementById('zoomview-container')
            },
            mediaElement: document.querySelector('audio'),
            webAudio: {
                audioBuffer
            },
            pointMarkerColor: 'rgba(30, 139, 195, 1)',
            zoomLevels: [128, 256, 512, 1024, 2048],
            zoomWaveformColor: '#aaa',
            overviewWaveformColor: 'rgba(89, 165, 89, 0.7)'
        };

        Peaks.init(options, function (err, waveform) {
            if (err) return toast.error(err.message);

            // set options
            waveform.zoom.setZoom(3); // 512
            options.containers.zoomview.onwheel = e => {
                e.preventDefault();
                e.deltaY == 100 ? waveform.zoom.zoomOut() : waveform.zoom.zoomIn();
            }

            const controlPeaks = [];
            const { duration, bpm, analysis: { peaks, sampleRate } } = track;
            const beatInterval = (60 / tempo || bpm); // assuming 4/4 timing for most music
            console.log('tempo:', tempo, 'beatinterval:', beatInterval, 'adjusted:', adjustedBpm, 'offset:', offset)
            // if bpm has been adjusted, update audio element
            if (adjustedBpm) audioElement.current.playbackRate = adjustedBpm / bpm;

            //  let time = peaks[0] / sampleRate;
            let time = offset;

            // work backward from initialPeak to peak out start of track (zerotime) based on bpm
            while (time - beatInterval > 0) time -= beatInterval;

            // now that we have zerotime, move forward with peaks based on the bpm (hope the bpm is accurate!)

            while (time < duration) {
                waveform.points.add({ time });
                controlPeaks.push(time);
                time += beatInterval;
            }

            // create initial segment
            waveform.segments.add({
                startTime: controlPeaks[0],
                endTime: controlPeaks[31],
                color: 'rgba(191, 191, 63, 0.5)',
                editable: true,
            })
            /* 
            
                        setSliderControl({
                            min: controlPeaks[0],
                            max: controlPeaks[31],
                            step: beatInterval
                        });
             */

            control = waveform;
            setAnalyzing(false)
        })
    }

    const audioChange = async () => {
        const [fileHandle] = await window.showOpenFilePicker();
        setAnalyzing(true)
        const { track, audioBuffer, audioCtx, offset, tempo } = await processTrack(fileHandle);
        setBuffer(audioBuffer);
        setTrack(track);
        initPeaks({ track, audioBuffer, audioCtx, offset, tempo });
    }

    const bpmTest = async form => {
        form.preventDefault();
        const formData = new FormData(form.target),
            newOptions = Object.fromEntries(formData.entries())
        setOptions(newOptions);
        const { track, audioBuffer, audioCtx, renderedBuffer } = await processTrack(primaryTrack.fileHandle, newOptions)
        initPeaks(track, renderedBuffer, audioCtx);
    }

    const adjustBPM = form => {
        form.preventDefault();
        const formData = new FormData(form.target),
            { newBpm } = Object.fromEntries(formData.entries())
        setBpm(newBpm);
        initPeaks();
    };

    return (
        <>
            <div>
                <Button color="success" onClick={() => control.player.play()}>
                    <i className="fa fa-play mr-2"></i>
                                Play</Button>
                <Button color="danger" onClick={() => control.player.pause()}>
                    <i className="fa fa-pause mr-2"></i>
                                Pause</Button>
                <Button color="warning" onClick={audioChange}>
                    <i className="fa fa-eject mr-2"></i>
                                Load</Button>
            </div >

            {!primaryTrack.name ? null : <div className='m-lg'>{primaryTrack.name}</div>}

            <Form inline className="ml-auto" onSubmit={adjustBPM}>
                <FormGroup>
                    <InputGroup size="sm">
                        <Input type="text" name="newBpm" className="ml-auto" placeholder={primaryTrack?.bpm || 0} />
                        <InputGroupAddon addonType="append">
                            <Button color="primary">
                                Adjust BPM
                                                </Button>
                        </InputGroupAddon>
                    </InputGroup>
                </FormGroup>
            </Form>

            <Loader hidden={!analyzing} />

            <div id="peaks-container">
                <div id="zoomview-container"></div>
                <div id="overview-container" style={{ height: '60px' }}></div>
            </div>

            <Row>
                <Col lg={12}>
                    <Card className="mb-3">
                        <CardBody>
                            <Form inline onSubmit={bpmTest}>
                                <FormGroup className="mb-2 mr-sm-2">
                                    <InputGroupAddon addonType="prepend">
                                        Initial Threshold
                                        </InputGroupAddon>
                                    <Input type="number" step=".1" name="initThreshold" id="initThreshold" placeholder={bpmOptions.initThreshold || .9} />
                                </FormGroup>
                                <FormGroup className="mb-2 mr-sm-2">
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                            Minimum Peaks
                                        </InputGroupAddon>
                                        <Input type="number" step="1" name="minPeaks" placeholder={bpmOptions.minPeaks || 30} />
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup className="mb-2 mr-sm-2">
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                            Minimum Threshold
                                        </InputGroupAddon>
                                        <Input type="number" step=".1" name="minThreshold" placeholder={bpmOptions.minThreshold || .3} />
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup className="mb-2 mr-sm-2">
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                            Lowpass Freq
                                        </InputGroupAddon>
                                        <Input type="number" step="50" name="lowpass" placeholder={bpmOptions.lowpass || 150} />
                                    </InputGroup>
                                </FormGroup>
                                <Button color="primary" type='submit'>
                                    Submit
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <div className="d-flex">
                <Button color="secondary" outline size="sm" className="mr-2 align-self-center text-center">
                    <i className="fa fa-fw fa-caret-left"></i>
                    <div>Prev</div>
                </Button>
                <Button color="secondary" size="lg" className="mr-2 align-self-center text-center">
                    <i className="fa fa-fw fa-check"></i>
                    <div>Confirm</div>
                </Button>
                <Button color="secondary" outline size="sm" className="mr-2 align-self-center">
                    <i className="fa fa-fw fa-caret-right"></i>
                    <div>Next</div>
                </Button>
            </div>

            <audio src={audioSrc} ref={audioElement} />
        </>
    )
}