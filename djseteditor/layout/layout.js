import React from 'react';
import PropTypes from 'prop-types';

import '../../airframe/styles/bootstrap.scss';
import '../../airframe/styles/main.scss';
import '../../airframe/styles/plugins/plugins.scss';
import '../../airframe/styles/plugins/plugins.css';

import { Helmet } from 'react-helmet';
import { TopNavbar } from './topnav/topnavbar';

import config from '../../config';

const favIcons = [
    { rel: 'icon', type: 'image/jpg', sizes: '32x32', href: require('../assets/soundwave-32px.jpg') },
    { rel: 'icon', type: 'image/jpg', sizes: '16x16', href: require('../assets/soundwave-16px.jpg') }
];

class AppLayout extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired
    }

    render() {
        const { children } = this.props;

        return (
            <>
                <Helmet>
                    <meta charSet="utf-8" />
                    <title>{config.siteTitle}</title>
                    <link rel="canonical" href={config.siteCannonicalUrl} />
                    <meta name="description" content={config.siteDescription} />
                    {
                        _.map(favIcons, (favIcon, index) => (
                            <link {...favIcon} key={index} />
                        ))
                    }

                </Helmet>
                <TopNavbar />
                {children}
            </>
        );
    }
}

export default AppLayout;
