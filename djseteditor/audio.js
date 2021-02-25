import React from 'react';
import { db, putTrack } from './db';
import { toast } from 'react-toastify';
import { analyze as anal, guess } from 'web-audio-beat-detector';

const INITIAL_THRESHOLD = 0.9;
const MINUMUM_NUMBER_OF_PEAKS = 30;
const MINIMUM_THRESHOLD = 0.3;

export { analyze, getAudioBuffer, processTrack };

const getAudioBuffer = async file => {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return { audioBuffer, audioCtx };
}

const processTrack = async (fileHandle, options) => {
  const file = await fileHandle.getFile();

  const { name, size, type } = file;

  const { audioBuffer, audioCtx } = await getAudioBuffer(file);

  const { offset, tempo } = await guess(audioBuffer)
  const { duration, sampleRate, bpm, peaks, renderedBuffer } = await analyze(audioBuffer, options);

  putTrack({ name, size, type, duration, bpm, sampleRate, peaks, fileHandle });

  toast.success(<>Loaded <strong>{name}</strong></>)

  const track = await db.tracks.get(name);
  return { track, audioBuffer, audioCtx, renderedBuffer, bpm, offset, tempo };
};

/**
 * provides bpm analysis for an audiobuffer
 * @param {object} options - has props of initialThreshold, numPeaks, minThreshold
 */
const analyze = (audioBuffer, options = {}) => {
  const offlineAudioContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const biquadFilter = offlineAudioContext.createBiquadFilter();
  const bufferSourceNode = offlineAudioContext.createBufferSource();

  biquadFilter.frequency.value = options.lowpass || 150;
  biquadFilter.type = 'lowpass';

  bufferSourceNode.buffer = audioBuffer;

  bufferSourceNode
    .connect(biquadFilter)
    .connect(offlineAudioContext.destination);

  bufferSourceNode.start(0);

  return offlineAudioContext
    .startRendering()
    .then(renderedBuffer => {
      let groups = null;
      let intervals = null;
      let peaks = [];
      let threshold = options.initialThreshold || INITIAL_THRESHOLD;

      while (peaks.length < (options.minPeaks || MINUMUM_NUMBER_OF_PEAKS) && threshold >= (options.minThreshold || MINIMUM_THRESHOLD)) {
        peaks = getPeaksAtThreshold(
          renderedBuffer.getChannelData(0),
          threshold,
          renderedBuffer.sampleRate,
        );
        threshold -= 0.05;
      }
      //console.log({ peaks })
      intervals = countIntervalsBetweenNearbyPeaks(peaks);
      // console.log({ intervals })
      groups = groupNeighborsByTempo(intervals, renderedBuffer.sampleRate);
      groups.sort((a, b) => b.count - a.count);
      //   console.log({ groups })
      return { bpm: groups[0].tempo, peaks: groups[0].peaks, duration: audioBuffer.duration, sampleRate: audioBuffer.sampleRate, renderedBuffer };
    });
};

const countIntervalsBetweenNearbyPeaks = (peaks) => {
  const intervalCounts = [];

  peaks.forEach((peak, index) => {
    for (let i = 0, length = Math.min(peaks.length - index, 10); i < length; i += 1) {
      let foundInterval = null;
      let interval = null;

      interval = Math.round((peaks[index + i] - peak) / 100) * 100;

      foundInterval = intervalCounts.some((intervalCount) => {
        if (intervalCount.interval === interval) {
          intervalCount.count += 1;
          intervalCount.peaks.push(peak);
          return true;
        }

        return false;
      });

      if (!foundInterval) {
        intervalCounts.push({
          count: 1,
          interval,
          peaks: [peak]
        });
      }
    }
  });

  return intervalCounts;
};

const getPeaksAtThreshold = (data, threshold, sampleRate) => {
  // todo: auto adjust threshold by lowering it if nothing found?
  const peaks = [];
  console.log({ sampleRate, threshold })
  for (let i = 0, length = data.length; i < length; i += 1) {
    if (!(i % 1000) && i < 250000) {
      //console.log('data: ', (i / sampleRate).toFixed(2), data[i].toFixed(2), data[i] > threshold);
    }

    if (data[i] > threshold) {
      // console.log('pushed peak', (i / sampleRate).toFixed(2), data[i].toFixed(2))
      peaks.push(i);

      // Skip forward 1/4s to get past this peak.
      i += (sampleRate / 4) - 1;
    }
  }

  return peaks;
};

const groupNeighborsByTempo = (intervals, sampleRate) => {
  const tempoCounts = [];

  intervals
    .filter(intervalCount => intervalCount.interval !== 0)
    .forEach(intervalCount => {
      let foundTempo = null;
      let theoreticalTempo = null;

      // Convert an interval to tempo
      theoreticalTempo = Number((60 / (intervalCount.interval / sampleRate)).toFixed(2));

      // Adjust the tempo to fit within the 80-160 BPM range
      while (theoreticalTempo < 80) {
        theoreticalTempo *= 2;
      }
      while (theoreticalTempo > 160) {
        theoreticalTempo /= 2;
      }

      foundTempo = tempoCounts.some(tempoCount => {
        if (tempoCount.tempo === theoreticalTempo) {
          tempoCount.count += intervalCount.count;

          return true;
        }

        return false;
      });

      if (!foundTempo) {
        tempoCounts.push({
          count: intervalCount.count,
          tempo: theoreticalTempo,
          peaks: intervalCount.peaks
        });
      }
    });

  return tempoCounts;
};