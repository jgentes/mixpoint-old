import { useRef, useState } from 'react'
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
import { Track, db, mixState, updateMixState } from '../../db'

const TrackForm = ({
  trackKey,
  mixState
}: {
  trackKey: number
  mixState: mixState
}) => {
  const audioElement = useRef<HTMLAudioElement>(null)
  console.log('trackkey, mixstate', trackKey, mixState)
  const [sliderControl, setSliderControl] = useState<SliderProps>()
  const [audioSrc, setAudioSrc] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [canvas, setCanvas] = useState<PeaksInstance>()

  const track1 = !!(trackKey % 2)
  const track = mixState[`track${trackKey}`] || {}

  const updatePlaybackRate = (bpm: number) => {
    // update play speed to new bpm
    const playbackRate = bpm / (track.bpm || bpm)
    if (audioElement.current) audioElement.current.playbackRate = playbackRate
  }

  const adjustBpm = async (bpm?: number) => {
    // get bpm from the user input field or mixState or current track
    bpm = Number(bpm || track.originalBpm)

    updatePlaybackRate(bpm)

    // store custom bpm value in mixstate
    await updateMixState({
      [`track${trackKey}`]: {
        ...track,
        bpm: bpm.toFixed(1),
        originalBpm: track.bpm
      }
    })
  }

  const getPeaks = async (track: Track) =>
    await initPeaks({
      trackKey,
      track,
      setAudioSrc,
      setSliderControl,
      setCanvas,
      adjustBpm,
      setAnalyzing
    })

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

    if (newTrack) getPeaks(newTrack)
  }

  const bpmVal = track.bpm?.toFixed(1) || 0

  const bpmDiff = track.originalBpm && track.originalBpm.toFixed(1) !== bpmVal

  const bpmControl = (
    <div className='pr-2'>
      <InputGroup size='sm' style={{ width: bpmDiff ? '140px' : '110px' }}>
        <Input
          type='text'
          className={`${!track.bpm ? 'text-gray-500' : ''}`}
          disabled={!track.bpm}
          onChange={(e: InputGroupTextProps) => adjustBpm(e.target.value)}
          value={bpmVal}
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
      className='float-left'
      style={{
        position: 'relative',
        zIndex: 999,
        visibility: analyzing ? 'hidden' : 'visible'
      }}
    >
      <Button
        color='light'
        title='Play'
        size='sm'
        className='mx-1 b-black-02'
        onClick={() => canvas?.player.play()}
        id={`playButton_${trackKey}`}
      >
        <i className='las la-play text-success' />
      </Button>
      <Button
        color='light'
        title='Pause'
        size='sm'
        className='ml-1 b-black-02'
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
      <div className='float-right'>{bpmControl}</div>
    </div>
  )

  const slider = !sliderControl ? null : (
    <div
      className={track1 ? 'pb-3 pt-5' : 'pb-5 pt-3'}
      style={{ visibility: analyzing ? 'hidden' : 'visible' }}
      id={`slider_${trackKey}`}
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
  //mixState.bpm && mixState.

  return (
    <Card className='mb-3'>
      <div className='mx-3'>
        {track1 && trackHeader}
        {!track1 && slider}

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

        {track1 && slider}
        {!track1 && trackHeader}

        <audio id={`audio_${trackKey}`} src={audioSrc} ref={audioElement} />
      </div>
    </Card>
  )
}

export default TrackForm
