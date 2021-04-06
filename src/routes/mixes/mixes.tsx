import { Container, Breadcrumb, BreadcrumbItem } from 'reactstrap'
import Toggle from 'react-toggle'
import TrackForm from './trackform'
import { db, mixState, updateMixState } from '../../db'
import { useLiveQuery } from 'dexie-react-hooks'

export const Mixes = () => {
  const tracks = [1, 2]

  // pull state from db to hyrdate component state
  const state: mixState = useLiveQuery(() => db.state.get('mixState')) ?? {}

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
  /*
  const centerArea = (
    <div className='timeline'>
      <div className='timeline-date'>something here</div>
      <div className='timeline-item'>
        <div className='timeline-icon'>
          <i className={`las la-exclamation-circle la-15em text-danger`}></i>
        </div>
        <div className='timeline-item-head clearfix mb-0 pl-3'>
          <div className='mb-2'>
            <span className={`badge badge-primary `}>Badge Title</span>
          </div>

          <p className='text-inverse mb-1'>hello! content</p>
        </div>
      </div>
    </div>
  )
*/
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
          <TrackForm key={trackKey} trackKey={trackKey} mixState={state} />
        ))}
      </div>
    </Container>
  )
}
