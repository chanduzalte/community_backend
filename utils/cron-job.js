const cron = require('node-cron');
const memberController = require('../controllers/memberController');

const cronJob = () => {
    cron.schedule('0 0 * * * *', async () => {
        console.log(`Cron job running at ${new Date().toLocaleString()}`);
        await memberController.ApproveGH();
        await memberController.ExprieSH();
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
};

module.exports = cronJob;