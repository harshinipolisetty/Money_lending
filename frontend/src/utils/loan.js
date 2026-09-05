export const remainingOf = (tx) => {
    if (!tx || tx.status === 'repaid') return 0;
    if (tx.remainingAmount != null) return Number(tx.remainingAmount);
    return Number(tx.amount) || 0;
};

export const isOverdue = (tx) => {
    if (!tx?.dueDate || tx.status === 'repaid') return false;
    return remainingOf(tx) > 0 && new Date(tx.dueDate) < new Date(new Date().toDateString());
};
