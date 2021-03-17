import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Card, Input, InputGroup, InputGroupAddon } from 'reactstrap'
import { processTrack } from '../../audio'
import Loader from '../../layout/loader'
import Slider from 'rc-slider'
import { initPeaks } from './initPeaks'
import { db, updateMixState } from '../../db'

const TrackForm = ({ trackKey, mixState }) => {
  TrackForm.propTypes = {
    trackKey: PropTypes.number,
    mixState: PropTypes.object
  }

  const audioElement = useRef()

  const [sliderControl, setSliderControl] = useState()
  const [audioSrc, setAudioSrc] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [primaryTrack, setTrack] = useState({})
  const [canvas, setCanvas] = useState()

  const track1 = !!(trackKey % 2)

  const updatePlaybackRate = bpm => {
    // update play speed to new bpm
    const playbackRate = bpm / (primaryTrack.bpm || bpm)
    audioElement.current.playbackRate = playbackRate
  }

  const adjustBpm = async bpm => {
    // get bpm from the user input field or mixState or current track
    bpm = Number(bpm || primaryTrack.bpm)

    updatePlaybackRate(bpm)

    // store custom bpm value in mixstate
    await updateMixState({ [`track${trackKey}_bpm`]: bpm.toFixed(1) })
  }

  const getPeaks = async track =>
    await initPeaks({
      trackKey,
      track,
      setTrack,
      setAudioSrc,
      setSliderControl,
      setCanvas,
      adjustBpm,
      setAnalyzing
    })

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

    const track =
      (await db.tracks.get(fileHandle.name)) || (await processTrack(fileHandle))
    console.log(track)
    getPeaks(track)
  }

  const bpmVal =
    mixState?.[`track${trackKey}_bpm`] || primaryTrack.bpm?.toFixed(1) || 0

  const bpmDiff = bpmVal === primaryTrack.bpm?.toFixed(1)

  const bpmControl = (
    <div className='pr-2'>
      <InputGroup size='sm' style={{ width: bpmDiff ? '140px' : '110px' }}>
        <Input
          type='text'
          className={`${!primaryTrack.bpm ? 'text-gray-500' : ''}`}
          disabled={!primaryTrack.bpm}
          onChange={e => adjustBpm(e.target.value)}
          value={bpmVal}
        />
        <InputGroupAddon addonType='append'>
          <Button
            color='primary'
            disabled={!bpmDiff}
            onClick={() => adjustBpm(primaryTrack.bpm)}
          >
            {bpmDiff ? 'Reset ' : ''}BPM
          </Button>
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
        <i className='las la-play text-success' />
      </Button>
      <Button
        color='light'
        title='Pause'
        size='sm'
        className='ml-1 b-black-02'
        onClick={() => canvas.player.pause()}
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
        >
          <i className='las la-eject la-15em text-warning' />
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

  const loader = analyzing ? <Loader className='my-5' /> : null
  //mixState.bpm && mixState.

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
