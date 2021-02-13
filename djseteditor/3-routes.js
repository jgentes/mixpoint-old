import React from 'react';
import {
    Route,
    Switch,
    Redirect
} from 'react-router';

// ----------- Pages Imports ---------------
import { Canvas } from './4-canvas';
import { Tracks } from './4-tracks';

//------ Route Definitions --------
// eslint-disable-next-line no-unused-vars
export const RoutedContent = () => {
    return (
        <Switch>
            <Redirect from="/" to="/mixes" exact />

            <Route component={Canvas} path="/mixes" />
            <Route component={Tracks} path="/tracks" />

            { /*    404    */}
            <Redirect to="/pages/error-404" />
        </Switch>
    );
};

