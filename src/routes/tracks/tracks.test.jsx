import { render, screen } from '../../test-setup'
import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { Tracks } from './tracks'

test('Dropzone is visible', () => {
  render(<Tracks />)
  const logo = screen.getByRole('img', { name: 'DJ Set Editor Logo' })

  expect(logo).toHaveAttribute('src', '/assets/soundwave-640x450px.jpg')
  expect(logo).toHaveAttribute('alt', 'DJ Set Editor Logo')
})

test('Site title must appear in header', () => {
  render(<Tracks />)
  const headerText = screen.getByRole('heading', { name: 'site title' })

  // match whole content
  expect(headerText).toHaveTextContent(/^DJ Set Editor$/)
})

test('Nav links must exist', () => {
  render(<Tracks />)

  const tracks = screen.getByRole('link', { name: 'Tracks' })
  const mixes = screen.getByRole('link', { name: 'Mixes' })
  const sets = screen.getByRole('link', { name: 'Sets' })

  expect(tracks).toHaveAttribute('href', '/tracks')
  expect(tracks).toHaveClass('nav-link')

  expect(mixes).toHaveAttribute('href', '/mixes')
  expect(mixes).toHaveClass('nav-link')

  expect(sets).toHaveAttribute('href', '/sets')
  expect(sets).toHaveClass('nav-link')
})
