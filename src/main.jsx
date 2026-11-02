import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './api/authRefresh'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import AppRouter from './AppRouter.jsx'
import ToastProvider from './components/ToastProvider.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastProvider>
        <AppErrorBoundary>
          <Suspense fallback={<div className="min-h-screen bg-black p-10 text-white" role="status">Loading page…</div>}>
            <AppRouter />
          </Suspense>
        </AppErrorBoundary>
      </ToastProvider>
    </Provider>
  </React.StrictMode>,
)
