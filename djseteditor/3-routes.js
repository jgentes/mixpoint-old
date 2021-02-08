import React from 'react';
import {
    Route,
    Switch,
    Redirect
} from 'react-router';

// ----------- Pages Imports ---------------
import { Canvas } from './4-canvas';

//------ Route Definitions --------
// eslint-disable-next-line no-unused-vars
export const RoutedContent = () => {
    return (
        <Switch>
            <Redirect from="/" to="/djseteditor" exact />

            <Route component={Canvas} path="/djseteditor" />

            { /*    404    */}
            <Redirect to="/pages/error-404" />
        </Switch>
    );
};

