import Peaks from 'peaks.js'
import { toast } from 'react-toastify'
import { getAudioBuffer } from '../../audio'
import { Track } from '../../db'

export const initPeaks = async ({
  trackKey,
  track,
  file,
  setAudioSrc,
  setSliderControl,
  setCanvas,
  setAnalyzing
}: {
  trackKey: number
  track: Track
  file: File | undefined
  setAudioSrc: Function
  setSliderControl: Function
  setCanvas: Function
  setAnalyzing: Function
}) => {
  if (!track) throw new Error('No track to initialize!')
  setAnalyzing(true)

  const track1 = trackKey % 2

  if (!file) file = await track.fileHandle.getFile()

  const audioBuffer = await getAudioBuffer(file)

  const url = window.URL.createObjectURL(file)

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
    emitCueEvents: true // for mouse drag listener
  }

  Peaks.init(peakOptions, async (err, waveform) => {
    if (err) return toast.error(err.message)
    if (!waveform)
      throw new Error('Unable to display waveform data for some reason..')

    setCanvas(waveform)

    const zoomView = waveform.views.getView('zoomview')

    // destroy the overview so that it doesn't receive the beat markers
    waveform.views.destroyOverview()

    zoomView?.setWaveformColor({
      linearGradientStart: 45,
      linearGradientEnd: 58,
      linearGradientColorStops: ['#D8B945', '#DD9045']
    })

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

    const beatInterval = 60 / bpm
    let startPoint = offset

    // work backward from initialPeak to peak out start of track (zerotime) based on bpm
    while (startPoint - beatInterval > 0) startPoint -= beatInterval

    // now that we have zerotime, move forward with peaks based on the bpm (hope the bpm is accurate!)
    const pointArray: number[] = []
    for (let time = startPoint; time < duration; time += beatInterval) {
      pointArray.push(time)
    }

    // add last point at the end to accurately size slider
    pointArray.push(duration)

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

    const slider = document.querySelector(`#slider_${trackKey}`)

    let lastMove = Date.now()
    const move = (start: Number, end: Number) => {
      if (Date.now() - lastMove < 100) return // debounce
      // @ts-expect-error
      const scroll = (start * track.sampleRate) / zoomView?._scale
      if (slider) slider.scrollLeft = scroll
      lastMove = Date.now()
    }

    // update slider controls on display change
    // @ts-expect-error
    waveform.on('zoomview.displaying', move)

    // create initial slider control
    setSliderControl({
      min: 0,
      max: pointArray[pointArray.length - 1],
      width: `${zoomView?._pixelLength}px`,
      marks: pointArray.reduce(
        (o: any, p: number) => ({ ...o, [p]: markFormatter(p) }),
        {}
      )
    })

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
  })
}
