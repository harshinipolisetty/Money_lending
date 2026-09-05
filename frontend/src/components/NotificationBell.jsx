import React from 'react';
import { Bell } from 'lucide-react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';
import { timeAgo } from '../utils/timeAgo';
import * as notificationService from '../services/notificationService';

const socketOrigin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return String(apiUrl).replace(/\/api\/?$/, '');
};

const NotificationBell = () => {
    const { token } = useAuth();
    const [open, setOpen] = React.useState(false);
    const [items, setItems] = React.useState([]);
    const wrapRef = React.useRef(null);

    const unread = items.filter((item) => !item.read).length;

    const load = React.useCallback(async () => {
        try {
            const data = await notificationService.listNotifications();
            setItems(data.data || []);
        } catch (error) {
            console.error('Could not load notifications', error);
        }
    }, []);

    React.useEffect(() => {
        if (!token) return undefined;
        load();

        const socket = io(socketOrigin(), {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socket.on('notification', (payload) => {
            setItems((prev) => {
                if (prev.some((item) => item._id === payload._id)) return prev;
                return [payload, ...prev].slice(0, 50);
            });
        });

        return () => {
            socket.disconnect();
        };
    }, [token, load]);

    React.useEffect(() => {
        const onClick = (event) => {
            if (wrapRef.current && !wrapRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);

    const handleOpen = async () => {
        const next = !open;
        setOpen(next);
        if (next) await load();
    };

    const handleReadOne = async (item) => {
        if (item.read) return;
        setItems((prev) => prev.map((row) => (row._id === item._id ? { ...row, read: true } : row)));
        try {
            await notificationService.markRead(item._id);
        } catch (error) {
            load();
        }
    };

    const handleReadAll = async () => {
        setItems((prev) => prev.map((row) => ({ ...row, read: true })));
        try {
            await notificationService.markAllRead();
        } catch (error) {
            load();
        }
    };

    return (
        <div className="relative" ref={wrapRef}>
            <button
                type="button"
                onClick={handleOpen}
                className="relative grid h-10 w-10 place-items-center rounded-full text-moss-800 hover:bg-moss-50 hover:text-moss-900 transition"
                aria-label="Notifications"
            >
                <Bell size={18} />
                {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-gold-500 text-[10px] font-bold text-moss-950 leading-4">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl surface overflow-hidden z-50 shadow-lift">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-sand-200 bg-moss-50/50">
                        <p className="text-sm font-semibold text-moss-900">Notifications</p>
                        {unread > 0 && (
                            <button type="button" onClick={handleReadAll} className="text-xs font-semibold text-gold-600 hover:underline">
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {items.length === 0 ? (
                            <p className="px-4 py-8 text-sm text-center text-moss-800/50">No notifications yet</p>
                        ) : (
                            items.map((item) => (
                                <button
                                    key={item._id}
                                    type="button"
                                    onClick={() => handleReadOne(item)}
                                    className={`w-full text-left px-4 py-3 border-b border-sand-200 last:border-0 ${
                                        item.read ? 'bg-transparent' : 'bg-gold-400/15'
                                    }`}
                                >
                                    <p className="text-sm font-semibold text-moss-900">{item.title}</p>
                                    {item.message ? (
                                        <p className="mt-0.5 text-xs text-moss-800/60">{item.message}</p>
                                    ) : null}
                                    <p className="mt-1 text-xs text-gold-600">{timeAgo(item.createdAt)}</p>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
