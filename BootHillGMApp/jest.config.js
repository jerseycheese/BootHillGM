import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '\\.d\\.ts$',
    '<rootDir>/app/__tests__/hooks/useCombatManager.test.ts',
    '<rootDir>/app/__tests__/hooks/useLocation.test.ts',
    '<rootDir>/app/__tests__/services/ai/__mocks__/.*',
    '<rootDir>/app/__tests__/services/ai/helpers/.*',
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/*.config.js',
    '!<rootDir>/coverage/**',
  ],
  // Add watchPlugins configuration for better watch mode experience
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  // Snapshot settings
  snapshotFormat: {
    printBasicPrototype: false,
  },
  // Increase timeout for complex tests that may take longer
  testTimeout: 10000,
  // Prevent tests from running in parallel to avoid memory issues
  maxWorkers: '50%',
  // Add transform config to fix JSX in TypeScript tests
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  }
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)
