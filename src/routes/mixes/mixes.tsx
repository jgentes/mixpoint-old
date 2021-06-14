import { useState } from 'react'
import {
  Breadcrumbs,
  Breadcrumb,
  BreadcrumbProps,
  Switch
} from '@blueprintjs/core'
import TrackForm from './trackform'
import { db } from '../../db'

import { Colors } from '@blueprintjs/core'

export const Mixes = () => {
  const [points, setPoints] = useState<number[]>([])

  const darkMode = document.body.classList.contains('bp4-dark')

  const setPoint = (trackKey: number, time: number) => {
    const pCopy = [...points]
    pCopy[trackKey] = time
    setPoints(pCopy)
  }

  const darkSwitch = (
    <div style={{ paddingTop: '10px', paddingRight: '5px' }}>
      <Switch
        checked={darkMode || false}
        onChange={() => db.appState.put(!darkMode, 'darkMode')}
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
      </div>
      <div className='mb-5'>
        {[0, 1].map(trackKey => {
          return (
            <div key={trackKey}>
              <TrackForm trackKey={trackKey} setPoint={setPoint} />
            </div>
          )
        })}
      </div>
    </>
  )
}
