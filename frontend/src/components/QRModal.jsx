import React from 'react';
import QRCode from 'react-qr-code';
import { X } from 'lucide-react';

const upiPayload = (user) => {
    if (!user?.upiId) return '';
    const params = new URLSearchParams({
        pa: user.upiId,
        pn: user.name || 'User',
        cu: 'INR'
    });
    return `upi://pay?${params.toString()}`;
};

const QRModal = ({ open, onClose, user, title }) => {
    if (!open || !user) return null;

    const payload = upiPayload(user);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-moss-950/40 backdrop-blur-sm p-4">
            <div className="surface max-w-md w-full p-7 relative shadow-lift">
                <button onClick={onClose} className="absolute top-4 right-4 text-moss-800/50 hover:text-moss-900">
                    <X size={20} />
                </button>
                <h2 className="font-display text-2xl text-moss-900 mb-6">{title || 'Pay with QR'}</h2>
                <dl className="space-y-2 text-sm mb-6">
                    <div>
                        <dt className="text-moss-800/55">Name</dt>
                        <dd className="font-semibold text-moss-900">{user.name || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-moss-800/55">Phone</dt>
                        <dd className="font-semibold text-moss-900">{user.phone || '—'}</dd>
                    </div>
                    <div>
                        <dt className="text-moss-800/55">UPI ID</dt>
                        <dd className="font-semibold text-moss-900">{user.upiId || 'Not provided'}</dd>
                    </div>
                </dl>
                <div className="rounded-2xl bg-moss-50 p-4">
                    {user.qrCode ? (
                        <img src={user.qrCode} alt="UPI QR code" className="mx-auto w-52 h-52 object-contain" />
                    ) : payload ? (
                        <div className="flex justify-center p-2">
                            <QRCode value={payload} size={200} />
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-10">No UPI QR code is available for this user.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRModal;
