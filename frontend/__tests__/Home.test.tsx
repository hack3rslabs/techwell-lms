import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import Home from '../app/page'

import { vi } from 'vitest'

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

import { redirect } from 'next/navigation'

test('redirects to courses page', () => {
  render(<Home />)
  expect(redirect).toHaveBeenCalledWith('/courses')
})
