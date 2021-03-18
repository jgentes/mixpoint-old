import { render, fireEvent, waitFor, screen } from 'test-utils'
import '@testing-library/jest-dom/extend-expect'
import { TopNavbar } from './topnavbar'

render(<TopNavbar />)

test('Logo must have proper src and alt text', () => {
  const logo = document.getElementById('headerLogo')

  expect(logo).toHaveAttribute('src', '/assets/soundwave-640x450px.jpg')
  expect(logo).toHaveAttribute('alt', 'DJ Set Editor Logo')
})
