import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemActions } from '../../components/ItemActions';
import { createMockInventoryItem } from '../../test/utils/inventoryTestUtils';

describe('ItemActions', () => {
  const mockOnAction = jest.fn();

  beforeEach(() => {
    mockOnAction.mockClear();
  });

  test('renders Use button for general items', () => {
    const item = createMockInventoryItem({ category: 'general' });
    render(<ItemActions item={item} onAction={mockOnAction} />);
    expect(screen.getByRole('button', { name: /Use/i })).toBeInTheDocument();
  });

  test('renders Use button for consumable items', () => {
    const item = createMockInventoryItem({ category: 'consumable' });
    render(<ItemActions item={item} onAction={mockOnAction} />);
    expect(screen.getByRole('button', { name: /Use/i })).toBeInTheDocument();
  });

    test('renders Use button for medical items', () => {
    const item = createMockInventoryItem({ category: 'medical' });
    render(<ItemActions item={item} onAction={mockOnAction} />);
    expect(screen.getByRole('button', { name: /Use/i })).toBeInTheDocument();
  });

  test('renders Equip and Use buttons for unequipped weapons', () => {
    const item = createMockInventoryItem({ category: 'weapon', isEquipped: false });
    render(<ItemActions item={item} onAction={mockOnAction} />);
    expect(screen.getByRole('button', { name: /Equip/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use/i })).toBeInTheDocument();
  });

  test('renders Unequip and Use buttons for equipped weapons', () => {
    const item = createMockInventoryItem({ category: 'weapon', isEquipped: true });
    render(<ItemActions item={item} onAction={mockOnAction} />);
    expect(screen.getByRole('button', { name: /Unequip/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use/i })).toBeInTheDocument();
  });

  test('calls onAction with correct arguments for Use button', () => {
    const item = createMockInventoryItem({ id: 'test-item' });
    render(<ItemActions item={item} onAction={mockOnAction} />);
    fireEvent.click(screen.getByRole('button', { name: /Use/i }));
    expect(mockOnAction).toHaveBeenCalledWith('test-item', 'use');
  });

  test('calls onAction with correct arguments for Equip button', () => {
    const item = createMockInventoryItem({ id: 'test-weapon', category: 'weapon' });
    render(<ItemActions item={item} onAction={mockOnAction} />);
    fireEvent.click(screen.getByRole('button', { name: /Equip/i }));
    expect(mockOnAction).toHaveBeenCalledWith('test-weapon', 'equip');
  });

  test('calls onAction with correct arguments for Unequip button', () => {
    const item = createMockInventoryItem({ id: 'test-weapon', category: 'weapon', isEquipped: true });
    render(<ItemActions item={item} onAction={mockOnAction} />);
    fireEvent.click(screen.getByRole('button', { name: /Unequip/i }));
    expect(mockOnAction).toHaveBeenCalledWith('test-weapon', 'unequip');
  });
});
