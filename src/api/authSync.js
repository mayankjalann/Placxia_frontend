const CHANNEL_NAME = 'placxia-auth';

export const setActiveAuthRole = (role) => {
    if (!role || typeof window === 'undefined') return;
    window.sessionStorage.setItem('placxia:auth-role', role);
    // Remove the old shared hint. The active role belongs to this tab only.
    window.localStorage.removeItem('placxia:auth-role');
};

export const announceLogin = (role) => {
    setActiveAuthRole(role);
};

export const announceLogout = (role) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem('placxia:auth-role');
    window.localStorage.removeItem('placxia:auth-role');
    window.localStorage.setItem('placxia:logout-event', JSON.stringify({ role, at: Date.now() }));
    window.localStorage.removeItem('placxia:logout-event');
    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.postMessage({ type: 'logout', role });
        channel.close();
    }
    window.dispatchEvent(new CustomEvent('placxia:logout', { detail: { role, local: true } }));
};

if (typeof window !== 'undefined') {
    const applyRemoteLogout = (message) => {
        if (message?.type !== 'logout' || !message?.role) return;
        const currentRole = window.sessionStorage.getItem('placxia:auth-role');
        if (currentRole !== message.role) return;
        window.dispatchEvent(new CustomEvent('placxia:logout', { detail: { role: message.role, local: false } }));
    };
    if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(CHANNEL_NAME);
        channel.addEventListener('message', (event) => applyRemoteLogout(event.data));
    }
    window.addEventListener('storage', (event) => {
        if (event.key !== 'placxia:logout-event') return;
        if (!event.newValue) return;
        try {
            const message = JSON.parse(event.newValue);
            applyRemoteLogout({ ...message, type: 'logout' });
        } catch { /* ignore malformed storage events */ }
    });
}
