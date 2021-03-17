import PropTypes from 'prop-types'

import { Helmet } from 'react-helmet'
import { TopNavbar } from './topnav/topnavbar'
import { ToastContainer, toast } from 'react-toastify'

import config from '../../config'

window.onerror = msg => toast.error(`Whoops! ${msg}`)
window.onunhandledrejection = e => toast.error(`Whoops! ${e.reason.message}`)

const favIcons = [
  {
    rel: 'icon',
    type: 'image/jpg',
    sizes: '32x32',
    href: '/assets/soundwave-32px.jpg'
  },
  {
    rel: 'icon',
    type: 'image/jpg',
    sizes: '16x16',
    href: '/assets/soundwave-16px.jpg'
  }
]

class AppLayout extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  }

  render () {
    const { children } = this.props

    return (
      <>
        <Helmet>
          <meta charSet='utf-8' />
          <title>{config.siteTitle}</title>
          <link rel='canonical' href={config.siteCannonicalUrl} />
          <meta name='description' content={config.siteDescription} />
          {favIcons.map((favIcon, index) => (
            <link {...favIcon} key={index} />
          ))}
        </Helmet>

        <TopNavbar />

        {children}

        <ToastContainer
          position='bottom-center'
          autoClose={10000}
          draggable={false}
          hideProgressBar={true}
          bodyClassName='text-black'
        />
      </>
    )
  }
}

export default AppLayout
