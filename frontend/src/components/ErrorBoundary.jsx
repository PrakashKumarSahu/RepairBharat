import { Component } from 'react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('RepairBharat Error Boundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
                    <span className="material-symbols-outlined text-[64px] text-error mb-4">error</span>
                    <h1 className="text-2xl font-bold text-on-surface mb-2">Something went wrong</h1>
                    <p className="text-sm text-on-surface-variant mb-6 max-w-md">
                        An unexpected error occurred. Please refresh the page. If the problem persists, contact support.
                    </p>
                    <p className="text-xs font-mono text-outline bg-surface-variant px-3 py-2 rounded-lg mb-6 max-w-lg truncate">
                        {this.state.error?.message || 'Unknown error'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="h-11 px-8 bg-primary text-on-primary rounded-lg font-bold text-sm shadow"
                    >
                        Refresh Page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
