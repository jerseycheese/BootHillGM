// components/Common/ErrorBoundary.tsx
import React from "react";
import { ErrorBoundaryProps, ErrorBoundaryState } from "../../types/debug.types";

/**
 * Error boundary component that catches JavaScript errors and displays
 * a fallback UI instead of crashing the entire application.
 * 
 * Usage: <ErrorBoundary>{children}</ErrorBoundary>
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return <p className="text-red-500">Error displaying content.</p>;
    }
    
    // Normal rendering when no errors
    return this.props.children;
  }
}

export default ErrorBoundary;