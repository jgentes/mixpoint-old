// from https://testing-library.com/docs/react-testing-library/setup
// this file closely follows src/layout/layout.tsx
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import '@testing-library/jest-dom'
require('fake-indexeddb/auto')

// for URL.createObjectURL & URL.revokeObjectURL: https://github.com/jsdom/jsdom/issues/1721

function noOp () {}
if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: noOp })
}

if (typeof window.URL.revokeObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'revokeObjectURL', { value: noOp })
}

// for Worker: https://github.com/facebook/jest/issues/3449
window.Worker = jest.fn()

const favIcons = [
  {
    rel: 'icon',
    type: 'image/jpg',
    sizes: '32x32',
    href: '/assets/soundwave-32px.jpg'
  },
  {
    rel: 'icon',
    type: 'image/jpg',
    sizes: '16x16',
    href: '/assets/soundwave-16px.jpg'
  }
]

const basePath = process.env.BASE_PATH || '/'

const AllTheProviders = ({ children }: { children: object }) => {
  return (
    <Router basename={basePath}>
      <Helmet>
        <meta charSet='utf-8' />
        <title>DJ Set Editor</title>
        <meta
          name='description'
          content={'Multi-track audio editor designed for mixing dj sets'}
        />
        {favIcons.map((favIcon, index) => (
          <link {...favIcon} key={index} />
        ))}
      </Helmet>

      {children}
    </Router>
  )
}

const customRender = (ui: any, options?: object) =>
  // @ts-expect-error
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
