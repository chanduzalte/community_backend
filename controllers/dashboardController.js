const { SH_GH_TYPES, VIDEO_KYC_STATUS } = require("../helpers/types");
const Member = require("../models/memberModel");
const MemberToken = require("../models/memberTokenModel");

class DashboardController {

    async getDashboardCounts(req, res) {
        try {
            const adminId = process.env.ADMIN_ID;
            const adminTokenId = process.env.ADMIN_TOKEN_ID;
            const totalMembers = await Member.countDocuments({_id: { $ne: adminId }, isRegistered: true});
            const totalIds = await MemberToken.countDocuments({ memberId: { $ne: adminId },_id: { $ne: adminTokenId },});
            const totalGetHelpPending = await MemberToken.countDocuments({
                memberId: { $ne: adminId },
                _id: { $ne: adminTokenId },
                "sendHelp.status": SH_GH_TYPES.APPROVAL_PENDING
            });
            const totalVideoKYCPending = await Member.countDocuments({
                _id: { $ne: adminId },
                "videoKYC.url": { $ne: "default_video_kyc_url" },
                "videoKYC.status": VIDEO_KYC_STATUS.PENDING
            })

            const totalVideoKYCCompleted = await Member.countDocuments({
                _id: { $ne: adminId },
                "videoKYC.status": VIDEO_KYC_STATUS.APPROVED,
                isRegistered: true
            })

            res.status(200).json({
                totalMembers,
                totalIds,
                totalGetHelpPending,
                totalVideoKYCPending,
                totalVideoKYCCompleted
            });
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }
}

module.exports = new DashboardController();