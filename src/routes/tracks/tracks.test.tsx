import { render, screen } from '../../test-setup'
import '@testing-library/jest-dom/extend-expect'
import { Tracks } from './tracks'

test('Dropzone is visible', () => {
  render(<Tracks />)
  // const logo = screen.getByRole('img', { name: 'DJ Set Editor Logo' })

  // expect(logo).toHaveAttribute('src', '/assets/soundwave-640x450px.jpg')
  // expect(logo).toHaveAttribute('alt', 'DJ Set Editor Logo')
})
