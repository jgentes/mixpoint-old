// This file renders the app within the index.html file (#root)
import '@babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import 'style-loader!css-loader!sass-loader!./custom.scss';
import 'style-loader!css-loader!sass-loader!./layout/loader.scss';

import App from './appclient';

const container = document.querySelector('#root');

ReactDOM.render(<App />, container);