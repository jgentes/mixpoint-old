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
export const Events = {
  on (event: string, callback: Function) {
    window.addEventListener(event, (e: CustomEventInit) => callback(e.detail))
  },
  dispatch (event: string, data: any) {
    window.dispatchEvent(new CustomEvent(event, { detail: data }))
  },
  remove (event: string, callback: any) {
    window.removeEventListener(event, callback)
  }
}
