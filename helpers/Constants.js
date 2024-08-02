const { MEMBER_STAGE } = require("./types")

const CONSTANTS = {
    "ORDER_STATUS": {
        'AVAILABLE': 'AVAILABLE',
        'RENTED': 'RENTED',
        'ONHOLD': 'ONHOLD',
        'CLEANING': 'CLEANING',
        'BROKEN': 'BROKEN',
        'MAINTENANCE': 'MAINTENANCE'
    }
}

const categoryPrices = {
    [MEMBER_STAGE.DIAMOND]: 5,
    [MEMBER_STAGE.LEADER]: 3,
    [MEMBER_STAGE.PLATINUM]: 1,
}

module.exports = {
    CONSTANTS,
    categoryPrices
}