// This file renders the app within the index.html file (#root)
import ReactDOM from 'react-dom'

import './styles/app.scss'

import App from './appclient'

ReactDOM.render(<App />, document.querySelector('#root'))
