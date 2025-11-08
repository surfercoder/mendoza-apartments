import { render } from '@testing-library/react'
import { MapCenterController } from '@/components/map-center-controller'

// Mock react-leaflet
const mockSetView = jest.fn()
const mockMap = {
  setView: mockSetView
}

jest.mock('react-leaflet', () => ({
  useMap: jest.fn(() => mockMap)
}))

describe('MapCenterController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should center map on mount', () => {
    render(
      <MapCenterController latitude={-32.8894587} longitude={-68.8458386} zoom={15} />
    )

    expect(mockSetView).toHaveBeenCalledWith(
      [-32.8894587, -68.8458386],
      15,
      { animate: true }
    )
  })

  it('should use default zoom when not provided', () => {
    render(
      <MapCenterController latitude={40.7128} longitude={-74.0060} />
    )

    expect(mockSetView).toHaveBeenCalledWith(
      [40.7128, -74.0060],
      15,
      { animate: true }
    )
  })

  it('should update map center when coordinates change', () => {
    const { rerender } = render(
      <MapCenterController latitude={-32.8894587} longitude={-68.8458386} zoom={15} />
    )

    expect(mockSetView).toHaveBeenCalledWith(
      [-32.8894587, -68.8458386],
      15,
      { animate: true }
    )

    mockSetView.mockClear()

    rerender(
      <MapCenterController latitude={40.7128} longitude={-74.0060} zoom={16} />
    )

    expect(mockSetView).toHaveBeenCalledWith(
      [40.7128, -74.0060],
      16,
      { animate: true }
    )
  })

  it('should update map when zoom changes', () => {
    const { rerender } = render(
      <MapCenterController latitude={-32.8894587} longitude={-68.8458386} zoom={15} />
    )

    mockSetView.mockClear()

    rerender(
      <MapCenterController latitude={-32.8894587} longitude={-68.8458386} zoom={18} />
    )

    expect(mockSetView).toHaveBeenCalledWith(
      [-32.8894587, -68.8458386],
      18,
      { animate: true }
    )
  })

  it('should render null (nothing visible)', () => {
    const { container } = render(
      <MapCenterController latitude={-32.8894587} longitude={-68.8458386} zoom={15} />
    )

    expect(container.firstChild).toBeNull()
  })
})
