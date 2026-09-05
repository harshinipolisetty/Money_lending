import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import EditTransaction from './pages/EditTransaction';
import BorrowRequest from './pages/BorrowRequest';
import BorrowerDashboard from './pages/BorrowerDashboard';
import LenderDashboard from './pages/LenderDashboard';
import Summary from './pages/Summary';
import Profile from './pages/Profile';
import RepaymentHistory from './pages/RepaymentHistory';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

const Layout = () => (
    <div className="app-frame">
        <div className="relative z-10 min-h-screen">
            <Navbar />
            <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
                <Outlet />
            </main>
        </div>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Home />} />
                            <Route path="/summary" element={<Summary />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/add" element={<AddTransaction />} />
                            <Route path="/add-transaction" element={<Navigate to="/add" replace />} />
                            <Route path="/edit-transaction/:id" element={<EditTransaction />} />
                            <Route path="/borrow-request" element={<BorrowRequest />} />
                            <Route path="/request-borrow" element={<Navigate to="/borrow-request" replace />} />
                            <Route path="/borrower-dashboard" element={<BorrowerDashboard />} />
                            <Route path="/lender-dashboard" element={<LenderDashboard />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/repayment-history" element={<RepaymentHistory />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
