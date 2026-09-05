import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import {
    Wallet, LogOut, Menu, X, Plus, ArrowLeftRight, PieChart, HandCoins, Users, User
} from 'lucide-react';

const links = [
    { to: '/add', label: 'Add', icon: Plus },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/summary', label: 'Summary', icon: PieChart },
    { to: '/lender-dashboard', label: 'Lender', icon: HandCoins },
    { to: '/borrower-dashboard', label: 'Borrower', icon: Users },
    { to: '/profile', label: 'Profile', icon: User }
];

const Navbar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-40">
            <div className="mx-3 sm:mx-5 mt-3 rounded-2xl bg-sand-50/80 backdrop-blur-xl border border-white/70 shadow-card">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-[4.35rem] gap-4">
                        <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
                            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss-900 text-sand-50 shadow-glow">
                                <Wallet size={18} />
                            </span>
                            <span className="leading-tight">
                                <span className="block font-display text-[1.35rem] text-moss-900">LendLoop</span>
                                <span className="block text-[10px] tracking-[0.18em] uppercase text-gold-600 font-semibold">Friends · funds · trust</span>
                            </span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1 rounded-full bg-moss-50/80 p-1">
                            {links.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition ${
                                            isActive
                                                ? 'bg-moss-900 text-sand-50 shadow-sm hover:bg-moss-800 hover:text-sand-50'
                                                : 'text-moss-800 hover:text-moss-950 hover:bg-white'
                                        }`
                                    }
                                >
                                    <link.icon size={15} />
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>

                        <div className="flex items-center gap-1.5">
                            <NotificationBell />
                            <button
                                onClick={handleLogout}
                                className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-moss-800/70 hover:bg-moss-50 hover:text-moss-900"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                            <button className="lg:hidden p-2 text-moss-800" onClick={() => setOpen((v) => !v)}>
                                {open ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
                {open && (
                    <div className="lg:hidden border-t border-sand-200 px-4 py-3 space-y-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                                        isActive ? 'bg-moss-900 text-sand-50' : 'text-moss-800'
                                    }`
                                }
                            >
                                <link.icon size={16} />
                                {link.label}
                            </NavLink>
                        ))}
                        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-coral-600">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
