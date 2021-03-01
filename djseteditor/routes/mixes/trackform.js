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

const TrackForm = ({ trackKey }) => {
  TrackForm.propTypes = {
    trackKey: PropTypes.number
  }

  const audioElement = useRef()

  // const [sliderControl, setSliderControl] = useState({})
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
      zoomLevels: [128, 256, 512, 1024, 2048],
      zoomWaveformColor: '#aaa',
      overviewWaveformColor: 'rgba(89, 165, 89, 0.7)'
    }

    Peaks.init(peakOptions, function (err, waveform) {
      if (err) return toast.error(err.message)

      setCanvas(waveform)

      // destroy the overview so that it doesn't receive the beat markers
      waveform.views.destroyOverview()

      // set options
      waveform.zoom.setZoom(3) // 512
      peakOptions.containers.zoomview.onwheel = e => {
        e.preventDefault()
        e.deltaY === 100 ? waveform?.zoom.zoomOut() : waveform.zoom.zoomIn()
      }

      const controlPeaks = []
      const { duration, bpm, offset } = track
      setBpm(Number(bpm).toFixed(1))

      const beatInterval = 60 / bpm
      let time = offset

      // work backward from initialPeak to peak out start of track (zerotime) based on bpm
      while (time - beatInterval > 0) time -= beatInterval

      // now that we have zerotime, move forward with peaks based on the bpm (hope the bpm is accurate!)
      const pointArray = []
      while (time < duration) {
        pointArray.push({ time })
        controlPeaks.push(time)
        time += beatInterval
      }

      waveform.points.add(pointArray)
      waveform.views.createOverview(peakOptions.containers.overview)

      // create initial segment
      waveform.segments.add({
        startTime: controlPeaks[0],
        endTime: controlPeaks[31],
        color: 'rgba(191, 191, 63, 0.5)',
        editable: true
      })
      /*

                setSliderControl({
                    min: controlPeaks[0],
                    max: controlPeaks[31],
                    step: beatInterval
                });
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

    // release resources from previous peak rendering
    if (canvas) canvas.destroy()

    setAnalyzing(true)
    initPeaks(await processTrack(fileHandle))
  }

  const adjustBPM = newBpm => {
    setBpm(Number(newBpm).toFixed(1))
    audioElement.current.playbackRate = newBpm / primaryTrack.bpm
  }

  const customBpm = primaryBpm && primaryBpm !== primaryTrack.bpm.toFixed(1)

  return (
    <Card className='mb-3'>
      <CardBody>
        <div className='d-flex justify-content-between mb-3'>
          <h5>{primaryTrack.name || 'No Track Loaded..'}</h5>
          <InputGroup
            size='sm'
            className='float-right'
            style={{ width: `${customBpm ? '140' : '110'}px` }}
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
        </div>
        <div>
          <Button color='success' onClick={() => canvas.player.play()}>
            <i className='fa fa-play mr-2'> </i>
            Play
          </Button>
          <Button color='danger' onClick={() => canvas.player.pause()}>
            <i className='fa fa-pause mr-2'> </i>
            Pause
          </Button>
          <Button color='warning' onClick={audioChange}>
            <i className='fa fa-eject mr-2'> </i>
            Load
          </Button>
        </div>

        <Loader hidden={!analyzing} />

        <div id={`peaks-container_${trackKey}`}>
          <div id={`zoomview-container_${trackKey}`} />
          <div
            id={`overview-container_${trackKey}`}
            style={{ height: '60px' }}
          />
        </div>

        <div className='d-flex'>
          <Button
            color='secondary'
            outline
            size='sm'
            className='mr-2 align-self-center text-center'
          >
            <i className='fa fa-fw fa-caret-left'> </i>
            <div> Prev </div>
          </Button>
          <Button
            color='secondary'
            size='lg'
            className='mr-2 align-self-center text-center'
          >
            <i className='fa fa-fw fa-check'> </i>
            <div> Confirm </div>
          </Button>
          <Button
            color='secondary'
            outline
            size='sm'
            className='mr-2 align-self-center'
          >
            <i className='fa fa-fw fa-caret-right'> </i>
            <div> Next </div>
          </Button>
        </div>

        <audio id={`audio_${trackKey}`} src={audioSrc} ref={audioElement} />
      </CardBody>
    </Card>
  )
}

export default TrackForm
