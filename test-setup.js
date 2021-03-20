// from https://testing-library.com/docs/react-testing-library/setup

import React from 'react'
import PropTypes from 'prop-types'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { ToastContainer, toast } from 'react-toastify'
import '@testing-library/jest-dom'

import config from './config'

window.onerror = msg => toast.error(`Whoops! ${msg}`)
window.onunhandledrejection = e => toast.error(`Whoops! ${e.reason.message}`)

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

const AllTheProviders = ({ children }) => {
  AllTheProviders.propTypes = {
    children: PropTypes.object
  }

  return (
    <Router basename={basePath}>
      <Helmet>
        <meta charSet='utf-8' />
        <title>{config.siteTitle}</title>
        <link rel='canonical' href={config.siteCannonicalUrl} />
        <meta name='description' content={config.siteDescription} />
        {favIcons.map((favIcon, index) => (
          <link {...favIcon} key={index} />
        ))}
      </Helmet>

      {children}

      <ToastContainer
        position='bottom-center'
        autoClose={10000}
        draggable={false}
        hideProgressBar={true}
        bodyClassName='text-black'
      />
    </Router>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
