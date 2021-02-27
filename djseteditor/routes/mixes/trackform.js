import React, { useRef, useState } from 'react'
import Peaks from 'peaks.js'
import {
  Button,
  Form,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  Input
} from '../../../airframe/components'
import { processTrack, getAudioBuffer } from '../../audio'
import { toast } from 'react-toastify'
import Loader from '../../layout/loader'

const TrackForm = () => {
  const audioElement = useRef()

  // const [sliderControl, setSliderControl] = useState({})
  const [audioSrc, setAudioSrc] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [primaryTrack, setTrack] = useState({})
  const [primaryBuffer, setBuffer] = useState()
  const [canvas, setCanvas] = useState()

  const initPeaks = async ({ track, audioBuffer = primaryBuffer }) => {
    if (track) setTrack(track)
    else track = primaryTrack

    const file = await track.fileHandle.getFile()

    if (!audioBuffer) audioBuffer = await getAudioBuffer(file)
    setBuffer(audioBuffer)

    const url = window.URL.createObjectURL(file)

    setAudioSrc(url)
    setAnalyzing(true)

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
      zoomWaveformColor: '#aaa',
      overviewWaveformColor: 'rgba(89, 165, 89, 0.7)'
    }

    Peaks.init(options, function(err, waveform) {
      if (err) return toast.error(err.message)

      setCanvas(waveform)

      // destroy the overview until we have created our points
      waveform.views.destroyOverview()

      // set options
      waveform.zoom.setZoom(3) // 512
      options.containers.zoomview.onwheel = (e) => {
        e.preventDefault()
        e.deltaY === 100 ? waveform?.zoom.zoomOut() : waveform.zoom.zoomIn()
      }

      const controlPeaks = []
      const { duration, bpm, offset } = track
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
      waveform.views.createOverview(options.containers.overview)

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
    })
  }

  const audioChange = async () => {
    const [fileHandle] = await window.showOpenFilePicker()

    // release resources from previous peak rendering
    if (canvas) canvas.destroy()

    setAnalyzing(true)
    initPeaks(await processTrack(fileHandle))
  }

  const adjustBPM = (form) => {
    form.preventDefault()
    const formData = new FormData(form.target)
    const { newBpm } = Object.fromEntries(formData.entries())
    audioElement.current.playbackRate = newBpm / primaryTrack.bpm
  }

  return (
    <Card className="mb-3">
      <CardBody>
        <div className="d-flex mb-3">
          <CardTitle tag="h6" className="mb-0 align-self-center">
            Right Input Button
          </CardTitle>
        </div>
        <div>
          <Button color="success" onClick={() => canvas.player.play()}>
            <i className="fa fa-play mr-2"> </i>
            Play
          </Button>
          <Button color="danger" onClick={() => canvas.player.pause()}>
            <i className="fa fa-pause mr-2"> </i>
            Pause
          </Button>
          <Button color="warning" onClick={audioChange}>
            <i className="fa fa-eject mr-2"> </i>
            Load
          </Button>
        </div>

        {!primaryTrack.name ? null : (
          <div className="m-lg"> {primaryTrack.name} </div>
        )}

        <Form inline className="ml-auto" onSubmit={adjustBPM}>
          <FormGroup>
            <InputGroup size="sm">
              <Input
                type="text"
                name="newBpm"
                className="ml-auto"
                placeholder={primaryTrack.bpm || 0}
              />
              <InputGroupAddon addonType="append">
                <Button color="primary">Adjust BPM</Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
        </Form>

        <Loader hidden={!analyzing} />

        <div id="peaks-container">
          <div id="zoomview-container" />
          <div id="overview-container" style={{ height: '60px' }} />
        </div>

        <div className="d-flex">
          <Button
            color="secondary"
            outline
            size="sm"
            className="mr-2 align-self-center text-center">
            <i className="fa fa-fw fa-caret-left"> </i>
            <div> Prev </div>
          </Button>
          <Button
            color="secondary"
            size="lg"
            className="mr-2 align-self-center text-center">
            <i className="fa fa-fw fa-check"> </i>
            <div> Confirm </div>
          </Button>
          <Button
            color="secondary"
            outline
            size="sm"
            className="mr-2 align-self-center">
            <i className="fa fa-fw fa-caret-right"> </i>
            <div> Next </div>
          </Button>
        </div>

        <audio src={audioSrc} ref={audioElement} />
      </CardBody>
    </Card>
  )
}

export default TrackForm
