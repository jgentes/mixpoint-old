// This file wraps the app content with context for routing and hot reload
import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'

import AppLayout from './layout/layout'
import { RoutedContent } from './routes/routes'
/*
import './styles/main.scss';
import './styles/plugins/plugins.scss';
import './styles/plugins/plugins.css';
import './styles/loader.scss';
import './styles/custom.css';
*/
const basePath = process.env.BASE_PATH || '/'

const AppClient = () => {
  return (
    <Router basename={basePath}>
      <AppLayout>
        <RoutedContent />
      </AppLayout>
    </Router>
  )
}

export default AppClient
