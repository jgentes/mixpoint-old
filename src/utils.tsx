import { toast } from 'react-toastify'

export const success = (trackName?: string, customMessage?: string) => {
  toast.success(
    customMessage ? (
      <>{customMessage}</>
    ) : (
      <>
        Analyzed <strong>{trackName}</strong>
      </>
    ),
    { autoClose: 3000 }
  )
}

export const failure = (trackName?: string, customMessage?: string) => {
  toast.error(
    customMessage ? (
      <>{customMessage}</>
    ) : (
      <>
        Sorry, there was a problem loading{' '}
        <strong>{trackName || `the track`}</strong>
      </>
    ),
    { autoClose: 4000 }
  )
}
