import { Container, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import Toggle from 'react-toggle'
import TrackForm from './trackform.js'
import { db, updateMixState } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'

export const Mixes = () => {
  const tracks = [1, 2]

  // pull state from db to hyrdate component state
  const mixState = useLiveQuery(() => db.state.get('mixState'))

  console.log('mixstate:', mixState)
  const bpmControl = (
    <div className='mt-3'>
      <Toggle
        checked={mixState?.bpmSync || false}
        size='small'
        icons={{
          checked: <i className='las la-check text-white' />,
          unchecked: null
        }}
        onChange={() => updateMixState({ bpmSync: true })}
      />
      <span className='ml-2' style={{ verticalAlign: 'top' }}>
        BPM Sync
      </span>
    </div>
  )

  return (
    <Container>
      <div className='d-flex justify-content-between'>
        <Breadcrumb className='align-self-start'>
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
          onClick={() => addTrack([...tracks, Date.now()])}
          className='ml-auto align-self-center'
          color='primary'
          outline
        >
          Add Track
        </Button>
        */}
      </div>

      <div className='mb-5'>
        {tracks?.map(trackKey => (
          <TrackForm key={trackKey} trackKey={trackKey} mixState={mixState} />
        ))}
      </div>
    </Container>
  )
}
