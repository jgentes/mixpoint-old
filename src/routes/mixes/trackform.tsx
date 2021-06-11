import { useEffect, useRef, useState, ReactElement } from 'react'
import {
  CardHeader,
  CardBody,
  InputGroupTextProps,
  Nav,
  NavItem,
  TabPane
} from 'reactstrap'

import { Button, Card, NumericInput } from '@blueprintjs/core'
import { initTrack, processAudio } from '../../audio'
import Loader from '../../layout/loader'
import Slider, { SliderProps } from 'rc-slider'
import { initPeaks } from './initPeaks'
import { PeaksInstance } from 'peaks.js'
import WaveformData from 'waveform-data'
import { Track, db, TrackState, useLiveQuery } from '../../db'

const TrackForm = ({
  trackKey,
  setPoint
}: {
  trackKey: number
  setPoint: Function
}) => {
  interface SliderControlProps extends SliderProps {
    width: number
  }

  const audioElement = useRef<HTMLAudioElement>(null)
  const [sliderControl, setSliderControl] = useState<SliderControlProps>()
  const [analyzing, setAnalyzing] = useState(false)
  const [waveform, setWaveform] = useState<PeaksInstance>()
  const [audioSrc, setAudioSrc] = useState('')

  const track1 = trackKey == 0
  const trackState: TrackState =
    useLiveQuery(() => db.trackState.get(trackKey)) || {}
  const track: Track =
    (trackState?.trackId &&
      useLiveQuery(() => db.tracks.get(trackState.trackId!))) ||
    {}
  const zoomView = waveform?.views.getView('zoomview')

  useEffect(() => {
    console.log('USEFEFECT:', trackState)
    if (trackState.waveformData)
      getPeaks(track, trackState.file, trackState.waveformData)
  }, [trackState])

  const updatePlaybackRate = (bpm: number) => {
    // update play speed to new bpm
    const playbackRate = bpm / (track.bpm || bpm)
    if (audioElement.current) audioElement.current.playbackRate = playbackRate
  }

  const adjustBpm = async (bpm?: number) => {
    // get bpm from the user input field or mixState or current track
    bpm = bpm ?? Number(track.bpm)

    updatePlaybackRate(bpm)

    // store custom bpm value in mixstate
    await db.trackState.update(trackKey, {
      adjustedBpm: Number(bpm.toFixed(1))
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
      setWaveform,
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
    if (waveform) waveform?.destroy()

    // do not lose the directory handle if it exists
    const dbTrack = await db.tracks.get({ name: fileHandle.name })

    const newTrack = await processAudio(
      await initTrack(fileHandle, dbTrack?.dirHandle)
    )

    if (newTrack) {
      await getPeaks(newTrack)
    } else setAnalyzing(false)
  }

  const selectTime = async (time: number) => {
    waveform?.player.seek(time)
    zoomView?.enableAutoScroll(false)
    waveform?.player.play()

    setPoint(trackKey, time)

    /*
    waveform?.segments.add({
      startTime: time,
      endTime: sliderPoints[31],
      color: 'rgba(191, 191, 63, 0.5)',
      editable: true
    })
    */
  }

  const setMixPoint = async () => {
    //const id = await addMix(mixState.tracks.map(t => t.id))
    //await updateMixState({ ...mixState, mix: { id } })
  }

  const adjustedBpm = track.adjustedBpm && Number(track.adjustedBpm).toFixed(1)

  const bpmDiff = adjustedBpm && adjustedBpm !== track.bpm?.toFixed(1)

  const alignment = track1 ? 'align-self-sm-start' : 'align-self-sm-end'

  const bpmControl = (
    <div
      className={alignment}
      style={{ display: 'inline-flex', flexBasis: bpmDiff ? '168px' : '120px' }}
    >
      <NumericInput
        disabled={!track.bpm}
        onValueChange={(_v: number, value: string) => {
          console.log(_v, value)
          adjustBpm(Number(value))
        }}
        value={adjustedBpm || track.bpm?.toFixed(1) || 0}
        id={`bpmInput_${trackKey}`}
        allowNumericCharactersOnly={false}
        asyncControl={true}
        buttonPosition={'left'}
        fill={true}
        minorStepSize={0.1}
        rightElement={
          <Button
            color='primary'
            disabled={!bpmDiff}
            onClick={() => adjustBpm(track.bpm || 1)}
            id={`bpmButton_${trackKey}`}
          >
            {bpmDiff ? 'Reset ' : ''}BPM
          </Button>
        }
      />
    </div>
  )

  const playerControl = !track.name ? null : (
    <div
      style={{
        position: 'relative',
        zIndex: 999,
        minWidth: '81px',
        visibility: analyzing ? 'hidden' : 'visible'
      }}
      className={alignment}
    >
      <Button
        color='light'
        title='Play'
        className='b-black-02 my-auto'
        onClick={() => {
          zoomView?.enableAutoScroll(true)
          waveform?.player.play()
        }}
        id={`playButton_${trackKey}`}
      >
        <i className='las la-play text-success' />
      </Button>
      <Button
        color='light'
        title='Pause'
        className='b-black-02 mx-2 my-auto'
        onClick={() => {
          waveform?.player.pause()
          zoomView?.enableAutoScroll(true)
        }}
        id={`pauseButton_${trackKey}`}
      >
        <i className='las la-pause text-danger' />
      </Button>
    </div>
  )

  const trackHeader = (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div
        style={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
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
          style={{
            display: 'inline',
            verticalAlign: 'middle'
          }}
          className='pl-3'
        >
          <span className='h5'>
            {analyzing
              ? 'Loading..'
              : track.name?.replace(/\.[^/.]+$/, '') || 'No Track Loaded..'}
          </span>
        </div>
      </div>
      {bpmControl}
    </div>
  )

  const slider = (
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
        {!sliderControl?.max ? null : (
          <Slider
            min={sliderControl?.min}
            max={sliderControl?.max}
            marks={sliderControl?.marks}
            step={null}
            included={false}
            onAfterChange={time => selectTime(time)}
          />
        )}
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

  const MixCard = () => (
    <Card style={{ flexBasis: '85px', flexGrow: 1, flexShrink: 1 }}>
      {playerControl}
    </Card>
  )

  return (
    <div style={{ display: 'flex', margin: '15px 0' }}>
      <MixCard />
      <Card
        elevation={1}
        style={{
          flexBasis: 0,
          flexGrow: 8,
          flexShrink: 1,
          marginLeft: '15px',
          overflow: 'hidden'
        }}
      >
        <div>
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
    </div>
  )
}

export default TrackForm
