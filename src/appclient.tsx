// This file wraps the app content with context for routing and hot reload
import { BrowserRouter as Router } from 'react-router-dom'
import AppLayout from './layout/layout'
import { RoutedContent } from './routes/routes'
import { db } from './db'
import { useLiveQuery } from 'dexie-react-hooks'

const basePath = process.env.BASE_PATH || '/'

const AppClient = () => {
  const darkMode =
    useLiveQuery((): Promise<boolean> => db.state.get('darkMode')) ?? false
  console.log({ darkMode })
  if (darkMode) {
    document.body.classList.add('bp4-dark')
  } else document.body.classList.remove('bp4-dark')

  return (
    <Router basename={basePath}>
      <AppLayout>
        <RoutedContent />
      </AppLayout>
    </Router>
  )
}
export default AppClient
