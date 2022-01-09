import { TopNavbar } from './topnav/topnavbar'
import { Toaster } from './toaster'
import { Icon } from '@blueprintjs/core'

window.onerror = msg =>
  Toaster.show({
    message: `Whoops! ${msg}`,
    intent: 'danger',
    icon: <Icon icon='warning-sign' />
  })
window.onunhandledrejection = (e: PromiseRejectionEvent) =>
  Toaster.show({
    message: `Whoops! ${e.reason.message}`,
    intent: 'danger',
    icon: <Icon icon='warning-sign' />
  })

const layoutStyle = { width: '90%', margin: '0 auto' }

const AppLayout: React.FunctionComponent = props => (
  <>
    <TopNavbar layoutStyle={layoutStyle} />

    <div style={{ ...layoutStyle, padding: '15px 10px' }}>{props.children}</div>
  </>
)

export default AppLayout
