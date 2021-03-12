// This file renders the app within the index.html file (#root)
import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'

import './styles/app.scss'

import App from './appclient'

const container = document.querySelector('#root')

if (module.hot) module.hot.accept()

ReactDOM.render(<App />, container)
