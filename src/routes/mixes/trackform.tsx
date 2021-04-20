import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupTextProps
} from 'reactstrap'
import { initTrack, processAudio } from '../../audio'
import Loader from '../../layout/loader'
import Slider, { SliderProps } from 'rc-slider'
import { initPeaks } from './initPeaks'
import { PeaksInstance } from 'peaks.js'
import WaveformData from 'waveform-data'
import { Track, db, mixState, updateMixState } from '../../db'

const TrackForm = ({
  trackKey,
  mixState
}: {
  trackKey: number
  mixState: mixState
}) => {
  interface SliderControlProps extends SliderProps {
    width: number
  }

  const audioElement = useRef<HTMLAudioElement>(null)
  const [sliderControl, setSliderControl] = useState<SliderControlProps>()
  const [analyzing, setAnalyzing] = useState(false)
  const [canvas, setCanvas] = useState<PeaksInstance>()
  const [audioSrc, setAudioSrc] = useState('')

  const track1 = !!(trackKey % 2)
  const track = mixState[`track${trackKey}`] || {}

  useEffect(() => {
    // pass waveformData here as a separate argument because it only
    // exists in mixState, not on the Track schema
    if (track.waveformData) getPeaks(track, track.waveformData)
  }, [track])

  const updatePlaybackRate = (bpm: number) => {
    // update play speed to new bpm
    const playbackRate = bpm / (track.bpm || bpm)
    if (audioElement.current) audioElement.current.playbackRate = playbackRate
  }

  const adjustBpm = async (bpm?: number) => {
    // get bpm from the user input field or mixState or current track
    bpm = Number(bpm || track.bpm)

    updatePlaybackRate(bpm)

    // store custom bpm value in mixstate
    await updateMixState({
      [`track${trackKey}`]: {
        ...track,
        adjustedBpm: Number(bpm.toFixed(1))
      }
    })
  }

  const getPeaks = async (
    track: Track,
    file?: File,
    waveformData?: WaveformData
  ) => {
    return await initPeaks({
      trackKey,
      track,
      file,
      waveformData,
      setSliderControl,
      setAudioSrc,
      setCanvas,
      setAnalyzing
    })
  }

  const audioChange = async () => {
    if (!track.name) setAnalyzing(true)

    let fileHandle
    try {
      ;[fileHandle] = await window.showOpenFilePicker()
      setAnalyzing(true)
    } catch (e) {
      return setAnalyzing(false)
    }

    // release resources from previous peak rendering
    if (canvas) canvas?.destroy()

    // do not lose the directory handle if it exists
    const dbTrack = await db.tracks.get(fileHandle.name)

    const newTrack = await processAudio(
      await initTrack(fileHandle, dbTrack?.dirHandle)
    )

    if (newTrack) {
      await getPeaks(newTrack)
    } else setAnalyzing(false)
  }

  const setMixPoint = (time: number) => {
    // create segment
    console.log('hit:', time)
    canvas?.player.seek(time)
    canvas?.player.play()
    /*
    canvas?.segments.add({
      startTime: time,
      endTime: sliderPoints[31],
      color: 'rgba(191, 191, 63, 0.5)',
      editable: true
    })
    */
  }

  const adjustedBpm = track.adjustedBpm && Number(track.adjustedBpm).toFixed(1)

  const bpmDiff = adjustedBpm && adjustedBpm !== track.bpm?.toFixed(1)

  const alignment = track1 ? 'align-self-sm-start' : 'align-self-sm-end'

  const bpmControl = (
    <div className={alignment}>
      <InputGroup size='sm' style={{ width: bpmDiff ? '140px' : '110px' }}>
        <Input
          type='text'
          className={`${!track.bpm ? 'text-gray-500' : ''}`}
          disabled={!track.bpm}
          onChange={(e: InputGroupTextProps) => adjustBpm(e.target.value)}
          value={adjustedBpm || track.bpm?.toFixed(1) || 0}
          id={`bpmInput_${trackKey}`}
        />
        <InputGroupAddon addonType='append'>
          <Button
            color='primary'
            disabled={!bpmDiff}
            onClick={() => adjustBpm(track.bpm || 1)}
            id={`bpmButton_${trackKey}`}
          >
            {bpmDiff ? 'Reset ' : ''}BPM
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )

  const playerControl = !track.name ? null : (
    <div
      style={{
        position: 'relative',
        zIndex: 999,
        visibility: analyzing ? 'hidden' : 'visible'
      }}
      className={alignment}
    >
      <Button
        color='light'
        title='Play'
        size='sm'
        className='b-black-02 my-auto'
        onClick={() => canvas?.player.play()}
        id={`playButton_${trackKey}`}
      >
        <i className='las la-play text-success' />
      </Button>
      <Button
        color='light'
        title='Pause'
        size='sm'
        className='b-black-02 mx-2 my-auto'
        onClick={() => canvas?.player.pause()}
        id={`pauseButton_${trackKey}`}
      >
        <i className='las la-pause text-danger' />
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
          id={`loadButton_${trackKey}`}
        >
          <i className='las la-eject la-15em text-warning' />
        </Button>
        <div
          style={{ display: 'inline', verticalAlign: 'middle' }}
          className='pl-3'
        >
          <span className='h5'>
            {analyzing
              ? 'Loading..'
              : track.name?.replace(/\.[^/.]+$/, '') || 'No Track Loaded..'}
          </span>
        </div>
      </div>
      <div className='d-flex'>
        {playerControl}
        {bpmControl}
      </div>
    </div>
  )

  const slider = !sliderControl?.max ? null : (
    <div
      style={{
        overflow: 'scroll',
        overflowX: 'hidden',
        overflowY: 'hidden',
        visibility: analyzing ? 'hidden' : 'visible'
      }}
      id={`slider_${trackKey}`}
    >
      <div
        className={track1 ? 'pb-3 pt-5' : 'pb-5 pt-3'}
        style={{
          width: `${sliderControl?.width}px`
        }}
      >
        <Slider
          min={sliderControl?.min}
          max={sliderControl?.max}
          marks={sliderControl?.marks}
          step={null}
          included={false}
          onAfterChange={time => setMixPoint(time)}
        />
      </div>
    </div>
  )

  const zoomview = (
    <div
      id={`zoomview-container_${trackKey}`}
      style={{
        height: track.name ? '150px' : '0px',
        visibility: analyzing ? 'hidden' : 'visible'
      }}
    />
  )

  const overview = (
    <div
      id={`overview-container_${trackKey}`}
      style={{
        height: track.name ? '40px' : '0px',
        visibility: analyzing ? 'hidden' : 'visible'
      }}
    />
  )

  const loader = analyzing ? <Loader className='my-5' /> : null

  return (
    <Card className='mb-3'>
      <div className='mx-3'>
        {track1 && trackHeader}
        <>{!track1 && track.name && slider}</>

        <div id={`peaks-container_${trackKey}`}>
          {track1 ? (
            <>
              {overview}
              {loader}
              {zoomview}
            </>
          ) : (
            <>
              {zoomview}
              {loader}
              {overview}
            </>
          )}
        </div>

        <>{track1 && track.name && slider}</>
        {!track1 && trackHeader}

        <audio id={`audio_${trackKey}`} src={audioSrc} ref={audioElement} />
      </div>
    </Card>
  )
}

export default TrackForm
