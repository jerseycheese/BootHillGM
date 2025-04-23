import React from 'react';
import { render, screen } from '@testing-library/react';
import { InventoryList } from '../../components/InventoryList';
import { createMockInventoryItem } from '../../test/utils/inventoryTestUtils';

describe('InventoryList', () => {
  const mockOnItemAction = jest.fn();
  const mockIsUsingItem = jest.fn(); // Mock function for isUsingItem

  test('renders inventory items', () => {
    const items = [
      createMockInventoryItem({ id: '1', name: 'Health Potion', quantity: 2 }),
      createMockInventoryItem({ id: '2', name: 'Rope', quantity: 1 }),
    ];
    render(<InventoryList items={items} onItemAction={mockOnItemAction} isUsingItem={mockIsUsingItem} isLoading={false} />);

    // Use a regex pattern to find the text that contains 'Health Potion'
    expect(screen.getByText(/Health Potion/)).toBeInTheDocument();
    
    // Find the "2" for the quantity
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check for Rope item as well
    expect(screen.getByText(/Rope/)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('displays empty inventory message when no items', () => {
    render(<InventoryList items={[]} onItemAction={mockOnItemAction} isUsingItem={mockIsUsingItem} isLoading={false} />);
    expect(screen.getByText('Your inventory is empty.')).toBeInTheDocument();
  });

  test('does not render items with quantity 0', () => {
    const items = [
      createMockInventoryItem({ id: '1', name: 'Health Potion', quantity: 2 }),
      createMockInventoryItem({ id: '2', name: 'Empty Bottle', quantity: 0 }),
    ];
    render(<InventoryList items={items} onItemAction={mockOnItemAction} isUsingItem={mockIsUsingItem} isLoading={false} />);
    
    expect(screen.getByText(/Health Potion/)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Check that Empty Bottle is not rendered
    expect(screen.queryByText(/Empty Bottle/)).not.toBeInTheDocument();
  });
});