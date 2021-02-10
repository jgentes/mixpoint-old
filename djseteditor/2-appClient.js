import React from 'react';
import { hot } from 'react-hot-loader'
import { BrowserRouter as Router } from 'react-router-dom';

import AppLayout from './3-layout';
import { RoutedContent } from './3-routes';

const basePath = process.env.BASE_PATH || '/';

const AppClient = () => {
    return (
        <Router basename={ basePath }>
            <AppLayout>
                <RoutedContent />
            </AppLayout>
        </Router>
    );
}

export default hot(module)(AppClient);