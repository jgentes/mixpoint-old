import { useState } from 'react'
import { Breadcrumb, BreadcrumbItem, Container } from 'reactstrap'
import Toggle from 'react-toggle'
import TrackForm from './trackform'
import { db, MixState, updateMixState } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'

export const Mixes = () => {
  const [points, setPoints] = useState<number[]>([])

  // pull state from db to hyrdate component state
  const state: MixState = useLiveQuery(() => db.state.get('mixState')) ?? {
    tracks: []
  }

  const setPoint = (trackKey: number, time: number) => {
    const pCopy = [...points]
    pCopy[trackKey] = time
    setPoints(pCopy)
  }

  const bpmControl = (
    <div>
      <Toggle
        checked={!!state?.bpmSync || false}
        size={1}
        icons={{
          checked: <i className='las la-check text-white' />,
          unchecked: null
        }}
        onChange={() => updateMixState({ bpmSync: true })}
      />
      <span className='mx-3' style={{ verticalAlign: 'top' }}>
        BPM Sync
      </span>
    </div>
  )

  return (
    <Container>
      <div className='d-flex justify-content-between align-items-center'>
        <Breadcrumb>
          <BreadcrumbItem className='mt-1'>
            <a href='/mixes'>Mixes</a>
          </BreadcrumbItem>
          <BreadcrumbItem className='mt-1' active>
            Mix Editor
          </BreadcrumbItem>
        </Breadcrumb>

        {bpmControl}

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
    </Container>
  )
}
