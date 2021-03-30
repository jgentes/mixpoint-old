import { render, screen, waitFor } from '../../test-setup'
import '@testing-library/jest-dom/extend-expect'
import { Tracks } from './tracks'

test('Dropzone is visible', () => {
  const getTracksMock = jest.fn(() => Promise.resolve())
  render(<Tracks getTracksMock={getTracksMock} />)
  const dropzone = waitFor(() => screen.getByText(/Drag a file here/))

  expect(dropzone).toBeVisible
})
