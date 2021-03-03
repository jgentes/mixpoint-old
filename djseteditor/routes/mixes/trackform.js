import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import Peaks from 'peaks.js'
import { Button, Card, Input, InputGroup, InputGroupAddon } from 'reactstrap'
import { processTrack, getAudioBuffer } from '../../audio'
import { toast } from 'react-toastify'
import Loader from '../../layout/loader'
import Slider from 'rc-slider'

const TrackForm = ({ trackKey, mixState, updateTrack }) => {
  TrackForm.propTypes = {
    trackKey: PropTypes.number,
    mixState: PropTypes.object,
    updateTrack: PropTypes.func
  }

  const audioElement = useRef()

  const [sliderControl, setSliderControl] = useState()
  const [audioSrc, setAudioSrc] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [primaryTrack, setTrack] = useState({})
  const [primaryBuffer, setBuffer] = useState()
  const [canvas, setCanvas] = useState()

  const track1 = trackKey % 2

  const adjustBpm = bpm => {
    // get bpm from the user input field or mixState or current track
    bpm = Number(
      bpm ||
        (mixState?.tracks && mixState.tracks[trackKey]?.bpm) ||
        primaryTrack.bpm
    )
    // update play speed to new bpm
    const playbackRate = bpm / (primaryTrack.bpm || bpm)
    audioElement.current.playbackRate = playbackRate

    // store custom bpm value in mixstate
    updateTrack({ [trackKey]: { bpm: bpm.toFixed(1) } })
  }

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

      let { duration, bpm, offset } = track
      adjustBpm(bpm)

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

      const timeFormat = secs =>
        new Date(secs * 1000).toISOString().substr(15, 6)
      const markFormatter = point =>
        track1 ? (
          <div style={{ marginTop: '-45px' }}>{timeFormat(point)}</div>
        ) : (
          timeFormat(point)
        )

      const timeChange = (start, end) => {
        setSliderControl({
          min: start,
          max: end,
          marks: pointArray.reduce((o, p) => {
            return p < end && p > start
              ? { ...o, [p]: markFormatter(p) }
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
    if (!primaryTrack.name) setAnalyzing(true)

    let fileHandle
    try {
      ;[fileHandle] = await window.showOpenFilePicker()
      setAnalyzing(true)
    } catch (e) {
      return setAnalyzing(false)
    }

    // release resources from previous peak rendering
    if (canvas) canvas.destroy()

    initPeaks(await processTrack(fileHandle))
  }

  const bpmControl = (
    <div className='pr-2'>
      <InputGroup size='sm' style={{ width: '100px' }}>
        <Input
          type='text'
          className={`${!primaryTrack.bpm ? 'text-gray-500' : ''}`}
          disabled={!primaryTrack.bpm}
          onChange={e => adjustBpm(e.target.value)}
          value={
            (mixState?.tracks && mixState.tracks[trackKey]?.bpm) ||
            primaryTrack.bpm?.toFixed(1) ||
            0
          }
        />
        <InputGroupAddon addonType='append'>
          <Button color='primary'>BPM</Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )

  const playerControl = !primaryTrack.name ? null : (
    <div
      className='float-left'
      style={{
        position: 'relative',
        zIndex: '999',
        visibility: analyzing ? 'hidden' : 'visible'
      }}
    >
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
    <div className='d-flex justify-content-between my-3'>
      <div>
        <Button
          color='light'
          title='Load Track'
          size='sm'
          className='b-black-02'
          onClick={audioChange}
        >
          <i className='fa fa-eject text-warning' />
        </Button>
        <div
          style={{ display: 'inline', verticalAlign: 'middle' }}
          className='pl-3'
        >
          <span className='h5'>
            {analyzing ? 'Loading..' : primaryTrack.name || 'No Track Loaded..'}
          </span>
        </div>
      </div>
      <div className='float-right'>{bpmControl}</div>
    </div>
  )

  const slider = !sliderControl ? null : (
    <div
      className={track1 ? 'pb-3 pt-5' : 'pb-5 pt-3'}
      style={{ visibility: analyzing ? 'hidden' : 'visible' }}
    >
      <Slider
        min={sliderControl.min}
        max={sliderControl.max}
        marks={sliderControl.marks}
        step={null}
        included={false}
        onAfterChange={() => console.log('2changed')}
      />
    </div>
  )

  const zoomview = (
    <div
      id={`zoomview-container_${trackKey}`}
      style={{
        height: primaryTrack.name ? '150px' : '0px',
        visibility: analyzing ? 'hidden' : 'visible'
      }}
    />
  )
  const overview = (
    <div
      id={`overview-container_${trackKey}`}
      style={{
        height: primaryTrack.name ? '40px' : '0px',
        visibility: analyzing ? 'hidden' : 'visible'
      }}
    />
  )

  const loader = (
    <Loader
      className='my-5'
      style={{
        display: analyzing ? 'block' : 'none'
      }}
    />
  )

  return (
    <Card className='mb-3'>
      <div className='mx-3'>
        {track1 ? trackHeader : null}
        {!track1 ? slider : null}

        <div id={`peaks-container_${trackKey}`}>
          {track1 ? (
            <>
              {overview}
              {playerControl}
              {loader}
              {zoomview}
            </>
          ) : (
            <>
              {playerControl}
              {zoomview}
              {loader}
              {overview}
            </>
          )}
        </div>

        {track1 ? slider : null}
        {!track1 ? trackHeader : null}

        <audio id={`audio_${trackKey}`} src={audioSrc} ref={audioElement} />
      </div>
    </Card>
  )
}

export default TrackForm
