import React, { useRef, useEffect } from "react";
//https://github.com/jrhalchak/BeatsPM/blob/1535622c0ae03a112cbe13c7d6deb1df1d3d0104/app/components/AudioDetection.js
import { analyze } from '../bpm';
import Peaks from 'peaks.js';

const testFile = "/assets/Attom-Shibui.mp3"

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const request = new XMLHttpRequest();

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
            points: [{
                time: 150,
                editable: true,
                color: "#00ff00",
                labelText: "A point"
            },
            {
                time: 160,
                editable: true,
                color: "#00ff00",
                labelText: "Another point"
            }]

        };

        let peakGraph;
        Peaks.init(options, function (err, p) {
            peakGraph = p;
        });

        analyze(audioBuffer)
            .then(data => {
                console.log(data);
                const { sampleRate, duration, peaks, bpm } = data;
                const beatInterval = 60 / bpm;
                const initialPeak = peaks[0] / sampleRate;
                for (let peak = initialPeak; peak < duration; peak += beatInterval) {
                    peakGraph.points.add({ time: peak });
                }
            })
            .catch(() => null)
    }).catch(() => null);
}


request.send();


const WAVE_ANALYSYS = require('./track_analysis.json');
console.log('anal:', WAVE_ANALYSYS)


const onTrackReady = () => {

    console.log('ready!!')
    const tatums = WAVE_ANALYSYS.tatums.filter((e, i) => i % 2 === 1);
    /* tatums.forEach((tatum, i) => {
        wavesurfer.addRegion({
            start: tatum.start,
            end: tatums[i + 1]?.start || 0,
            resize: false,
            drag: false,
            color: randomColor({
                luminosity: 'dark',
                format: 'rgba',
                alpha: 0.5
            })
        });
    }) */
}

export default function TrackForm() {

    return (
        <>
            <div id="peaks-container">
                <div id="zoomview-container"></div>
                <div id="overview-container"></div>
            </div>
            <audio src={testFile} />

        </>
    )
}