// This file renders the app within the index.html file (#root)

import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';

import App from './appclient';

render(
    <App />,
    document.querySelector('#root')
);