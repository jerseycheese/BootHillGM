/**
 * Tests for NarrativeContent component
 * Focus on checking that STORY_POINT metadata is filtered out
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NarrativeContent } from '../../components/NarrativeContent';
import { NarrativeItem } from '../../components/NarrativeDisplay';

describe('NarrativeContent', () => {
  const processedUpdates = new Set<string>();
  
  test('renders narrative content correctly', () => {
    const item: NarrativeItem = {
      type: 'narrative',
      content: 'This is narrative text',
    };
    
    render(<NarrativeContent item={item} processedUpdates={processedUpdates} />);
    expect(screen.getByText('This is narrative text')).toBeInTheDocument();
  });
  
  test('renders player action correctly', () => {
    const item: NarrativeItem = {
      type: 'player-action',
      content: 'Player did something',
    };
    
    render(<NarrativeContent item={item} processedUpdates={processedUpdates} />);
    expect(screen.getByText('Player did something')).toBeInTheDocument();
  });
  
  test('filters out STORY_POINT JSON blocks', () => {
    // Test with STORY_POINT: { line
    const item1: NarrativeItem = {
      type: 'narrative',
      content: 'STORY_POINT: {',
    };
    
    const { container: container1 } = render(
      <NarrativeContent item={item1} processedUpdates={processedUpdates} />
    );
    expect(container1.firstChild).toBeNull();
    
    // Test with "title": line
    const item2: NarrativeItem = {
      type: 'narrative',
      content: '"title": "The Fate of Boot Hill",',
    };
    
    const { container: container2 } = render(
      <NarrativeContent item={item2} processedUpdates={processedUpdates} />
    );
    expect(container2.firstChild).toBeNull();
    
    // Test with "description": line
    const item3: NarrativeItem = {
      type: 'narrative',
      content: '"description": "The old man reveals the history of Boot Hill",',
    };
    
    const { container: container3 } = render(
      <NarrativeContent item={item3} processedUpdates={processedUpdates} />
    );
    expect(container3.firstChild).toBeNull();
    
    // Test with "significance": line
    const item4: NarrativeItem = {
      type: 'narrative',
      content: '"significance": "minor",',
    };
    
    const { container: container4 } = render(
      <NarrativeContent item={item4} processedUpdates={processedUpdates} />
    );
    expect(container4.firstChild).toBeNull();
    
    // Test with closing brace
    const item5: NarrativeItem = {
      type: 'narrative',
      content: '}',
    };
    
    const { container: container5 } = render(
      <NarrativeContent item={item5} processedUpdates={processedUpdates} />
    );
    expect(container5.firstChild).toBeNull();
  });
  
  test('renders normal narrative around STORY_POINT blocks', () => {
    // This should show
    const normalItem: NarrativeItem = {
      type: 'narrative',
      content: 'Normal narrative text',
    };
    
    render(<NarrativeContent item={normalItem} processedUpdates={processedUpdates} />);
    expect(screen.getByText('Normal narrative text')).toBeInTheDocument();
  });
  
  test('marks story points when isKeyStoryPoint is true', () => {
    const item: NarrativeItem = {
      type: 'narrative',
      content: 'This is a key story point',
    };
    
    render(<NarrativeContent 
      item={item} 
      processedUpdates={processedUpdates} 
      isKeyStoryPoint={true} 
    />);
    
    expect(screen.getByText('This is a key story point')).toBeInTheDocument();
    expect(screen.getByText('📌 Key Story Point')).toBeInTheDocument();
  });
});
