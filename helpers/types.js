const SH_GH_TYPES = {
    ALL: 'ALL',
    COMPLETED: 'COMPLETED',
    APPROVAL_PENDING: 'APPROVAL_PENDING',
    PAYMENT_PENDING: 'PAYMENT_PENDING',
    REJECTED: 'REJECTED',
    EXPIRED: 'EXPIRED',
};

const VIDEO_KYC_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
}

const MEMBER_STAGE = {
    NEW: 'NEW',             // After Registration
    SILVER: 'SILVER',       // After Video KYC && 1SH Approveds
    GOLD: 'GOLD',           // After 5+ Silver
    PLATINUM: 'PLATINUM',   // After 20+ Silver
    LEADER: 'LEADER',       // After 50+ Silver
    DIAMOND: 'DIAMOND',     // After 5+ Leader
}

const PIN_STATUS = {
    REQUESTED: 'REQUESTED',
    SENT: 'SENT',
}

const TRANSACTION_TYPES = {
    BUY: 'BUY',
    TRANSFER: 'TRANSFER',
    FREE: 'FREE',
    ID_CREATE: 'ID_CREATE',
    REDEEM: "REDEEM"
}


const INCOME_TYPES = {
    LEVEL: 'LEVEL',
    CATEGORY: 'CATEGORY',
}

const FREE_PIN_STATUS = {
    REQUESTED: 'REQUESTED',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
}

module.exports = {
    SH_GH_TYPES,
    VIDEO_KYC_STATUS,
    MEMBER_STAGE,
    PIN_STATUS,
    TRANSACTION_TYPES,
    INCOME_TYPES,
    FREE_PIN_STATUS
}