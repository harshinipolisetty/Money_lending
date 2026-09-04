import React from 'react';

const ConfirmModal = ({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px] p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-7 shadow-xl">
                <h3 className="text-xl font-semibold text-gray-950">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="rounded-full bg-emerald-900 px-5 py-2 text-sm font-semibold text-white">
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
