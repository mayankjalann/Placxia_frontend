import { lazy } from 'react';

const RETRY_KEY = 'placxia:chunk-load-retry';

export const lazyWithRecovery = (importModule) => lazy(() => importModule()
    .then((module) => {
        try { window.sessionStorage.removeItem(RETRY_KEY); } catch { /* storage may be unavailable */ }
        return module;
    })
    .catch((error) => {
        try {
            if (!window.sessionStorage.getItem(RETRY_KEY)) {
                window.sessionStorage.setItem(RETRY_KEY, '1');
                window.location.reload();
            }
        } catch { /* fall through to the route error screen */ }
        throw error;
    }));
