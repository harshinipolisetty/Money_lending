import React from 'react';
import { Link } from 'react-router-dom';
import { Banknote, MessageCircle } from 'lucide-react';

const LoanPayActions = ({ editTo, onAskToPay, settled }) => {
    if (settled) {
        return (
            <span className="inline-flex items-center rounded-full bg-moss-100 px-3 py-1.5 text-[11px] font-semibold text-moss-800">
                Settled
            </span>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Link to={editTo} className="btn-compact">
                <Banknote size={14} strokeWidth={2.25} />
                Record payment
            </Link>
            <button type="button" onClick={onAskToPay} className="btn-compact-gold">
                <MessageCircle size={14} strokeWidth={2.25} />
                Ask to pay
            </button>
        </div>
    );
};

export default LoanPayActions;
