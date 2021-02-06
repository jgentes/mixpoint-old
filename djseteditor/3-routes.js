import React from 'react';
import {
    Route,
    Switch,
    Redirect
} from 'react-router';

// ----------- Pages Imports ---------------
import DjSetEditor from './4-DjSetEditor';

import ProjectsDashboard from '../airframe/routes/Dashboards/Projects';
import DragAndDropElements from './DragAndDropElements';

//------ Route Definitions --------
// eslint-disable-next-line no-unused-vars
export const RoutedContent = () => {
    return (
        <Switch>
            <Redirect from="/" to="/djseteditor" exact />
            
            <Route component={ DragAndDropElements } path="/djseteditor" />
            <Route path="/dashboards/projects" exact component={ProjectsDashboard} />          

            { /*    404    */ }
            <Redirect to="/pages/error-404" />
        </Switch>
    );
};

