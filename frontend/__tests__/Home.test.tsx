import { render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Home from '../app/page'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

vi.mock('@/components/sections/Testimonials', () => ({
  Testimonials: () => <div data-testid="testimonials">Testimonials</div>
}))

vi.mock('@/components/sections/PlacementPartners', () => ({
  PlacementPartners: () => <div data-testid="placement-partners">Partners</div>
}))

test('renders Home page correctly', () => {
  render(<Home />)
  expect(screen.getByText('Our Expertise')).toBeTruthy()
})
