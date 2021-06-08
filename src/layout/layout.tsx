import { Helmet } from 'react-helmet'
import { TopNavbar } from './topnav/topnavbar'
import { ToastContainer, toast } from 'react-toastify'

import favIcon32 from 'url:../assets/soundwave-32px.jpg'
import favIcon16 from 'url:../assets/soundwave-16px.jpg'

window.onerror = msg => toast.error(`Whoops! ${msg}`)
window.onunhandledrejection = (e: PromiseRejectionEvent) =>
  toast.error(`Whoops! ${e.reason.message}`)

const layoutStyle = { width: '80%', margin: '0 auto' }

const favIcons = [
  {
    rel: 'icon',
    type: 'image/jpg',
    sizes: '32x32',
    href: favIcon32
  },
  {
    rel: 'icon',
    type: 'image/jpg',
    sizes: '16x16',
    href: favIcon16
  }
]

const AppLayout: React.FunctionComponent = props => (
  <>
    <Helmet>
      <meta charSet='utf-8' />
      <title>MixPoint</title>
      <meta
        name='description'
        content={'Multi-track audio editor designed for mixing dj sets'}
      />
      {favIcons.map((favIcon, index) => (
        <link {...favIcon} key={index} />
      ))}
    </Helmet>

    <TopNavbar layoutStyle={layoutStyle} />

    <div style={{ ...layoutStyle, padding: '15px 10px' }}>{props.children}</div>

    <ToastContainer
      position='bottom-center'
      autoClose={10000}
      draggable={false}
      hideProgressBar={true}
      bodyClassName='text-black'
    />
  </>
)

export default AppLayout
