import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Uncaught error:", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-100 flex items-center justify-center shadow-sm">
              <AlertTriangle size={36} className="text-rose-500" />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Something went wrong
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              The app ran into an unexpected error. This has been noted.
              Try refreshing the page — it usually fixes it.
            </p>
          </div>

          {/* Error detail (dev only) */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="text-left bg-slate-900 rounded-xl px-4 py-3 overflow-auto max-h-36">
              <p className="text-[11px] font-mono text-rose-400 break-words leading-relaxed">
                {this.state.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleGoHome}
              className="btn-secondary flex items-center gap-2"
            >
              <Home size={15} />
              Go to Dashboard
            </button>
            <button
              onClick={this.handleReload}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw size={15} />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
