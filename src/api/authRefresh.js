import axios from 'axios';

const API_BASE_URL = '/api/v1';
const REFRESH_URL = `${API_BASE_URL}/auth/refresh-token`;
let refreshPromise = null;

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const request = error.config;
        const requestUrl = request?.url || '';
        const isAuthEntryPoint = /\/auth\/(login|register\/student|register\/company|refresh-token)(?:$|\?)/.test(requestUrl);

        if (error.response?.status !== 401 || !request || request._retriedAfterRefresh || isAuthEntryPoint) {
            return Promise.reject(error);
        }

        request._retriedAfterRefresh = true;

        try {
            if (!refreshPromise) {
                refreshPromise = axios.post(REFRESH_URL, {}, { withCredentials: true })
                    .finally(() => { refreshPromise = null; });
            }

            await refreshPromise;
            return axios(request);
        } catch (refreshError) {
            if (refreshError.response?.status === 401 && typeof window !== 'undefined') {
                window.dispatchEvent(new Event('placxia:session-expired'));
            }
            return Promise.reject(refreshError);
        }
    }
);
