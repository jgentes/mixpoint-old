import Peaks from 'peaks.js'
import { toast } from 'react-toastify'
import { getAudioBuffer } from '../../audio'
import { Track, updateMixState } from '../../db'

export const initPeaks = async ({
  trackKey,
  track,
  setTrack,
  setAudioSrc,
  setSliderControl,
  setCanvas,
  adjustBpm,
  setAnalyzing
}: {
  trackKey: number
  track: Track
  setTrack: Function
  setAudioSrc: Function
  setSliderControl: Function
  setCanvas: Function
  adjustBpm: Function
  setAnalyzing: Function
}) => {
  if (!track) throw new Error('No track to initialize!')
  setAnalyzing(true)

  const track1 = trackKey % 2
  console.log('a')
  const file = await track.fileHandle.getFile()

  setTrack(track)
  console.log('b')
  const audioBuffer = await getAudioBuffer(file)
  console.log('x')
  const url = window.URL.createObjectURL(file)
  console.log('y')
  setAudioSrc(url)

  const peakOptions = {
    containers: {
      overview: document.getElementById(`overview-container_${trackKey}`),
      zoomview: document.getElementById(`zoomview-container_${trackKey}`)
    },
    mediaElement: document.getElementById(`audio_${trackKey}`) ?? undefined,
    webAudio: {
      audioBuffer
    },
    pointMarkerColor: 'rgba(30, 139, 195, 1)',
    zoomLevels: [64, 128, 256, 512],
    zoomWaveformColor: '#aaa',
    overviewWaveformColor: 'rgba(89, 165, 89, 0.7)',
    emitCueEvents: true
  }

  Peaks.init(peakOptions, async (err, waveform) => {
    if (err) return toast.error(err.message)
    if (!waveform)
      throw new Error('Unable to display waveform data for some reason..')

    setCanvas(waveform)

    const zoomView = waveform.views.getView('zoomview')

    // destroy the overview so that it doesn't receive the beat markers
    waveform.views.destroyOverview()

    waveform.zoom.setZoom(3) // 512
    zoomView?.showPlayheadTime(true)

    // adjust zoom view when mouse wheel is used
    if (peakOptions.containers.zoomview) {
      peakOptions.containers.zoomview.onwheel = e => {
        e.preventDefault()
        e.deltaY === 100 ? waveform?.zoom.zoomOut() : waveform.zoom.zoomIn()
      }
    } else
      console.error(
        'Zoomview container not found, could not set wheel zoom feature'
      )

    let { duration = 1, bpm = 1, offset = 1 } = track

    await adjustBpm(bpm)

    const beatInterval = 60 / bpm
    let time = offset

    // work backward from initialPeak to peak out start of track (zerotime) based on bpm
    while (time - beatInterval > 0) time -= beatInterval

    // now that we have zerotime, move forward with peaks based on the bpm (hope the bpm is accurate!)
    const pointArray: number[] = []
    while (time < duration) {
      pointArray.push(time)
      time += beatInterval
    }

    waveform.points.add(
      pointArray.map(time => ({
        time
      }))
    )

    if (!peakOptions.containers.overview)
      throw new Error('Overview container not found!')

    waveform.views.createOverview(peakOptions.containers.overview)

    const timeFormat = (secs: number) =>
      new Date(secs * 1000).toISOString().substr(15, 6)
    const markFormatter = (point: number) =>
      track1 ? (
        <div style={{ marginTop: '-45px' }}>{timeFormat(point)}</div>
      ) : (
        timeFormat(point)
      )

    const timeChange = (start: number, end: number) => {
      setSliderControl({
        min: start,
        max: end,
        marks: pointArray.reduce((o: any, p: number) => {
          return p < end && p > start
            ? { ...o, [p]: markFormatter(p) }
            : { ...o }
        }, {})
      })
    }

    // update slider controls on display change 
    // @ts-expect-error
    waveform.on('zoomview.displaying', timeChange)

    // create initial slider control
    timeChange(
      0,
      // @ts-expect-error
      (zoomView?._width * zoomView?._scale) / (track.sampleRate || 1)
    )

    // create initial segment
    /*      
    waveform.segments.add({
      startTime: sliderPoints[0],
      endTime: sliderPoints[31],
      color: 'rgba(191, 191, 63, 0.5)',
      editable: true
    })
*/

    setAnalyzing(false)
    await updateMixState({ [`track${trackKey}_name`]: track.name })

    toast.success(
      <>
        Loaded <strong>{track.name}</strong>
      </>,
      { autoClose: 3000 }
    )
  })
}
