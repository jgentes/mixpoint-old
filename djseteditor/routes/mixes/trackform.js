import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Peaks from 'peaks.js'
import {
  Button,
  Card,
  CardBody,
  InputGroup,
  InputGroupAddon,
  Input
} from 'reactstrap'
import { processTrack, getAudioBuffer } from '../../audio'
import { toast } from 'react-toastify'
import Loader from '../../layout/loader'
import Slider from 'rc-slider'

const TrackForm = ({ trackKey }) => {
  TrackForm.propTypes = {
    trackKey: PropTypes.number
  }

  const audioElement = useRef()

  const [sliderControl, setSliderControl] = useState()
  const [audioSrc, setAudioSrc] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [primaryTrack, setTrack] = useState({})
  const [primaryBuffer, setBuffer] = useState()
  const [canvas, setCanvas] = useState()
  const [primaryBpm, setBpm] = useState()

  const initPeaks = async ({ track, audioBuffer = primaryBuffer }) => {
    if (track) setTrack(track)
    else track = primaryTrack

    const file = await track.fileHandle.getFile()

    if (!audioBuffer) audioBuffer = await getAudioBuffer(file)
    setBuffer(audioBuffer)

    const url = window.URL.createObjectURL(file)

    setAudioSrc(url)
    setAnalyzing(true)

    const peakOptions = {
      containers: {
        overview: document.getElementById(`overview-container_${trackKey}`),
        zoomview: document.getElementById(`zoomview-container_${trackKey}`)
      },
      mediaElement: document.getElementById(`audio_${trackKey}`),
      webAudio: {
        audioBuffer
      },
      pointMarkerColor: 'rgba(30, 139, 195, 1)',
      zoomLevels: [64, 128, 256, 512],
      zoomWaveformColor: '#aaa',
      overviewWaveformColor: 'rgba(89, 165, 89, 0.7)',
      emitCueEvents: true
    }

    Peaks.init(peakOptions, (err, waveform) => {
      if (err) return toast.error(err.message)

      waveform.on('zoom.update', (curr, prev) =>
        console.log('zoom:', curr, prev)
      )

      setCanvas(waveform)

      const zoomView = waveform.views.getView('zoomview')

      // destroy the overview so that it doesn't receive the beat markers
      waveform.views.destroyOverview()

      waveform.zoom.setZoom(3) // 512
      zoomView.showPlayheadTime(true)

      // adjust zoom view when mouse wheel is used
      peakOptions.containers.zoomview.onwheel = e => {
        e.preventDefault()
        e.deltaY === 100 ? waveform?.zoom.zoomOut() : waveform.zoom.zoomIn()
      }

      const { duration, bpm, offset } = track
      setBpm(Number(bpm).toFixed(1))

      const beatInterval = 60 / bpm
      let time = offset

      // work backward from initialPeak to peak out start of track (zerotime) based on bpm
      while (time - beatInterval > 0) time -= beatInterval

      // now that we have zerotime, move forward with peaks based on the bpm (hope the bpm is accurate!)
      const pointArray = []
      while (time < duration) {
        pointArray.push(time)
        time += beatInterval
      }

      waveform.points.add(
        pointArray.map(time => ({
          time
        }))
      )

      waveform.views.createOverview(peakOptions.containers.overview)

      const timeChange = (start, end) => {
        setSliderControl({
          min: start,
          max: end,
          marks: pointArray.reduce((o, p) => {
            return p < end && p > start
              ? { ...o, [p]: new Date(p * 1000).toISOString().substr(15, 6) }
              : { ...o }
          }, {})
        })
      }

      // update slider controls on display change
      waveform.on('zoomview.displaying', timeChange)

      // create initial slider control
      timeChange(0, (zoomView._width * zoomView._scale) / track.sampleRate)

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

      toast.success(
        <>
          Loaded <strong>{track.name}</strong>
        </>,
        { autoClose: 3000 }
      )
    })
  }

  const audioChange = async () => {
    const [fileHandle] = await window.showOpenFilePicker()

    setTrack({ name: 'Loading..' })
    setAnalyzing(true)

    // release resources from previous peak rendering
    if (canvas) canvas.destroy()

    initPeaks(await processTrack(fileHandle))
  }

  const adjustBPM = newBpm => {
    setBpm(Number(newBpm).toFixed(1))
    audioElement.current.playbackRate = newBpm / primaryTrack.bpm
  }

  const customBpm = primaryBpm && primaryBpm !== primaryTrack.bpm?.toFixed(1)

  const bpmControl = (
    <InputGroup
      size='sm'
      className='float-right'
      style={{
        width: `${customBpm ? '140' : '110'}px`,
        position: 'relative',
        zIndex: '999'
      }}
    >
      <Input
        type='text'
        name='newBpm'
        className={`h-auto ${!primaryBpm ? 'text-gray-500' : ''}`}
        disabled={!primaryBpm}
        onChange={e => adjustBPM(e.target.value)}
        value={primaryBpm || 0}
      />
      <InputGroupAddon addonType='append'>
        <Button
          color='primary'
          disabled={!customBpm}
          onClick={() => adjustBPM(primaryTrack.bpm)}
        >
          {customBpm ? 'Reset ' : ''}
          BPM
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )

  const playerControl = (
    <div className='float-left' style={{ position: 'relative', zIndex: '999' }}>
      <Button
        color='light'
        title='Play'
        size='sm'
        className='mx-1 b-black-02'
        onClick={() => canvas.player.play()}
      >
        <i className='fa fa-play text-success' />
      </Button>
      <Button
        color='light'
        title='Pause'
        size='sm'
        className='ml-1 b-black-02'
        onClick={() => canvas.player.pause()}
      >
        <i className='fa fa-pause text-danger' />
      </Button>
    </div>
  )

  const trackHeader = (
    <div className='d-flex justify-content-between mb-3'>
      <h5>{primaryTrack.name || 'No Track Loaded..'}</h5>
      <Button
        color='light'
        title='Load Track'
        size='sm'
        className='m-1 b-black-02 float-right'
        onClick={audioChange}
      >
        <i className='fa fa-eject text-warning' />
      </Button>
    </div>
  )

  return (
    <Card className='mb-3'>
      <CardBody>
        {trackHeader}

        <Loader hidden={!analyzing} />

        <div
          id={`peaks-container_${trackKey}`}
          style={{ visibility: analyzing ? 'hidden' : 'visible' }}
        >
          <div hidden={!primaryTrack.name}>
            {playerControl}

            {bpmControl}
          </div>

          <div
            id={`overview-container_${trackKey}`}
            style={{ height: '60px' }}
          />

          <div id={`zoomview-container_${trackKey}`} />

          {!sliderControl ? null : (
            <div className='py-4'>
              <Slider
                min={sliderControl.min}
                max={sliderControl.max}
                marks={sliderControl.marks}
                step={null}
                included={false}
                onAfterChange={() => console.log('2changed')}
              />
            </div>
          )}
        </div>

        <audio id={`audio_${trackKey}`} src={audioSrc} ref={audioElement} />
      </CardBody>
    </Card>
  )
}

export default TrackForm
