import React from 'react';
import { render, screen } from '@testing-library/react';
import { InventoryList } from '../InventoryList';
import { createMockInventoryItem } from '../../test/utils/inventoryTestUtils';

describe('InventoryList', () => {
  const mockOnItemAction = jest.fn();

  test('renders inventory items', () => {
    const items = [
      createMockInventoryItem({ id: '1', name: 'Health Potion', quantity: 2 }),
      createMockInventoryItem({ id: '2', name: 'Rope', quantity: 1 }),
    ];
    render(<InventoryList items={items} onItemAction={mockOnItemAction} />);

    expect(screen.getByText(/Health Potion \(x2\)/)).toBeInTheDocument();
    expect(screen.getByText(/Rope \(x1\)/)).toBeInTheDocument();
  });

  test('displays empty inventory message when no items', () => {
    render(<InventoryList items={[]} onItemAction={mockOnItemAction} />);
    expect(screen.getByText('Your inventory is empty.')).toBeInTheDocument();
  });

    test('does not render items with quantity 0', () => {
        const items = [
            createMockInventoryItem({ id: '1', name: 'Health Potion', quantity: 2 }),
            createMockInventoryItem({ id: '2', name: 'Empty Bottle', quantity: 0 }),
        ];
        render(<InventoryList items={items} onItemAction={mockOnItemAction} />);
        expect(screen.getByText(/Health Potion \(x2\)/)).toBeInTheDocument();
        expect(screen.queryByText(/Empty Bottle/)).not.toBeInTheDocument();
    });
});
