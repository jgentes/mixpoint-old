// This file renders the app within the index.html file (#root)
import '@babel/polyfill'
import ReactDOM from 'react-dom'

import './styles/app.scss'

import App from './appclient'

const container = document.querySelector('#root')

ReactDOM.render(<App />, container)