import { useState } from 'react'
import {
  Button,
  ButtonGroup,
  Breadcrumbs,
  Breadcrumb,
  BreadcrumbProps,
  Card
} from '@blueprintjs/core'
import { Play, Pause, Stop, Random } from '@blueprintjs/icons'
import TrackForm from './trackform'
import { Events } from '../../utils'
import { db, TrackState, useLiveQuery } from '../../db'
export const Mixes = () => {
  const [track0, track1]: TrackState[] =
    useLiveQuery(() => db.trackState.limit(2).toArray()) || []
  const [playing, setPlaying] = useState(false)

  const crumbs = [
    { text: 'Mixes', href: '/mixes' },
    { text: 'Mix Editor', current: true }
  ]

  const renderCrumb = ({ text, ...restProps }: BreadcrumbProps) => (
    <Breadcrumb {...restProps}>
      <span style={{ fontSize: '14px' }}>{text}</span>
    </Breadcrumb>
  )

  const timeFormat = (secs: number) =>
    new Date(secs * 1000).toISOString().substr(15, 6)

  const mixPointControl = (
    <>
      <ButtonGroup fill={true}>
        <Button
          icon={<Stop />}
          onClick={() => {
            setPlaying(false)
            Events.dispatch('audio', {
              effect: 'stop',
              tracks: [track0.trackId, track1.trackId]
            })
          }}
          id={`stopButton_mix`}
        >
          Stop
        </Button>

        <Button
          icon={playing ? <Pause /> : <Play />}
          onClick={() => {
            playing ? setPlaying(false) : setPlaying(true)
            Events.dispatch('audio', {
              effect: playing ? 'pause' : 'play',
              tracks: [track0.trackId, track1.trackId]
            })
          }}
          id={`playButton_mix`}
        >
          {playing ? 'Pause' : 'Play'}
        </Button>
      </ButtonGroup>
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'space-between',
          fontSize: '24px',
          margin: '20px 2px 0'
        }}
      >
        <span style={{ flex: 'auto' }}>
          {timeFormat(track0?.mixPoint || 0)}
        </span>
        <Random style={{ alignSelf: 'center', marginTop: '1px' }} size={23} />
        <span style={{ flex: 'auto', textAlign: 'right' }}>
          {timeFormat(track1?.mixPoint || 0)}
        </span>
      </div>
    </>
  )

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Breadcrumbs breadcrumbRenderer={renderCrumb} items={crumbs} />
      </div>
      <div className='mb-5'>
        <TrackForm trackKey={0} />
        <div style={{ display: 'flex', margin: '15px 0' }}>
          <Card style={{ flex: '0 0 250px' }}>{mixPointControl}</Card>
          <Card
            style={{ flex: 'auto', marginLeft: '15px', overflow: 'hidden' }}
          >
            <div id={`overview-container_0`} style={{ height: '40px' }} />
            <div id={`overview-container_1`} style={{ height: '40px' }} />
          </Card>
        </div>

        <TrackForm trackKey={1} />
      </div>
    </>
  )
}
