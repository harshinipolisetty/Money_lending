import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
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
        <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-[4.25rem] gap-4">
                    <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-900 text-white">
                            <Wallet size={18} />
                        </span>
                        <span className="text-[17px] font-semibold text-gray-900">LendLoop</span>
                    </Link>

                    <div className="hidden lg:flex items-center gap-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                className={({ isActive }) =>
                                    `inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition ${
                                        isActive
                                            ? 'bg-emerald-50 text-emerald-900'
                                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                    }`
                                }
                            >
                                <link.icon size={16} />
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLogout}
                            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                        <button className="lg:hidden p-2 text-gray-600" onClick={() => setOpen((v) => !v)}>
                            {open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </div>
            {open && (
                <div className="lg:hidden border-t border-gray-100 px-4 py-3 space-y-1 bg-white">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
                                    isActive ? 'bg-emerald-50 text-emerald-900' : 'text-gray-600'
                                }`
                            }
                        >
                            <link.icon size={16} />
                            {link.label}
                        </NavLink>
                    ))}
                    <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
