import React, { useCallback, useRef, useState } from 'react';
import { ToastContext } from './ToastContext';

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const nextId = useRef(0);
    const showToast = useCallback((message, type = 'success') => {
        const id = ++nextId.current;
        setToasts((items) => [...items, { id, message, type }]);
        window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 4500);
    }, []);

    return <ToastContext.Provider value={showToast}>
        {children}
        <div className="fixed right-4 top-24 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" aria-live="polite" aria-atomic="false">
            {toasts.map((toast) => <div key={toast.id} role={toast.type === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${toast.type === 'error' ? 'border-rose-800 bg-rose-950/95 text-rose-100' : 'border-emerald-800 bg-emerald-950/95 text-emerald-100'}`}>{toast.message}</div>)}
        </div>
    </ToastContext.Provider>;
};

export default ToastProvider;
