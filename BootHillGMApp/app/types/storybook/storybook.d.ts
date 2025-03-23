// This type definition file helps TypeScript understand Storybook's structure
// without causing import conflicts.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare module '@storybook/react' {
  // Using more specific types where possible, and explicit ESLint disable where necessary
  export interface Story {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (args: Record<string, unknown>): JSX.Element;
    args?: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decorators?: Array<(Story: unknown) => JSX.Element>;
    parameters?: Record<string, unknown>;
  }
  
  // Define a component metadata interface
  export interface ComponentMeta {
    title: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: React.ComponentType<unknown>;
    parameters?: Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decorators?: Array<(Story: unknown) => JSX.Element>;
    argTypes?: Record<string, unknown>;
    args?: Record<string, unknown>;
    tags?: string[];
  }
}
