import React from 'react';

class AppErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
                    <div className="max-w-md text-center">
                        <h1 className="text-3xl font-semibold">This page ran into a problem</h1>
                        <p className="mt-3 text-sm text-zinc-400">Refresh the page to try again. Your account data is still safe.</p>
                        <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-full bg-white px-6 py-3 font-medium text-black">Refresh page</button>
                    </div>
                </main>
            );
        }
        return this.props.children;
    }
}

export default AppErrorBoundary;
