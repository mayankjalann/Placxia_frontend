import axios from 'axios';

const API_BASE_URL = '/api/v1';
const REFRESH_URL = `${API_BASE_URL}/auth/refresh-token`;
let refreshPromise = null;
const refreshWithCrossTabLock = () => {
    const refresh = () => axios.post(REFRESH_URL, {}, { withCredentials: true }).then((response) => {
        const role = response.data?.data?.role;
        if (role && typeof window !== 'undefined') {
            window.sessionStorage.setItem('placxia:auth-role', role);
        }
        return response;
    });
    if (typeof navigator !== 'undefined' && navigator.locks?.request) {
        const role = typeof window !== 'undefined'
            ? (window.sessionStorage.getItem('placxia:auth-role') || 'unknown')
            : 'unknown';
        return navigator.locks.request(`placxia-refresh-${role}`, refresh);
    }
    return refresh();
};

axios.defaults.withCredentials = true;

axios.interceptors.request.use((request) => {
    if (typeof window !== 'undefined') {
        const role = window.sessionStorage.getItem('placxia:auth-role');
        if (role) request.headers['X-Auth-Role'] = role;
    }
    return request;
});

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const request = error.config;
        const requestUrl = request?.url || '';
        const isAuthEntryPoint = /\/auth\/(login|register\/student|register\/company|refresh-token)(?:$|\?)/.test(requestUrl);

        const isDisabled = error.response?.status === 403 && error.response?.data?.message === 'Account is disabled. Contact admin';
        if ((error.response?.status !== 401 && !isDisabled) || !request || request._retriedAfterRefresh || isAuthEntryPoint) {
            if (isDisabled && typeof window !== 'undefined') window.dispatchEvent(new Event('placxia:session-expired'));
            return Promise.reject(error);
        }

        request._retriedAfterRefresh = true;

        try {
            if (!refreshPromise) {
                refreshPromise = refreshWithCrossTabLock()
                    .finally(() => { refreshPromise = null; });
            }

            await refreshPromise;
            return axios(request);
        } catch (refreshError) {
            if ([401, 403].includes(refreshError.response?.status) && typeof window !== 'undefined') {
                window.dispatchEvent(new Event('placxia:session-expired'));
            }
            return Promise.reject(refreshError);
        }
    }
);
