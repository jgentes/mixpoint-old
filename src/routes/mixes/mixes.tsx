import { useState } from 'react'
import {
  Breadcrumbs,
  Breadcrumb,
  BreadcrumbProps,
  Switch
} from '@blueprintjs/core'
import TrackForm from './trackform'
import { db, MixState, updateState } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'
import { Colors } from '@blueprintjs/core'

export const Mixes = () => {
  const [points, setPoints] = useState<number[]>([])

  // pull state from db to hydrate component state
  const state: MixState = useLiveQuery(() => db.state.get('mixState')) ?? {
    tracks: []
  }

  const darkMode =
    useLiveQuery((): Promise<boolean> => db.state.get('darkMode')) ?? false

  const setPoint = (trackKey: number, time: number) => {
    const pCopy = [...points]
    pCopy[trackKey] = time
    setPoints(pCopy)
  }

  const darkSwitch = (
    <div style={{ paddingTop: '10px', paddingRight: '5px' }}>
      <Switch
        checked={darkMode}
        onChange={() => updateState(!darkMode, 'darkMode')}
        labelElement={<span style={{ color: Colors.GRAY2 }}>Dark Mode</span>}
        innerLabel='OFF'
        innerLabelChecked='ON'
        alignIndicator='right'
      />
    </div>
  )

  const crumbs = [
    { text: 'Mixes', href: '/mixes' },
    { text: 'Mix Editor', current: true }
  ]

  const renderCrumb = ({ text, ...restProps }: BreadcrumbProps) => (
    <Breadcrumb {...restProps}>
      <span style={{ fontSize: '14px' }}>{text}</span>
    </Breadcrumb>
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

        {darkSwitch}

        {/*
        <Button
          onClick={() => putTrack([...tracks, Date.now()])}
          className='ml-auto align-self-center'
          color='primary'
          outline
        >
          Add Track
        </Button>
        */}
      </div>
      <div className='mb-5'>
        {[1, 2].map(trackKey => {
          return (
            <div key={trackKey}>
              <TrackForm
                trackKey={trackKey}
                trackState={state.tracks![trackKey - 1]}
                setPoint={setPoint}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}
