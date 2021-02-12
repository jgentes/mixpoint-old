import React, { useRef, useState, useEffect } from "react";
//https://github.com/jrhalchak/BeatsPM/blob/1535622c0ae03a112cbe13c7d6deb1df1d3d0104/app/components/AudioDetection.js
import { analyze } from './bpm';
import Peaks from 'peaks.js';
import { Button } from '../airframe/components';

const testFile = "/assets/Attom-Shibui.mp3"

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const request = new XMLHttpRequest();


import classes from '../airframe/routes/Forms/Sliders';
let track; // for browser controls;

import Slider, { Range } from 'rc-slider';
export default function TrackForm() {
    const [sliderControl, setSliderControl] = useState({});

    useEffect(() => {
        request.open('GET', testFile, true);
        request.responseType = 'arraybuffer';
        request.onload = function () {
            const audioData = request.response;

            audioCtx.decodeAudioData(audioData).then(audioBuffer => {

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

                            setSliderControl({
                                min: minPeak,
                                marks: controlPeaks,
                                step: beatInterval
                            });

                            console.log({ sliderControl })

                        })
                        .catch(() => null)
                });
            }).catch(() => null);
        }
        request.send();
    }, [])

    return (
        <>
            <div>
                <Button color="success" onClick={() => track.player.play()}>
                    <i className="fa fa-play mr-2"></i>
                                Play</Button>
                <Button color="danger" onClick={() => track.player.pause()}>
                    <i className="fa fa-pause mr-2"></i>
                                Pause</Button>
            </div>
            <div id="peaks-container">
                <div id="zoomview-container"></div>
                <div id="overview-container"></div>
                <div className={classes.markedSliderWrap}>
                    {/* <Slider dots min={sliderControl.min} marks={sliderControl.marks} step={sliderControl.step} / > */}
                </div>
            </div>
            <audio src={testFile} />

        </>
    )
}