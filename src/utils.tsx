import { Toaster } from './layout/toaster'

export const success = (trackName?: string, customMessage?: string) => {
  Toaster.show({
    intent: 'success',
    message: customMessage ? (
      <>{customMessage}</>
    ) : (
      <>
        Analyzed <strong>{trackName}</strong>
      </>
    ),
    timeout: 3000
  })
}

export const failure = (trackName?: string, customMessage?: string) => {
  Toaster.show({
    intent: 'danger',
    message: customMessage ? (
      <>{customMessage}</>
    ) : (
      <>
        Sorry, there was a problem loading{' '}
        <strong>{trackName || `the track`}</strong>
      </>
    ),
    timeout: 4000
  })
}

export const debounce = (fn: any, ms: number) => {
  let timer: number | undefined
  return _ => {
    window.clearTimeout(timer)
    timer = window.setTimeout(_ => {
      timer = undefined
      fn.apply(this, arguments)
    }, ms)
  }
}
