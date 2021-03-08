// This file renders the app within the index.html file (#root)
import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'

import App from './appclient'

const container = document.querySelector('#root')

ReactDOM.render(<App />, container)
