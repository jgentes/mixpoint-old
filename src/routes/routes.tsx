import { Route, Switch, Redirect } from 'react-router'

// ----------- Pages Imports ---------------
import { Mixes } from './mixes/mixes'
import { Tracks } from './tracks/tracks'

// ------ Route Definitions --------
// eslint-disable-next-line no-unused-vars
export const RoutedContent = (): JSX.Element => {
  return (
    <Switch>
      <Redirect from='/' to='/mixes' exact />

      <Route component={Mixes} path='/mixes' />
      <Route component={Tracks} path='/tracks' />

      {/*    404    */}
      <Redirect to='/pages/error-404' />
    </Switch>
  )
}
