// from https://testing-library.com/docs/react-testing-library/setup

import React from 'react'
import PropTypes from 'prop-types'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppLayout from './src/layout/layout'

const basePath = process.env.BASE_PATH || '/'

const AllTheProviders = ({ children }) => {
  AllTheProviders.propTypes = {
    children: PropTypes.object
  }

  return (
    <Router basename={basePath}>
      <AppLayout>{children}</AppLayout>
    </Router>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// re-export everything
export * from '@testing-library/react'

// override render method
export { customRender as render }
