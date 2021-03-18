import { render, fireEvent, waitFor, screen } from 'test-utils'
import '@testing-library/jest-dom/extend-expect'
import { Mixes } from './mixes'

render(<Mixes />)

fireEvent.click(screen.getBy)
