import { render, screen } from '@testing-library/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'

describe('Table Components', () => {
  describe('Table', () => {
    it('renders table with default classes', () => {
      render(
        <Table data-testid="table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      )

      const tableContainer = screen.getByTestId('table').parentElement
      expect(tableContainer).toHaveClass('relative', 'w-full', 'overflow-auto')

      const table = screen.getByTestId('table')
      expect(table).toHaveClass('w-full', 'caption-bottom', 'text-sm')
    })

    it('applies custom className', () => {
      render(
        <Table className="custom-class" data-testid="table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      )

      const table = screen.getByTestId('table')
      expect(table).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(
        <Table ref={ref} data-testid="table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      )

      expect(ref.current).toBe(screen.getByTestId('table'))
    })

    it('passes through additional props', () => {
      render(
        <Table id="test-table" data-testid="table">
          <tbody>
            <tr>
              <td>Test content</td>
            </tr>
          </tbody>
        </Table>
      )

      const table = screen.getByTestId('table')
      expect(table).toHaveAttribute('id', 'test-table')
    })
  })

  describe('TableHeader', () => {
    it('renders thead with default classes', () => {
      render(
        <table>
          <TableHeader data-testid="table-header">
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </table>
      )

      const thead = screen.getByTestId('table-header')
      expect(thead.tagName).toBe('THEAD')
      expect(thead).toHaveClass('[&_tr]:border-b')
    })

    it('applies custom className', () => {
      render(
        <table>
          <TableHeader className="custom-header" data-testid="table-header">
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </table>
      )

      const thead = screen.getByTestId('table-header')
      expect(thead).toHaveClass('custom-header')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(
        <table>
          <TableHeader ref={ref} data-testid="table-header">
            <tr>
              <th>Header</th>
            </tr>
          </TableHeader>
        </table>
      )

      expect(ref.current).toBe(screen.getByTestId('table-header'))
    })
  })

  describe('TableBody', () => {
    it('renders tbody with default classes', () => {
      render(
        <table>
          <TableBody data-testid="table-body">
            <tr>
              <td>Body content</td>
            </tr>
          </TableBody>
        </table>
      )

      const tbody = screen.getByTestId('table-body')
      expect(tbody.tagName).toBe('TBODY')
      expect(tbody).toHaveClass('[&_tr:last-child]:border-0')
    })

    it('applies custom className', () => {
      render(
        <table>
          <TableBody className="custom-body" data-testid="table-body">
            <tr>
              <td>Body content</td>
            </tr>
          </TableBody>
        </table>
      )

      const tbody = screen.getByTestId('table-body')
      expect(tbody).toHaveClass('custom-body')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(
        <table>
          <TableBody ref={ref} data-testid="table-body">
            <tr>
              <td>Body content</td>
            </tr>
          </TableBody>
        </table>
      )

      expect(ref.current).toBe(screen.getByTestId('table-body'))
    })
  })

  describe('TableFooter', () => {
    it('renders tfoot with default classes', () => {
      render(
        <table>
          <TableFooter data-testid="table-footer">
            <tr>
              <td>Footer content</td>
            </tr>
          </TableFooter>
        </table>
      )

      const tfoot = screen.getByTestId('table-footer')
      expect(tfoot.tagName).toBe('TFOOT')
      expect(tfoot).toHaveClass('border-t', 'bg-muted/50', 'font-medium', '[&>tr]:last:border-b-0')
    })

    it('applies custom className', () => {
      render(
        <table>
          <TableFooter className="custom-footer" data-testid="table-footer">
            <tr>
              <td>Footer content</td>
            </tr>
          </TableFooter>
        </table>
      )

      const tfoot = screen.getByTestId('table-footer')
      expect(tfoot).toHaveClass('custom-footer')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(
        <table>
          <TableFooter ref={ref} data-testid="table-footer">
            <tr>
              <td>Footer content</td>
            </tr>
          </TableFooter>
        </table>
      )

      expect(ref.current).toBe(screen.getByTestId('table-footer'))
    })
  })

  describe('TableRow', () => {
    it('renders tr with default classes', () => {
      render(
        <table>
          <tbody>
            <TableRow data-testid="table-row">
              <td>Row content</td>
            </TableRow>
          </tbody>
        </table>
      )

      const tr = screen.getByTestId('table-row')
      expect(tr.tagName).toBe('TR')
      expect(tr).toHaveClass(
        'border-b',
        'transition-colors',
        'hover:bg-muted/50',
        'data-[state=selected]:bg-muted'
      )
    })

    it('applies custom className', () => {
      render(
        <table>
          <tbody>
            <TableRow className="custom-row" data-testid="table-row">
              <td>Row content</td>
            </TableRow>
          </tbody>
        </table>
      )

      const tr = screen.getByTestId('table-row')
      expect(tr).toHaveClass('custom-row')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(
        <table>
          <tbody>
            <TableRow ref={ref} data-testid="table-row">
              <td>Row content</td>
            </TableRow>
          </tbody>
        </table>
      )

      expect(ref.current).toBe(screen.getByTestId('table-row'))
    })

    it('handles state attributes', () => {
      render(
        <table>
          <tbody>
            <TableRow data-state="selected" data-testid="table-row">
              <td>Row content</td>
            </TableRow>
          </tbody>
        </table>
      )

      const tr = screen.getByTestId('table-row')
      expect(tr).toHaveAttribute('data-state', 'selected')
    })
  })

  describe('TableHead', () => {
    it('renders th with default classes', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead data-testid="table-head">Header Cell</TableHead>
            </tr>
          </thead>
        </table>
      )

      const th = screen.getByTestId('table-head')
      expect(th.tagName).toBe('TH')
      expect(th).toHaveClass(
        'h-12',
        'px-4',
        'text-left',
        'align-middle',
        'font-medium',
        'text-muted-foreground',
        '[&:has([role=checkbox])]:pr-0'
      )
    })

    it('applies custom className', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead className="custom-head" data-testid="table-head">
                Header Cell
              </TableHead>
            </tr>
          </thead>
        </table>
      )

      const th = screen.getByTestId('table-head')
      expect(th).toHaveClass('custom-head')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(
        <table>
          <thead>
            <tr>
              <TableHead ref={ref} data-testid="table-head">
                Header Cell
              </TableHead>
            </tr>
          </thead>
        </table>
      )

      expect(ref.current).toBe(screen.getByTestId('table-head'))
    })

    it('handles th-specific props', () => {
      render(
        <table>
          <thead>
            <tr>
              <TableHead scope="col" data-testid="table-head">
                Header Cell
              </TableHead>
            </tr>
          </thead>
        </table>
      )

      const th = screen.getByTestId('table-head')
      expect(th).toHaveAttribute('scope', 'col')
    })
  })

  describe('TableCell', () => {
    it('renders td with default classes', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell data-testid="table-cell">Cell content</TableCell>
            </tr>
          </tbody>
        </table>
      )

      const td = screen.getByTestId('table-cell')
      expect(td.tagName).toBe('TD')
      expect(td).toHaveClass('p-4', 'align-middle', '[&:has([role=checkbox])]:pr-0')
    })

    it('applies custom className', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell className="custom-cell" data-testid="table-cell">
                Cell content
              </TableCell>
            </tr>
          </tbody>
        </table>
      )

      const td = screen.getByTestId('table-cell')
      expect(td).toHaveClass('custom-cell')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(
        <table>
          <tbody>
            <tr>
              <TableCell ref={ref} data-testid="table-cell">
                Cell content
              </TableCell>
            </tr>
          </tbody>
        </table>
      )

      expect(ref.current).toBe(screen.getByTestId('table-cell'))
    })

    it('handles td-specific props', () => {
      render(
        <table>
          <tbody>
            <tr>
              <TableCell colSpan={2} data-testid="table-cell">
                Cell content
              </TableCell>
            </tr>
          </tbody>
        </table>
      )

      const td = screen.getByTestId('table-cell')
      expect(td).toHaveAttribute('colSpan', '2')
    })
  })

  describe('TableCaption', () => {
    it('renders caption with default classes', () => {
      render(
        <table>
          <TableCaption data-testid="table-caption">Table Caption</TableCaption>
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </table>
      )

      const caption = screen.getByTestId('table-caption')
      expect(caption.tagName).toBe('CAPTION')
      expect(caption).toHaveClass('mt-4', 'text-sm', 'text-muted-foreground')
    })

    it('applies custom className', () => {
      render(
        <table>
          <TableCaption className="custom-caption" data-testid="table-caption">
            Table Caption
          </TableCaption>
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </table>
      )

      const caption = screen.getByTestId('table-caption')
      expect(caption).toHaveClass('custom-caption')
    })

    it('forwards ref correctly', () => {
      const ref = { current: null }
      render(
        <table>
          <TableCaption ref={ref} data-testid="table-caption">
            Table Caption
          </TableCaption>
          <tbody>
            <tr>
              <td>Content</td>
            </tr>
          </tbody>
        </table>
      )

      expect(ref.current).toBe(screen.getByTestId('table-caption'))
    })
  })

  describe('Complete Table Structure', () => {
    it('renders a complete table with all components', () => {
      render(
        <Table data-testid="complete-table">
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">INV001</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Credit Card</TableCell>
              <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">INV002</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell>PayPal</TableCell>
              <TableCell className="text-right">$150.00</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">$400.00</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )

      expect(screen.getByText('A list of your recent invoices.')).toBeInTheDocument()
      expect(screen.getByText('Invoice')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
      expect(screen.getByText('Method')).toBeInTheDocument()
      expect(screen.getByText('Amount')).toBeInTheDocument()
      expect(screen.getByText('INV001')).toBeInTheDocument()
      expect(screen.getByText('INV002')).toBeInTheDocument()
      expect(screen.getByText('Paid')).toBeInTheDocument()
      expect(screen.getByText('Pending')).toBeInTheDocument()
      expect(screen.getByText('Credit Card')).toBeInTheDocument()
      expect(screen.getByText('PayPal')).toBeInTheDocument()
      expect(screen.getByText('$250.00')).toBeInTheDocument()
      expect(screen.getByText('$150.00')).toBeInTheDocument()
      expect(screen.getByText('Total')).toBeInTheDocument()
      expect(screen.getByText('$400.00')).toBeInTheDocument()
    })
  })
});