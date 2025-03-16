// components/Common/ErrorBoundary.tsx
import React from "react";
import { ErrorBoundaryProps, ErrorBoundaryState } from "../../types/debug.types";

/**
 * Error boundary component that catches JavaScript errors and displays
 * a fallback UI instead of crashing the entire application.
 * 
 * Usage: 
 * Basic: <ErrorBoundary>{children}</ErrorBoundary>
 * With custom fallback: <ErrorBoundary fallback={<CustomErrorComponent />}>{children}</ErrorBoundary>
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: undefined
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default error message
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div className="p-4 border border-red-500 rounded bg-red-50 text-red-700">
          <h3 className="font-bold mb-2">Something went wrong</h3>
          <p className="text-sm">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
        </div>
      );
    }
    
    // Normal rendering when no errors
    return this.props.children;
  }
}

export default ErrorBoundary;
