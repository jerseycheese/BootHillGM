/**
 * State Adapters Tests
 * 
 * Tests the adapter functions that provide backward compatibility
 * between the new slice-based architecture and the legacy state shape.
 * 
 * This file serves as the entry point for all state adapter tests.
 * Each adapter has its own dedicated test file to improve maintainability.
 * 
 * @file Main entry point for state adapter tests
 * @module stateAdapters.test
 */

// Import all test modules
import './stateAdapters/migrationAdapter.test';
import './stateAdapters/inventoryAdapter.test';
import './stateAdapters/journalAdapter.test';
import './stateAdapters/combatAdapter.test';
import './stateAdapters/narrativeAdapter.test';
import './stateAdapters/adaptStateForTests.test';

// No tests defined directly in this file, as they've been split
// into individual modules for better maintainability.
