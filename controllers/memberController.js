// controllers/customerController.js
const bcrypt = require("bcrypt");
const Member = require("../models/memberModel");
const MemberToken = require("../models/memberTokenModel")
const moment = require("moment");
const { SH_GH_TYPES, VIDEO_KYC_STATUS } = require("../helpers/types");
const LevelPrice = require("../models/levelPrice");
const LevelIncome = require("../models/levelIncomeModel");

class CustomerController {

    async memberDetailsById(req, res) {
        const memberId = req.params.id;
        try {
            const member = await Member.findById(memberId).populate("tags").exec();
            if (!member) {
                return res.status(404).json({ error: "Member not found" });
            }
            res.json(member);
        } catch (err) {
            res.status(500).json({ error: "Server error" });
        }
    }

    async fetchMembersPerPage(req, res) {
        try {
            // Parse page and limit parameters from the query string
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10; // Default limit is 10'
            const type = req.query.type || "all";
            // Calculate the number of documents to skip based on the page and limit
            const skip = (page - 1) * limit;

            const members = type === "videoKYC" ? 
            await Member.find({ 
                profileImage: { $ne: null },
                "videoKYC.status": VIDEO_KYC_STATUS.PENDING,
                "videoKYC.url": { $ne: null, $ne: "default_video_kyc_url"}
            }).populate("referredBy").exec()
            :
            await Member.find({
                isAdmin: false
            }).skip(skip).limit(limit).sort({ createdAt: -1 })
                .exec();

            const totalMembers = type === "videoKYC" ?
            await Member.find({ 
                profileImage: { $ne: null },
                "videoKYC.status": VIDEO_KYC_STATUS.PENDING,
                "videoKYC.url": { $ne: null , $ne: "default_video_kyc_url"}
            }).countDocuments()
            :
            await Member.find({ isAdmin: false }).countDocuments();

            res.json({ members, totalMembers });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async deleteMember(req, res) {
        try {
            const memberId = req.params.id;
            const member = await Member.findById(memberId);
            
            if (!member) {
                return res.json({ message: "Member not found" });
            }
            
            await Member.findByIdAndDelete(memberId);
            res.status(200).json({ message: "Member deleted" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async fetchTokensPerMemberPerPage (req, res) {
        try {
            // Parse page and limit parameters from the query string
            // const page = parseInt(req.query.page) || 1;
            // const limit = parseInt(req.query.limit) || 10; // Default limit is 10
            // console.log(page, limit);
            // // Calculate the number of documents to skip based on the page and limit
            // const skip = (page - 1) * limit;

            const tokensForToday = await MemberToken.find({
              createdAt: Date.now(),
            })
              .populate("memberId")
              .exec();

            res.json({ tokensForToday });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async fetchSendHelps(req, res) {
        try {
            // take out date and type from query string
            const date = req.query.date || new Date();
            const type = req.query.type;
            const tag = req.query.tag

            const adminToken = process.env.ADMIN_TOKEN_ID || 1;

            const startDate = moment(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            const endDate = moment(date).set({ hour: 23, minute: 59, second: 59, millisecond: 0 });
            
            
            let data = [];
            if(type === "sender"){ 
                data = await MemberToken.find({
                    _id: { $ne: adminToken }, 
                    sendHelp: null,
                    createdAt: { $gte: startDate, $lte: endDate },
                }).populate("memberId").exec()
                
                if(tag!=="All"){
                    data = data.filter((item) => {
                        return item?.memberId?.tags?.includes(tag);
                    });
                }
                
            } else{
                data = await MemberToken.find({
                    _id: { $ne: adminToken }, 
                    sendHelp: { $ne: null }, 
                    "sendHelp.status": SH_GH_TYPES.COMPLETED,
                    createdAt: { $gte: startDate, $lte: endDate },
                    $or: [
                        { getHelp1: {$exists: false} },
                        { getHelp2: {$exists: false} }
                    ] 
                }).populate("memberId").exec()
               
                if(tag!=="All"){
                    data = data.filter((item) => {
                        return item?.memberId?.tags?.includes(tag);
                    });
                }

                data = data.filter((item) => {
                    return item?.memberId?.videoKYC?.status === VIDEO_KYC_STATUS.APPROVED;
                });
            }


            data = data?.map((item) => {
                return {
                    _id: item?._id,
                    memberId: item?.memberId?._id,
                    tokenId: item?.tokenId,
                    fname: item?.memberId?.fname,
                    lname: item?.memberId?.lname,
                }
            });
            res.json({data});

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async assignSendHelp(req, res) {
        try {
            const { senders, recipient, sendToAdmin } = await req.body;

            const foundRecipient = await MemberToken.findById({
                _id: recipient?._id,
                memberId: recipient?.memberId
            });
            if(!foundRecipient){
                return res.status(404).json({ message: "Recipient not found" });
            }

            let length = !foundRecipient?.getHelp1 && !foundRecipient?.getHelp2 ? 2 : 1;
            if(sendToAdmin)
                length = senders.length;
            else 
                length = Math.min(length, senders.length);

            for(let i = 0; i < length; i++){
                const foundSender = await MemberToken.findById({
                    _id: senders[i]?._id,
                    memberId: senders[i]?.memberId
                });
    
                if(!foundSender){
                    return res.status(404).json({ message: "Sender not found" });
                }
    
                if(foundSender?.sendHelp){
                    return res.status(400).json({ message: "Sender already assigned" });
                }
    
                foundSender.sendHelp = {
                    recipient: foundRecipient?._id,
                    recipientUserId: foundRecipient?.memberId,
                    status: SH_GH_TYPES.PAYMENT_PENDING,
                    assignedOn: new Date(),
                    updatedAt: new Date()
                }
    
                await foundSender.save();

                if(!sendToAdmin){
                    if(foundRecipient?.getHelp1){
                        foundRecipient.getHelp2 = foundSender?._id;
                    } else {
                        foundRecipient.getHelp1 = foundSender?._id;
                    }
                    await foundRecipient.save();
                }
            }
            
            res.status(200).json({
                message: sendToAdmin ? `Assigned ${length} senders to admin` : `Assigned ${length} senders to recipient`
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async changeMemberStatus(req, res) {
        try {
            const { Id, Status, Type } = await req.body;

            const member = await Member.findById(Id);
            if(!member){
                return res.status(404).json({ message: "Member not found" });
            }

            if(Type === "videoKYC"){
                member.videoKYC.status = Status;
                if(Status === VIDEO_KYC_STATUS.APPROVED){
                    const count = await MemberToken.find({
                        memberId: member?._id,
                        sendHelp: { $ne: null },
                        "sendHelp.status": SH_GH_TYPES.COMPLETED
                    }).countDocuments();
                    if(count >= 1)
                        member.isSliver = true;
                }
            }
            
            await member.save();

            res.status(200).json({ message: "Member status updated" });

        } catch (error) {
            console.log("Member status update error", error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async fetchTokensPerPage(req, res) {
        try {
            const id = req.params.id;
            
            if(!id){
                return res.status(400).json({ message: "Member id required" });
            }

            // get help 1 or get help 2 is exists
            let tokens = await MemberToken.find({ memberId: id })
            .populate("sendHelp.recipient")
            .populate("sendHelp.recipientUserId")
            .exec();

            tokens = tokens.map((item) => {
                return {
                    _id: item?._id,
                    tokenId: item?.tokenId,
                    isActive: item?.isActive,
                    getHelp1: item?.getHelp1,
                    getHelp2: item?.getHelp2,
                    createdAt: item?.createdAt,
                    name: item?.sendHelp ? item?.sendHelp?.recipientUserId?.isAdmin ? "Admin" : `${item?.sendHelp?.recipientUserId?.fname} ${item?.sendHelp?.recipientUserId?.lname}` : "N/A",
                    sendHelpStatus: item?.sendHelp?.status || "N/A"
                }
            });

            res.json(tokens);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
    async updateMember(req, res) {
        try {
            const memberId = req.params.id;
            const member = await Member.findById(memberId);
            if (!member) {
                return res.status(404).json({ message: "Member not found" });
            }
            const { tags } = await req.body;
            member.tags = tags;
            await member.save();
            res.json({ message: "Member updated" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async fetchGetHelps(req, res) {
        try {
            let id = req.params.id;
            if(!id){
                return res.status(400).json({ message: "Member id required" });
            }
            const adminId = process.env.ADMIN_ID;
            let data;
            if(id === adminId){
                data = await MemberToken.find({
                    sendHelp: { $ne: null },
                    "sendHelp.recipientUserId": adminId,
                }).populate("memberId").exec();
            }
            
            res.json(data);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async updateGH(req, res) {
        try {
            const memberId = req.params.id;
            const memberToken = await MemberToken.findById(memberId).populate("memberId")
            if (!memberToken) {
                return res.status(404).json({ message: "Member Token not found" });
            }
            const { status } = await req.body;

            memberToken.sendHelp.status = status;
            if(status === SH_GH_TYPES.REJECTED){
                memberToken.sendHelp.rejectionLimit += 1;
            }

            memberToken.sendHelp.updatedAt = new Date();
            await memberToken.save();

            if(status === SH_GH_TYPES.COMPLETED){
                await distributeIncome(memberToken._id, memberToken?.memberId?.referredBy)
            }

            res.json({ message: "Member Token updated" });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }   
}

module.exports = new CustomerController();

const distributeIncome = async (sourceToken, referredBy) => {
  try {
    const levelPrice = await LevelPrice.findOne({}).lean();
    for (let i = 1; i < 7; i++) {
      if (!referredBy) break;

      await LevelIncome.create({
        sourceToken,
        member: referredBy,
        level: i,
        amount: levelPrice?.price[i - 1],
      });

      const member = await Member.findOneAndUpdate(
        {
          _id: referredBy,
        },
        {
          $inc: {
            income: levelPrice?.price[i - 1],
          },
        },
        { new: true }
      );

      referredBy = member?.referredBy;
    }
  } catch (error) {
    console.log(error);
  }
};