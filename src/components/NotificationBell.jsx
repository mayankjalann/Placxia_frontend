import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotificationBell = ({ enabled }) => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const loadNotifications = useCallback(async () => {
        if (!enabled) return;
        try {
            const response = await axios.get('/api/v1/notifications/mine', { withCredentials: true });
            setNotifications(response.data.data.notifications);
            setUnreadCount(response.data.data.unreadCount);
            setError('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not load notifications.');
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled) return undefined;
        loadNotifications();
        const refreshIfVisible = () => { if (document.visibilityState === 'visible') loadNotifications(); };
        const timer = window.setInterval(refreshIfVisible, 30000);
        window.addEventListener('focus', refreshIfVisible);
        document.addEventListener('visibilitychange', refreshIfVisible);
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('focus', refreshIfVisible);
            document.removeEventListener('visibilitychange', refreshIfVisible);
        };
    }, [enabled, loadNotifications]);

    const markAllRead = async () => {
        try {
            await axios.patch('/api/v1/notifications/read-all', {}, { withCredentials: true });
            setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() })));
            setUnreadCount(0);
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Could not mark notifications as read.');
        }
    };

    const openNotification = async (item) => {
        if (!item.readAt) {
            try {
                await axios.patch(`/api/v1/notifications/${item._id}/read`, {}, { withCredentials: true });
                setNotifications((items) => items.map((entry) => entry._id === item._id ? { ...entry, readAt: new Date().toISOString() } : entry));
                setUnreadCount((count) => Math.max(0, count - 1));
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Could not update notification.');
            }
        }
        setOpen(false);
        navigate(item.link || '/dashboard');
    };

    if (!enabled) return null;

    return (
        <div className="relative">
            <button type="button" onClick={() => { setOpen((value) => !value); loadNotifications(); }} aria-label={`${unreadCount} unread notifications`} className="relative rounded-full border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white hover:bg-zinc-800">
                Notifications
                {unreadCount > 0 && <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </button>
            {open && (
                <div className="absolute right-0 top-14 z-[60] w-[min(24rem,90vw)] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <h2 className="font-semibold text-white">Notifications</h2>
                        {unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-xs text-zinc-400 hover:text-white">Mark all read</button>}
                    </div>
                    {error && <p className="px-4 py-3 text-sm text-rose-300">{error}</p>}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-zinc-500">You’re all caught up.</p> : notifications.map((item) => (
                            <button key={item._id} type="button" onClick={() => openNotification(item)} className={`block w-full border-b border-white/5 px-4 py-4 text-left hover:bg-white/5 ${item.readAt ? '' : 'bg-indigo-950/20'}`}>
                                <span className="block text-sm font-semibold text-white">{item.title}</span>
                                <span className="mt-1 block text-xs leading-relaxed text-zinc-400">{item.message}</span>
                                <time className="mt-2 block text-[10px] text-zinc-600">{new Date(item.createdAt).toLocaleString()}</time>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
