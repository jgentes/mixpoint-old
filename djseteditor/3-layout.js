import React from 'react';
import PropTypes from 'prop-types';

import { Layout } from '../airframe/components';

import '../airframe/styles/bootstrap.scss';
import '../airframe/styles/main.scss';
import '../airframe/styles/plugins/plugins.scss';
import '../airframe/styles/plugins/plugins.css';

import { TopNavbar } from './Layout/TopNavbar';

const favIcons = [
    { rel: 'icon', type: 'image/jpg', sizes: '32x32', href: require('./images/soundwave-32px.jpg') },
    { rel: 'icon', type: 'image/jpg', sizes: '16x16', href: require('./images/soundwave-16px.jpg') }
];

class AppLayout extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired
    }

    render() {
        const { children } = this.props;

        return (
            <Layout favIcons={favIcons}>
                { /* --------- Navbar ----------- */}
                <Layout.Navbar>
                    <TopNavbar />
                </Layout.Navbar>
                { /* -------- Sidebar ------------
                    <Layout.Sidebar>
                        <RoutedSidebars />
                    </Layout.Sidebar>
                    */ }
                { /* -------- Content ------------*/}
                <Layout.Content>
                    {children}
                </Layout.Content>
            </Layout>
        );
    }
}

export default AppLayout;
