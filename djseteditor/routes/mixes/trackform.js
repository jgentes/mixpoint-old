import React, { useRef, useState, useEffect } from "react";
import Peaks from 'peaks.js';
import { db } from '../../db';
import { Button, Progress } from '../../../airframe/components';
import { processTrack, getAudioBuffer } from '../../audio';
import { toast } from 'react-toastify';

let control; // for waveform play / pause controls;

export default function TrackForm() {
    const [sliderControl, setSliderControl] = useState({});
    const [audioSrc, setAudioSrc] = useState('');
    const [analyzing, setAnalyzing] = useState(0);

    const initPeaks = async (trackName, audioBuffer) => {
        const track = await db.tracks.get(trackName);
        if (!track) return toast.error(<>Sorry, <strong>{trackName}</strong> doesn't appear to be in your collection.</>);

        const file = await track.fileHandle.getFile();

        if (!audioBuffer) audioBuffer = await getAudioBuffer(file);

        const url = window.URL.createObjectURL(file);

        setAudioSrc(url);
        setAnalyzing(60);

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

            // reset options
            waveform.points.removeAll();
            waveform.segments.removeAll();
            waveform.zoom.setZoom(3); // 512
            options.containers.zoomview.onwheel = e => {
                e.preventDefault();
                e.deltaY == 100 ? waveform.zoom.zoomOut() : waveform.zoom.zoomIn();
            }

            const controlPeaks = [];
            const { duration, bpm, analysis: { peaks, sampleRate } } = track;
            const beatInterval = (60 / bpm) * 4; // assuming 4/4 timing for most music
            let time = peaks[0] / sampleRate;

            // work backward from initialPeak to peak out start of track (zerotime) based on bpm
            while (time - beatInterval > 0) time -= beatInterval;

            setAnalyzing(80)
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
            setAnalyzing(0)
        })
    }

    const audioChange = async () => {
        const [fileHandle] = await window.showOpenFilePicker();
        setAnalyzing(40)
        const { name, arrayBuffer } = await processTrack(fileHandle);
        initPeaks(name, arrayBuffer);
    }

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

            <Progress value={analyzing} className='m-xl-5' style={{ height: "3px" }} hidden={!analyzing} animated striped />

            <div id="peaks-container">
                <div id="zoomview-container"></div>
                <div id="overview-container" style={{ height: '60px' }}></div>
            </div>

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


            <audio src={audioSrc} />
        </>
    )
}