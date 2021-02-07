import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';

import App from './2-appClient';

render(
    <App />,
    document.querySelector('#root')
);