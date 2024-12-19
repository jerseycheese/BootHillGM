// Mock next/navigation
const createMockRouter = () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
    query: {},
  };
  return mockRouter;
};

// Create a singleton instance of the router
const mockRouter = createMockRouter();

const mockNavigation = {
  useRouter: () => mockRouter,
  // Add other exports that Next.js navigation provides
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
};

export default mockNavigation;
