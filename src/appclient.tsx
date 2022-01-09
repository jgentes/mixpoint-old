// This file wraps the app content with context for routing and hot reload
import { useMemo } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppLayout from './layout/layout'
import { RoutedContent } from './routes/routes'
import { db } from './db'
import { useLiveQuery } from 'dexie-react-hooks'
import { deepmerge } from '@mui/utils'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { getDesignTokens, getThemedComponents } from './styles/brandingTheme'

const basePath = process.env.BASE_PATH || '/'

const AppClient = () => {
  const darkMode =
    useLiveQuery((): Promise<boolean> => db.appState.get('darkMode')) ?? false

  const mode = darkMode ? 'dark' : 'light'
  const theme = useMemo(() => {
    const designTokens = getDesignTokens(mode)
    let newTheme = createTheme(designTokens)
    newTheme = deepmerge(newTheme, getThemedComponents(newTheme))
    return newTheme
  }, [mode])

  if (darkMode) {
    document.body.classList.add('bp4-dark')
  } else document.body.classList.remove('bp4-dark')

  return (
    <Router basename={basePath}>
      <ThemeProvider theme={theme}>
        <AppLayout>
          <RoutedContent />
        </AppLayout>
      </ThemeProvider>
    </Router>
  )
}
export default AppClient
