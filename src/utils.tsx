import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'

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

export const resizeEffect = (id: string) => {
  const width = id
    ? document.getElementById(id)?.clientWidth
    : window.innerWidth
  const height = id
    ? document.getElementById(id)?.clientHeight
    : window.innerHeight
  const [dimensions, setDimensions] = useState([width, height])

  useEffect(() => {
    const debouncedResizeHandler = debounce(() => {
      setDimensions([
        id ? document.getElementById(id)?.clientWidth : window.innerWidth,
        id ? document.getElementById(id)?.clientHeight : window.innerHeight
      ])
    }, 100) // 100ms
    window.addEventListener('resize', debouncedResizeHandler)
    return () => window.removeEventListener('resize', debouncedResizeHandler)
  }, [])

  return dimensions
}
