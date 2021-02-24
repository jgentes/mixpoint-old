import React from 'react';
import { db, putTrack } from './db';
import { toast } from 'react-toastify';

const INITIAL_THRESHOLD = 0.9;
const MINUMUM_NUMBER_OF_PEAKS = 30;
const MINIMUM_THRESHOLD = 0.3;

export { analyze, getAudioBuffer, processTrack };

const getAudioBuffer = async file => {
  const arrayBuffer = await file.arrayBuffer();
  return await new AudioContext().decodeAudioData(arrayBuffer);
}

const processTrack = async (fileHandle, options) => {
  let audioBuffer;
  const file = await fileHandle.getFile();

  const { name, size, type } = file;

  audioBuffer = await getAudioBuffer(file);
  const { duration, bpm, sampleRate, peaks } = await analyze(audioBuffer, options);

  putTrack(name, size, type, duration, bpm, sampleRate, peaks, fileHandle);

  toast.success(<>Loaded <strong>{name}</strong></>)

  const track = await db.tracks.get(name);
  return { track, audioBuffer };
};

/**
 * provides bpm analysis for an audiobuffer
 * @param {object} options - has props of initialThreshold, numPeaks, and minThreshold
 */
const analyze = (audioBuffer, options = {}) => {
  console.log('options:', options)
  const offlineAudioContext = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    audioBuffer.length,
    audioBuffer.sampleRate
  );

  const biquadFilter = offlineAudioContext.createBiquadFilter();
  const bufferSourceNode = offlineAudioContext.createBufferSource();

  biquadFilter.frequency.value = options.lowpass || 100;
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

      intervals = countIntervalsBetweenNearbyPeaks(peaks);

      groups = groupNeighborsByTempo(intervals, renderedBuffer.sampleRate);

      groups.sort((a, b) => b.count - a.count);

      return { bpm: groups[0].tempo, peaks, duration: audioBuffer.duration, sampleRate: audioBuffer.sampleRate };
    });
};

const countIntervalsBetweenNearbyPeaks = (peaks) => {
  const intervalCounts = [];

  peaks.forEach((peak, index) => {
    for (let i = 0, length = Math.min(peaks.length - index, 10); i < length; i += 1) {
      let foundInterval = null;
      let interval = null;

      interval = peaks[index + i] - peak;

      foundInterval = intervalCounts.some((intervalCount) => {
        if (intervalCount.interval === interval) {
          intervalCount.count += 1;

          return true;
        }

        return false;
      });

      if (!foundInterval) {
        intervalCounts.push({
          count: 1,
          interval,
        });
      }
    }
  });

  return intervalCounts;
};

const getPeaksAtThreshold = (data, threshold, sampleRate) => {
  const peaks = [];

  for (let i = 0, length = data.length; i < length; i += 1) {
    if (data[i] > threshold) {
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
    .filter((intervalCount) => (intervalCount.interval !== 0))
    .forEach((intervalCount) => {
      let foundTempo = null;
      let theoreticalTempo = null;

      // Convert an interval to tempo
      theoreticalTempo = 60 / (intervalCount.interval / sampleRate);

      // Adjust the tempo to fit within the 90-180 BPM range
      while (theoreticalTempo < 90) {
        theoreticalTempo *= 2;
      }
      while (theoreticalTempo > 180) {
        theoreticalTempo /= 2;
      }

      foundTempo = tempoCounts.some((tempoCount) => {
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
        });
      }
    });

  return tempoCounts;
};