import React, { useRef, useState, useEffect } from "react";
//https://github.com/jrhalchak/BeatsPM/blob/1535622c0ae03a112cbe13c7d6deb1df1d3d0104/app/components/AudioDetection.js
import { analyze } from '../../bpm';
import Peaks from 'peaks.js';
import { Button } from '../../../airframe/components';

const testFile = "/api/assets/DELETEME-Attom-Shibui.mp3"

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const request = new XMLHttpRequest();

let track; // for browser controls;

export default function TrackForm() {
    const [sliderControl, setSliderControl] = useState({});
    const [audioSrc, setAudioSrc] = useState();
    const [detecting, setDetecting] = useState(false);
    const [filename, setFilename] = useState();

    const initPeaks = audioBuffer => {
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
            zoomWaveformColor: '#aaa'
        };

        Peaks.init(options, function (err, trackPeaks) {
            track = trackPeaks;
            track.zoom.setZoom(3); // 512
            options.containers.zoomview.onwheel = e => {
                e.preventDefault();
                e.deltaY == 100 ? track.zoom.zoomOut() : track.zoom.zoomIn();
            }

            analyze(audioBuffer)
                .then(data => {
                    console.log({ data })
                    const controlPeaks = [];
                    const { sampleRate, duration, peaks, bpm } = data;
                    const beatInterval = (60 / bpm) * 4; // assuming 4/4 timing for most music
                    let time = peaks[0] / sampleRate;

                    // work backward from initialPeak to peak out start of track (zerotime) based on bpm
                    while (time - beatInterval > 0) time -= beatInterval;

                    // now that we have zerotime, move forward with peaks based on the bpm (hope the bpm is accurate!)
                    while (time < duration) {
                        track.points.add({ time });
                        controlPeaks.push(time);
                        time += beatInterval;
                    }

                    // create initial segment
                    track.segments.add({
                        startTime: controlPeaks[0],
                        endTime: controlPeaks[31],
                        color: 'rgba(191, 191, 63, 0.5)',
                        editable: true,
                    })

                    setDetecting(false);

                    setSliderControl({
                        min: controlPeaks[0],
                        max: controlPeaks[31],
                        step: beatInterval
                    });

                    console.log({ sliderControl })

                })
                .catch(e => console.error(e))
        });
    }

    useEffect(() => {
        request.open('GET', testFile, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            const audioData = request.response;
            setDetecting(true);

            audioCtx.decodeAudioData(audioData).then(audioBuffer => {
                initPeaks(audioBuffer);
            }).catch(e => console.error(e));
        }
        request.send();
    }, [])

    const audioChange = e => {
        const file = e.target.files[0];
        const blobUrl = URL.createObjectURL(file);
        const reader = new FileReader();

        setDetecting(true);
        setFilename(file.name);

        /* eslint-disable */
        reader.onload = () => {
            (new AudioContext()).decodeAudioData(reader.result)
                .then((result) => {
                    initPeaks(result);
                })
                .catch(e => console.error(e));
        };
        /* eslint-enable */

        reader.readAsArrayBuffer(file);
        setAudioSrc(blobUrl);
    }

    return (
        <>
            <div>
                <Button color="success" onClick={() => track.player.play()}>
                    <i className="fa fa-play mr-2"></i>
                                Play</Button>
                <Button color="danger" onClick={() => track.player.pause()}>
                    <i className="fa fa-pause mr-2"></i>
                                Pause</Button>
                <Button color="warning" type='file' onClick={() => audioChange()}>
                    <i className="fa fa-eject mr-2"></i>
                                Load</Button>

            </div >

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


            <audio src={testFile} />
        </>
    )
}