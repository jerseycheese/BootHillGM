import nextJest from 'next/jest.js' // Use import syntax

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1',
  },
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '\\.d\\.ts$', // Exclude all .d.ts files using standard regex
    '<rootDir>/app/__tests__/hooks/useCombatManager.test.ts',
    '<rootDir>/app/__tests__/hooks/useLocation.test.ts',
    '<rootDir>/app/__tests__/services/ai/__mocks__/.*', // Ignore files in AI service mocks directory
    '<rootDir>/app/__tests__/services/ai/helpers/.*', // Ignore files in AI service helpers directory
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
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig) // Use export default syntax
