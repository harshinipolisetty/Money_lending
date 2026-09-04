import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowRightLeft, HandCoins, Users, History, User } from 'lucide-react';

const Sidebar = () => {
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/transactions', label: 'Transactions', icon: ArrowRightLeft },
        { path: '/lender-dashboard', label: 'Lending', icon: HandCoins },
        { path: '/borrower-dashboard', label: 'Borrowing', icon: Users },
        { path: '/repayment-history', label: 'History', icon: History },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-4rem)] hidden md:block">
            <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                                isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
