import { useEffect, useRef, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Row,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupTextProps,
  Table,
  CardBody,
  CardTitle,
  UncontrolledTooltip,
  UncontrolledCollapse,
  Nav,
  NavItem,
  NavLink
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
  const [waveform, setWaveform] = useState<PeaksInstance>()
  const [audioSrc, setAudioSrc] = useState('')

  const track1 = !!(trackKey % 2)
  const track = mixState[`track${trackKey}`] || {}
  const zoomView = waveform?.views.getView('zoomview')

  useEffect(() => {
    // pass waveformData here as a separate argument because it only
    // exists in mixState, not on the Track schema
    if (track.waveformData) getPeaks(track, track.file, track.waveformData)
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
    waveform?.player.seek(time)
    zoomView?.enableAutoScroll(false)
    waveform?.player.play()

    /*
    waveform?.segments.add({
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
        size='sm'
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
            onAfterChange={time => setMixPoint(time)}
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

  const midSection = (
    <Row className='mb-4'>
      <Col xl={12}>
        <Card>
          <CardBody className='bb-0 pb-0'>
            <span className='d-flex'>
              <CardTitle tag='h6' className='mb-0 bb-0'>
                Activity
              </CardTitle>
              <span className='ml-auto justify-content-start'>
                <a
                  href='javascript:;'
                  className='ml-auto justify-content-start pr-2'
                  id='ActivityTooltipSettings'
                >
                  <i className='fa fa-fw fa-sliders'></i>
                </a>{' '}
                <a href='javascript:;' id='ActivityTooltipAdd'>
                  <i className='fa fa-fw fa-plus'></i>
                </a>
              </span>
              <UncontrolledTooltip
                placement='top'
                target='ActivityTooltipSettings'
              >
                Settings
              </UncontrolledTooltip>
              <UncontrolledTooltip placement='top' target='ActivityTooltipAdd'>
                Add
              </UncontrolledTooltip>
            </span>
          </CardBody>
          <CardBody>
            <Nav tabs className='mb-3'>
              <NavItem>
                <NavLink href='#' active>
                  Processes
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink href='#'>Network</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href='#'>Storage</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href='#'>Energy</NavLink>
              </NavItem>
            </Nav>
            <Row>
              <Col lg={6}>
                <dl className='row mb-0'>
                  <dt className='col-sm-5'>Operating System</dt>
                  <dd className='col-sm-7 text-right text-inverse'>
                    Windows 10 x64
                  </dd>
                  <dt className='col-sm-5'>Build</dt>
                  <dd className='col-sm-7 text-right text-inverse'>9876</dd>
                </dl>
              </Col>
              <Col lg={6}>
                <dl className='row mb-0'>
                  <dt className='col-sm-5'>Admin</dt>
                  <dd className='col-sm-7 text-right text-inverse'>
                    John Malkovich
                  </dd>
                  <dt className='col-sm-5'>Network</dt>
                  <dd className='col-sm-7 text-right text-inverse'>
                    Wireless Network
                  </dd>
                </dl>
              </Col>
            </Row>
            <Table hover className='mb-0' size='sm' responsive>
              <thead>
                <tr>
                  <th scope='col' className='bt-0'>
                    Process
                  </th>
                  <th scope='col' className='align-middle text-right bt-0'>
                    Read
                  </th>
                  <th scope='col' className='align-middle text-right bt-0'>
                    Threads
                  </th>
                  <th scope='col' className='align-middle text-right bt-0'>
                    CPU
                  </th>
                  <th scope='col' className='align-middle text-right bt-0'>
                    GPU
                  </th>
                  <th scope='col' className='align-middle text-right bt-0'>
                    Memory
                  </th>
                  <th scope='col' className='align-middle text-right bt-0'>
                    Tend
                  </th>
                  <th className='bt-0'></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='align-middle text-nowrap'>
                    <i className='fa fa fa-window-maximize mr-1'></i>
                    <span className='text-inverse'>Chrome</span>
                  </td>
                  <td className='align-middle text-right'>30MB/s</td>
                  <td className='align-middle text-right'>20</td>
                  <td className='align-middle text-right'>24%</td>
                  <td className='align-middle text-right'>56%</td>
                  <td className='align-middle text-right'>7.9GB</td>
                  <td className='align-middle text-right'>
                    <i className='fa fa-arrow-down fa-fw text-danger'></i>
                  </td>
                  <td className='align-middle text-right'>
                    <a href='#' id='tr1'>
                      <i className='fa fa-fw fa-angle-down'></i>
                    </a>
                    <UncontrolledTooltip placement='top' target='tr1'>
                      Show Details
                    </UncontrolledTooltip>
                  </td>
                </tr>
                <UncontrolledCollapse toggler='#tr1'>
                  <tr>
                    <td colSpan='8' className='bt-0'>
                      <samp className='small'>19,1,2,2</samp>
                    </td>
                  </tr>
                </UncontrolledCollapse>
                <tr>
                  <td className='align-middle text-nowrap'>
                    <i className='fa fa fa-window-maximize mr-1'></i>
                    <span className='text-inverse'>Photoshop</span>
                  </td>
                  <td className='align-middle text-right'>40MB/s</td>
                  <td className='align-middle text-right'>60</td>
                  <td className='align-middle text-right'>25%</td>
                  <td className='align-middle text-right'>10%</td>
                  <td className='align-middle text-right'>1.1GB</td>
                  <td className='align-middle text-right'>
                    <i className='fa fa-arrow-up fa-fw text-success'></i>
                  </td>
                  <td className='align-middle text-right'>
                    <a href='#' id='tr2'>
                      <i className='fa fa-fw fa-angle-down'></i>
                    </a>
                    <UncontrolledTooltip placement='top' target='tr2'>
                      Show Details
                    </UncontrolledTooltip>
                  </td>
                </tr>
                <UncontrolledCollapse toggler='#tr2'>
                  <tr>
                    <td colSpan='8' className='bt-0'>
                      <samp className='small'>12414</samp>
                    </td>
                  </tr>
                </UncontrolledCollapse>
                <tr>
                  <td className='align-middle text-nowrap'>
                    <i className='fa fa fa-window-maximize mr-1'></i>
                    <span className='text-inverse'>Chrome</span>
                  </td>
                  <td className='align-middle text-right'>60MB/s</td>
                  <td className='align-middle text-right'>60</td>
                  <td className='align-middle text-right'>19%</td>
                  <td className='align-middle text-right'>56%</td>
                  <td className='align-middle text-right'>2.4GB</td>
                  <td className='align-middle text-right'>
                    <i className='fa fa-arrow-down fa-fw text-danger'></i>
                  </td>
                  <td className='align-middle text-right'>
                    <a href='#' id='tr3'>
                      <i className='fa fa-fw fa-angle-down'></i>
                    </a>
                    <UncontrolledTooltip placement='top' target='tr3'>
                      Show Details
                    </UncontrolledTooltip>
                  </td>
                </tr>
                <UncontrolledCollapse toggler='#tr3'>
                  <tr>
                    <td colSpan='8' className='bt-0'>
                      <samp className='small'>14214</samp>
                    </td>
                  </tr>
                </UncontrolledCollapse>
                <tr>
                  <td className='align-middle text-nowrap'>
                    <i className='fa fa fa-window-maximize mr-1'></i>
                    <span className='text-inverse'>Safari</span>
                  </td>
                  <td className='align-middle text-right'>10MB/s</td>
                  <td className='align-middle text-right'>40</td>
                  <td className='align-middle text-right'>19%</td>
                  <td className='align-middle text-right'>56%</td>
                  <td className='align-middle text-right'>1.1GB</td>
                  <td className='align-middle text-right'>
                    <i className='fa fa-arrow-up fa-fw text-success'></i>
                  </td>
                  <td className='align-middle text-right'>
                    <a href='#' id='tr4'>
                      <i className='fa fa-fw fa-angle-down'></i>
                    </a>
                    <UncontrolledTooltip placement='top' target='tr4'>
                      Show Details
                    </UncontrolledTooltip>
                  </td>
                </tr>
                <UncontrolledCollapse toggler='#tr4'>
                  <tr>
                    <td colSpan='8' className='bt-0'>
                      <samp className='small'>1414</samp>
                    </td>
                  </tr>
                </UncontrolledCollapse>
                <tr>
                  <td className='align-middle text-nowrap'>
                    <i className='fa fa fa-window-maximize mr-1'></i>
                    <span className='text-inverse'>Chrome</span>
                  </td>
                  <td className='align-middle text-right'>30MB/s</td>
                  <td className='align-middle text-right'>10</td>
                  <td className='align-middle text-right'>27%</td>
                  <td className='align-middle text-right'>27%</td>
                  <td className='align-middle text-right'>9.1GB</td>
                  <td className='align-middle text-right'>
                    <i className='fa fa-arrow-down fa-fw text-danger'></i>
                  </td>
                  <td className='align-middle text-right'>
                    <a href='#' id='tr5'>
                      <i className='fa fa-fw fa-angle-down'></i>
                    </a>
                    <UncontrolledTooltip placement='top' target='tr5'>
                      Show Details
                    </UncontrolledTooltip>
                  </td>
                </tr>
                <UncontrolledCollapse toggler='#tr5'>
                  <tr>
                    <td colSpan='8' className='bt-0'>
                      <samp className='small'>14124</samp>
                    </td>
                  </tr>
                </UncontrolledCollapse>
                <tr>
                  <td className='align-middle text-nowrap'>
                    <i className='fa fa fa-window-maximize mr-1'></i>
                    <span className='text-inverse'>System</span>
                  </td>
                  <td className='align-middle text-right'>70MB/s</td>
                  <td className='align-middle text-right'>30</td>
                  <td className='align-middle text-right'>10%</td>
                  <td className='align-middle text-right'>19%</td>
                  <td className='align-middle text-right'>8.8GB</td>
                  <td className='align-middle text-right'>
                    <i className='fa fa-arrow-up fa-fw text-success'></i>
                  </td>
                  <td className='align-middle text-right'>
                    <a href='#' id='tr6'>
                      <i className='fa fa-fw fa-angle-down'></i>
                    </a>
                    <UncontrolledTooltip placement='top' target='tr6'>
                      Show Details
                    </UncontrolledTooltip>
                  </td>
                </tr>
                <UncontrolledCollapse toggler='#tr6'>
                  <tr>
                    <td colSpan='8' className='bt-0'>
                      <samp className='small'>124</samp>
                    </td>
                  </tr>
                </UncontrolledCollapse>
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>

      <Col lg={3}>
        <div className='hr-text hr-text-center my-2'>
          <span>Track 1</span>
        </div>
        <Row>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='las la-circle text-primary mr-2'></i>
              Today
            </p>
            <h4 className='mt-2 mb-0'>$3,267</h4>
          </Col>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='las la-circle text-info mr-2'></i>
              This Month
            </p>
            <h4 className='mt-2 mb-0'>$8,091</h4>
          </Col>
        </Row>
      </Col>
      <Col lg={6}>
        <div className='hr-text hr-text-center my-2'>
          <span>Mix</span>
        </div>
        <Row>
          <span className='la-stack la-lg la-fw d-flex mr-3'>
            <i className='la la-fw la-stack-2x la-stack-2x text-success la-circle'></i>
            <i className='la la-stack-1x la-fw text-white la-check'></i>
          </span>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='las la-circle text-primary mr-2'></i>
              Today
            </p>
            <h4 className='mt-2 mb-0'>$3,267</h4>
          </Col>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='las la-circle text-info mr-2'></i>
              This Month
            </p>
            <h4 className='mt-2 mb-0'>$8,091</h4>
          </Col>
        </Row>
      </Col>
      <Col lg={3}>
        <div className='hr-text hr-text-center my-2'>
          <span>Track 2</span>
        </div>
        <Row>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='las la-circle text-primary mr-2'></i>
              Today
            </p>
            <h4 className='mt-2 mb-0'>$3,267</h4>
          </Col>
          <Col xs={6} className='text-center'>
            <p className='text-center mb-0'>
              <i className='las la-circle text-info mr-2'></i>
              This Month
            </p>
            <h4 className='mt-2 mb-0'>$8,091</h4>
          </Col>
        </Row>
      </Col>
    </Row>
  )

  const loader = analyzing ? <Loader className='my-5' /> : null

  return (
    <>
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
      {track1 && track.name && midSection}
    </>
  )
}

export default TrackForm
