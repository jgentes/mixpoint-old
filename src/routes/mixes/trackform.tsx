import { useEffect, useRef, useState } from 'react'
import { Button, Card, NumericInput, Dialog, H5 } from '@blueprintjs/core'
import { Play, Pause, Eject } from '@blueprintjs/icons'
import Loader from '../../layout/loader'
import Slider, { SliderProps } from 'rc-slider'
import { initPeaks } from './initPeaks'
import { PeaksInstance } from 'peaks.js'
import { Tracks } from '../tracks/tracks'
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
  const [tableState, openTable] = useState(false)
  const [track, setTrack] = useState<Track>()
  const [bpmTimer, setBpmTimer] = useState<number>()

  const track1 = trackKey == 0
  const zoomView = waveform?.views.getView('zoomview')
  const trackState: TrackState =
    useLiveQuery(() => db.trackState.get({ trackKey })) || {}

  useEffect(() => {
    let getTrack
    const getTrackData = async () => {
      getTrack = await db.tracks.get(trackState.trackId!)
      setTrack(getTrack)

      if (getTrack && trackState.waveformData)
        getPeaks(getTrack, trackKey, trackState.file, trackState.waveformData)
    }

    if (trackState.trackId) getTrackData()
  }, [trackState])

  const updatePlaybackRate = (bpm: number) => {
    // update play speed to new bpm
    const playbackRate = bpm / (track?.bpm || bpm)
    if (audioElement.current) audioElement.current.playbackRate = playbackRate
  }

  const adjustBpm = async (bpm?: number) => {
    // get bpm from the user input field or mixState or current track
    bpm = bpm ?? Number(track?.bpm)

    updatePlaybackRate(bpm)

    // store custom bpm value in mixstate
    await db.trackState.update(
      { trackKey },
      {
        adjustedBpm: Number(bpm.toFixed(1))
      }
    )
  }

  const getPeaks = async (
    track: Track,
    trackKey: number,
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

  const adjustedBpm =
    trackState.adjustedBpm && Number(trackState.adjustedBpm).toFixed(1)

  const bpmDiff = adjustedBpm && adjustedBpm !== track?.bpm?.toFixed(1)

  const alignment = track1 ? 'align-self-sm-start' : 'align-self-sm-end'

  const bpmControl = (
    <div
      className={alignment}
      style={{
        display: 'inline-flex',
        flexBasis: bpmDiff ? '136px' : '100px',
        flexShrink: 0
      }}
    >
      <NumericInput
        disabled={!track?.bpm}
        onValueChange={(val: number) => {
          if (val) {
            if (bpmTimer) window.clearTimeout(bpmTimer)
            const debounce = window.setTimeout(() => adjustBpm(val), 1000)
            setBpmTimer(debounce)
          }
        }}
        value={adjustedBpm || track?.bpm?.toFixed(1) || 0}
        id={`bpmInput_${trackKey}`}
        allowNumericCharactersOnly={false}
        asyncControl={true}
        buttonPosition='none'
        fill={true}
        minorStepSize={0.1}
        rightElement={
          <Button
            color='primary'
            disabled={!bpmDiff}
            onClick={() => adjustBpm(track?.bpm || 1)}
            id={`bpmButton_${trackKey}`}
          >
            {bpmDiff ? 'Reset ' : ''}BPM
          </Button>
        }
      />
    </div>
  )

  const playerControl = !track?.name ? null : (
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
        icon={<Play />}
        onClick={() => {
          zoomView?.enableAutoScroll(true)
          waveform?.player.play()
        }}
        id={`playButton_${trackKey}`}
      ></Button>
      <Button
        color='light'
        title='Pause'
        icon={<Pause />}
        onClick={() => {
          waveform?.player.pause()
          zoomView?.enableAutoScroll(true)
        }}
        id={`pauseButton_${trackKey}`}
      ></Button>
    </div>
  )

  const trackHeader = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: track1 ? '5px' : 0,
        marginTop: track1 ? 0 : '5px'
      }}
    >
      <div
        style={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
      >
        <Button
          small={true}
          icon={<Eject title='Load Track' />}
          onClick={() => openTable(true)}
          id={`loadButton_${trackKey}`}
          style={{ marginRight: '8px' }}
        ></Button>

        <H5 style={{ display: 'inline', verticalAlign: 'text-bottom' }}>
          {analyzing
            ? 'Loading..'
            : track?.name?.replace(/\.[^/.]+$/, '') || 'No Track Loaded..'}
        </H5>
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
        style={{
          width: `${sliderControl?.width}px`,
          paddingTop: track1 ? '10px' : '20px',
          paddingBottom: track1 ? '20px' : '10px'
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
            dotStyle={{ borderColor: '#1e8bc3' }}
            activeDotStyle={{ borderColor: '#cc1d1d' }}
          />
        )}
      </div>
    </div>
  )

  const zoomview = (
    <div
      id={`zoomview-container_${trackKey}`}
      style={{
        height: '150px',
        visibility: analyzing ? 'hidden' : 'visible'
      }}
    />
  )

  const overview = (
    <div
      id={`overview-container_${trackKey}`}
      style={{
        height: '40px',
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
    <>
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
            <>{!track1 && track?.name && slider}</>

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

            <>{track1 && track?.name && slider}</>
            {!track1 && trackHeader}

            <audio id={`audio_${trackKey}`} src={audioSrc} ref={audioElement} />
          </div>
        </Card>
      </div>
      <Dialog
        isOpen={tableState}
        onClose={() => openTable(false)}
        style={{ width: '80%' }}
      >
        <Tracks
          trackKey={trackKey}
          hideDropzone={true}
          openTable={openTable}
          getPeaks={getPeaks}
        />
      </Dialog>
    </>
  )
}

export default TrackForm
