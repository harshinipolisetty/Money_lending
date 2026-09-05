const toPaise = (rupees) => {
    const n = Number(rupees);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n * 100);
};

const fromPaise = (paise) => Number((Number(paise || 0) / 100).toFixed(2));

const remainingOf = (tx) => {
    if (!tx || tx.status === 'repaid') return 0;
    if (tx.remainingPaise != null) return fromPaise(tx.remainingPaise);
    if (tx.remainingAmount != null) return tx.remainingAmount;
    return Number(tx.amount) || 0;
};

const loanSnapshot = (rupees) => {
    const paise = toPaise(rupees);
    if (!paise) {
        throw new Error('Amount must be greater than 0');
    }
    const amount = fromPaise(paise);
    return {
        amount,
        principalAmount: amount,
        originalAmount: amount,
        amountPaid: 0,
        remainingAmount: amount,
        amountPaise: paise,
        paidPaise: 0,
        remainingPaise: paise
    };
};

const toPaidPaise = (rupees) => {
    const n = Number(rupees);
    if (!Number.isFinite(n) || n < 0) {
        throw new Error('Amount paid cannot be negative');
    }
    return Math.round(n * 100);
};

const loanWithPayment = (principalRupees, paidRupees = 0) => {
    const snapshot = loanSnapshot(principalRupees);
    const paidPaise = toPaidPaise(paidRupees || 0);
    if (paidPaise > snapshot.amountPaise) {
        throw new Error('Amount paid cannot exceed the loan amount');
    }
    const remainingPaise = snapshot.amountPaise - paidPaise;
    return {
        ...snapshot,
        amountPaid: fromPaise(paidPaise),
        remainingAmount: fromPaise(remainingPaise),
        paidPaise,
        remainingPaise,
        status: remainingPaise <= 0 ? 'repaid' : 'active',
        repaymentDate: remainingPaise <= 0 ? new Date() : null
    };
};

const applyPaidTotal = (doc, paidPaise) => {
    const principalPaise = doc.amountPaise
        || toPaise(doc.principalAmount || doc.originalAmount || doc.amount);
    if (!principalPaise) {
        throw new Error('Amount must be greater than 0');
    }
    if (paidPaise < 0 || paidPaise > principalPaise) {
        throw new Error('Amount paid cannot exceed the loan amount');
    }
    const remainingPaise = principalPaise - paidPaise;
    doc.paidPaise = paidPaise;
    doc.remainingPaise = remainingPaise;
    doc.amountPaid = fromPaise(paidPaise);
    doc.remainingAmount = fromPaise(remainingPaise);
    doc.status = remainingPaise <= 0 ? 'repaid' : 'active';
    doc.repaymentDate = remainingPaise <= 0 ? new Date() : null;
    return doc;
};

module.exports = {
    toPaise,
    fromPaise,
    remainingOf,
    loanSnapshot,
    loanWithPayment,
    applyPaidTotal,
    toPaidPaise
};
