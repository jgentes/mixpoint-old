// This file renders the app within the index.html file (#root)
import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'

import './styles/bootstrap.scss'
import './styles/main.scss'
import './styles/plugins/plugins.scss'
import './styles/plugins/plugins.css'
import './styles/loader.scss'
import './styles/custom.css'

import App from './appclient'

const container = document.querySelector('#root')

ReactDOM.render(<App />, container)
