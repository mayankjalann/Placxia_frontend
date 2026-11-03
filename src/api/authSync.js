const CHANNEL_NAME = 'placxia-auth';

export const setActiveAuthRole = (role) => {
    if (!role || typeof window === 'undefined') return;
    window.sessionStorage.setItem('placxia:auth-role', role);
    window.localStorage.setItem('placxia:auth-role', role);
};

export const announceLogin = (role) => {
    setActiveAuthRole(role);
    if (typeof window === 'undefined') return;
    const message = { type: 'login', role };
    window.localStorage.setItem('placxia:auth-event', JSON.stringify({ ...message, at: Date.now() }));
    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage(message);
        channel.close();
    }
};

export const announceLogout = (role) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem('placxia:auth-role');
    if (window.localStorage.getItem('placxia:auth-role') === role) {
        window.localStorage.removeItem('placxia:auth-role');
    }
    window.localStorage.setItem('placxia:logout-event', JSON.stringify({ role, at: Date.now() }));
    window.localStorage.removeItem('placxia:logout-event');
    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({ type: 'logout', role });
        channel.close();
    }
    window.dispatchEvent(new CustomEvent('placxia:logout', { detail: { role } }));
};

if (typeof window !== 'undefined') {
    const applyRemoteAuthEvent = (message) => {
        if (!['logout', 'login'].includes(message?.type) || !message?.role) return;
        const currentRole = window.sessionStorage.getItem('placxia:auth-role');
        if (currentRole && currentRole !== message.role) return;
        if (message.type === 'login') {
            window.sessionStorage.setItem('placxia:auth-role', message.role);
            window.dispatchEvent(new CustomEvent('placxia:login', { detail: { role: message.role } }));
        } else {
            window.sessionStorage.removeItem('placxia:auth-role');
            window.dispatchEvent(new CustomEvent('placxia:logout', { detail: { role: message.role } }));
        }
    };
    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.addEventListener('message', (event) => applyRemoteAuthEvent(event.data));
    }
    window.addEventListener('storage', (event) => {
        if (event.key !== 'placxia:logout-event' && event.key !== 'placxia:auth-event') return;
        if (!event.newValue) return;
        try {
            const message = JSON.parse(event.newValue);
            applyRemoteAuthEvent({ ...message, type: message.type || 'logout' });
        } catch { /* ignore malformed storage events */ }
    });
}
