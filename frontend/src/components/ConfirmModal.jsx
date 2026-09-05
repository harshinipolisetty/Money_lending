import React from 'react';

const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-moss-950/40 backdrop-blur-sm p-4">
            <div className="surface max-w-sm w-full p-7 shadow-lift">
                <h3 className="font-display text-2xl text-moss-900">{title}</h3>
                <p className="mt-2 text-sm text-moss-800/70">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} className="btn-ghost">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="btn-primary">
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
