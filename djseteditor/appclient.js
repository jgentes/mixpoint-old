// This file wraps the app content with context for routing and hot reload
import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader'
import { BrowserRouter as Router } from 'react-router-dom';

import { db } from './db';

import AppLayout from './layout/layout';
import { RoutedContent } from './routes/routes';

const basePath = process.env.BASE_PATH || '/';

const AppClient = () => {
    const [tracks, setTracks] = useState([]);

    useEffect(() => {
        db.table('tracks')
            .toArray()
            .then(trackArray => {
                setTracks(trackArray);
            });
    }, [])

    return (
        <Router basename={basePath}>
            <AppLayout>
                <RoutedContent />
            </AppLayout>
        </Router>
    );
}

export default hot(module)(AppClient);