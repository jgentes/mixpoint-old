import { toast } from 'react-toastify'

export const success = (trackName: string) => {
  toast.success(
    <>
      Loaded <strong>{trackName}</strong>
    </>,
    { autoClose: 3000 }
  )
}

export const failure = (trackName?: string) => {
  toast.error(
    <>
      Sorry, there was a problem loading{' '}
      <strong>{trackName || `the track`}</strong>
    </>,
    { autoClose: 4000 }
  )
}
