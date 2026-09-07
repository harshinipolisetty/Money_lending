import React from 'react';
import { Copy, MessageCircle, X, Check } from 'lucide-react';
import QRCode from 'react-qr-code';
import { formatCurrency } from '../utils/formatCurrency';
import {
    copyText,
    payRequestMessage,
    upiPayUri,
    whatsappShareUrl
} from '../utils/sharePay';

const SharePaySheet = ({ open, onClose, user, friendName, amount, note }) => {
    const [copied, setCopied] = React.useState('');

    if (!open) return null;

    const message = payRequestMessage({
        friendName,
        amount,
        upiId: user?.upiId,
        note,
        yourName: user?.name
    });
    const payload = upiPayUri({
        upiId: user?.upiId,
        name: user?.name,
        amount,
        note
    });

    const flash = (key) => {
        setCopied(key);
        window.setTimeout(() => setCopied(''), 1600);
    };

    const handleCopy = async (key, value) => {
        const ok = await copyText(value);
        if (ok) flash(key);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-moss-950/40 backdrop-blur-sm p-4">
            <div className="surface max-w-md w-full p-7 relative shadow-lift">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-moss-800/50 hover:text-moss-900">
                    <X size={20} />
                </button>
                <p className="kicker">Ask to pay</p>
                <h2 className="font-display text-2xl text-moss-900 mt-1">
                    {amount != null ? formatCurrency(amount) : 'Share your UPI'}
                </h2>
                <p className="text-sm text-moss-800/60 mt-1">
                    {friendName ? `Send this to ${friendName}.` : 'Share your UPI details on WhatsApp or copy them.'}
                </p>

                <div className="mt-5 rounded-2xl bg-moss-50 p-4 text-sm text-moss-900 whitespace-pre-wrap">
                    {message}
                </div>

                {payload ? (
                    <div className="mt-4 flex justify-center rounded-2xl bg-white/70 p-4">
                        {user?.qrCode && !amount ? (
                            <img src={user.qrCode} alt="UPI QR" className="w-40 h-40 object-contain" />
                        ) : (
                            <QRCode value={payload} size={160} />
                        )}
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-coral-600">Add a UPI ID in Profile so people can pay you.</p>
                )}

                <div className="mt-5 grid grid-cols-1 gap-2">
                    <a
                        href={whatsappShareUrl(message)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary"
                    >
                        <MessageCircle size={16} />
                        WhatsApp
                    </a>
                    <button
                        type="button"
                        className="btn-ghost border border-sand-200"
                        onClick={() => handleCopy('upi', user?.upiId)}
                        disabled={!user?.upiId}
                    >
                        {copied === 'upi' ? <Check size={16} /> : <Copy size={16} />}
                        {copied === 'upi' ? 'UPI copied' : 'Copy UPI ID'}
                    </button>
                    <button
                        type="button"
                        className="btn-ghost border border-sand-200"
                        onClick={() => handleCopy('msg', message)}
                    >
                        {copied === 'msg' ? <Check size={16} /> : <Copy size={16} />}
                        {copied === 'msg' ? 'Message copied' : 'Copy message'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SharePaySheet;
