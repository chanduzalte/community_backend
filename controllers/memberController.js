// controllers/customerController.js
const bcrypt = require("bcrypt");
const Member = require("../models/memberModel");
const MemberToken = require("../models/memberTokenModel")
const moment = require("moment");
const { SH_GH_TYPES, VIDEO_KYC_STATUS, MEMBER_STAGE, TRANSACTION_TYPES, PIN_STATUS, INCOME_TYPES, FREE_PIN_STATUS } = require("../helpers/types");
const LevelPrice = require("../models/levelPrice");
const LevelIncome = require("../models/levelIncomeModel");
const PinEnquiry = require("../models/pinEnquiryModel");
const Settings = require("../models/settings");
const Transaction = require("../models/transactionModel");
const Container = require("../models/containerModel");
const { categoryPrices } = require("../helpers/Constants");
const { default: mongoose } = require("mongoose");

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
            const searchText = req.query.query || "";
            const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
            const type = req.query.type || "all";
            // Calculate the number of documents to skip based on the page and limit
            const skip = (page - 1) * limit;
            
            let filterObj = {};

            if(type === "incompleteRegistration"){
                filterObj = {
                    fname: null,
                    lname: null,
                    passcode: null
                };
                if(searchText){
                    filterObj = {
                        ...filterObj,
                        $and: searchTerms.map(term => ({ 
                            $or: [
                                { $expr: { $regexMatch: { input: { $toString: "$mobile" }, regex: term } } }
                            ]
                        }))
                    }
                }
                const members = await Member.find(filterObj).skip(skip).limit(limit).sort({ createdAt: -1 }).exec();
                const totalMembers = await Member.find(filterObj).countDocuments();
                return res.json({ members, totalMembers });
            } else if(type === "videoKYCCompleted"){
                filterObj = {
                    "videoKYC.status": VIDEO_KYC_STATUS.APPROVED,
                    isRegistered: true
                };
                if(searchText){
                    filterObj = {
                        ...filterObj,
                        $and: searchTerms.map(term => ({
                            $or: [
                                { fname: term },
                                { lname: term },
                                { $expr: { $regexMatch: { input: { $toString: "$mobile" }, regex: term } } }
                            ]
                        }))
                    }
                }
                const members = await Member.find(filterObj).skip(skip).limit(limit).sort({ createdAt: -1 }).populate("referredBy").exec();
                const totalMembers = await Member.find(filterObj).countDocuments();
                return res.json({ members, totalMembers });
            } else if(type === "freePinRequest"){
                filterObj = {
                    freePinImage: { $ne: null, $ne: "default_free_pin_image_url" },
                    // isFollowed: false,
                };
                if(searchText){
                    filterObj = {
                        ...filterObj,
                        $and: searchTerms.map(term => ({
                            $or: [
                                { fname: term },
                                { lname: term },
                                { $expr: { $regexMatch: { input: { $toString: "$mobile" }, regex: term } } }
                            ]
                        })
                    )}
                }

                const members = await Member.find(filterObj).skip(skip).limit(limit).sort({ createdAt: -1 }).populate("referredBy").exec();
                const totalMembers = await Member.find(filterObj).countDocuments();
                return res.json({ members, totalMembers });
            }

            filterObj = {
                isAdmin: false,
                isRegistered: true
            };

            if(type === "videoKYC"){
                filterObj = {
                    profileImage: { $ne: null },
                    "videoKYC.status": { $ne: VIDEO_KYC_STATUS.COMPLETED },
                    "videoKYC.url": { $ne: null, $ne: "default_video_kyc_url" },
                };
            }

            if(searchText){
                filterObj = {
                    ...filterObj,
                    $and: searchTerms.map(term => ({
                        $or: [
                            { fname: term },
                            { lname: term },
                            { $expr: { $regexMatch: { input: { $toString: "$mobile" }, regex: term } } }
                        ]
                    })
                )}
            }

            const members = await Member.find(filterObj).skip(skip).limit(limit).sort({ createdAt: -1 }).populate("referredBy").exec();
            const totalMembers = await Member.countDocuments(filterObj);
            res.json({ members, totalMembers });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async fetchMembersIDs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10; 
            const skip = (page - 1) * limit;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const date = req.query.date;

            if(date !== "undefined") {
                const _startDate = moment(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
                const _endDate = moment(date).set({ hour: 23, minute: 59, second: 59, millisecond: 0 }).toDate();
                const aggregationPipeline = [
                    { $match: { createdAt: { $gte: _startDate, $lte: _endDate } } },
                    {
                        $group: {
                            _id: {
                                memberId: "$memberId",
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $lookup: { from: "members", localField: "_id.memberId", foreignField: "_id", as: "memberDetails"} },
                    { $unwind: "$memberDetails" },
                    {
                        $project: {
                            _id: 0,
                            memberId: "$_id.memberId",
                            count: 1,
                            fname: "$memberDetails.fname",
                            lname: "$memberDetails.lname",
                            mobile: "$memberDetails.mobile"
                        }
                    },
                ];
            
                const memberIds = await MemberToken.aggregate([
                    ...aggregationPipeline,
                    { $skip: skip },
                    { $limit: limit }
                ]).exec();
            
                const totalMemberIdsCount = await MemberToken.aggregate([
                    ...aggregationPipeline,
                    { $count: "totalCount" }
                ]).exec();

                const totalMemberIds = totalMemberIdsCount.length > 0 ? totalMemberIdsCount[0].totalCount : 0;
                return res.json({ memberIds, totalMemberIds });
            }

            const _startDate = moment(startDate).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toDate();
            const _endDate = moment(endDate).set({ hour: 23, minute: 59, second: 59, millisecond: 0 }).toDate();
            const aggregationPipeline = [
                { $match: { createdAt: { $gte: _startDate, $lte: _endDate } } },
                { $group: { _id: { createdAt: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } }, count: { $sum: 1 } }
                },
                { $project: { _id: 0, createdAt: "$_id.createdAt", count: 1 } },
                { $sort: { createdAt: 1 } }
            ];

            const memberIds = await MemberToken.aggregate([
                ...aggregationPipeline,
                { $skip: skip },
                { $limit: limit }
            ]).exec();

            const totalMemberIdsCount = await MemberToken.aggregate([
                ...aggregationPipeline,
                { $count: "totalCount" }
            ]).exec();

            const totalMemberIds = totalMemberIdsCount.length > 0 ? totalMemberIdsCount[0].totalCount : 0;

            res.json({ memberIds, totalMemberIds });
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
            const containerId = req.query.containerId;
            const adminToken = process.env.ADMIN_TOKEN_ID || 1;

            const startDate = moment(date).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            const endDate = moment(date).set({ hour: 23, minute: 59, second: 59, millisecond: 0 });
            
            let data = [];
          
            if (type === "sender") {
                data = await MemberToken.find({
                    _id: { $ne: adminToken },
                    sendHelp: null,
                    container: containerId,
                    createdAt: { $gte: startDate, $lte: endDate },
                }).populate("memberId").exec();

                if (tag !== "All") {
                    data = data.filter((item) => {
                        return item?.memberId?.tags?.includes(tag);
                    });
                }
            } else {
                data = await MemberToken.find({
                    _id: { $ne: adminToken },
                    sendHelp: { $ne: null },
                    container: containerId,
                    "sendHelp.status": SH_GH_TYPES.COMPLETED,
                    createdAt: { $gte: startDate, $lte: endDate },
                    $or: [
                        { getHelp1: { $exists: false } },
                        { getHelp2: { $exists: false } }
                    ]
                }).populate("memberId").exec();

                if (tag !== "All") {
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

    async fetchContainers(req, res) {
        try {
            const containers = await Container.find().exec();
            res.status(200).json(containers);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async createContainer(req, res) {
        try {
            const { date, note, isPublished } = req.body;

            let containerName = date;
            let id = 1;

            let existingContainer = await Container.findOne({ containerName }).sort({ id: -1 });

            if (existingContainer) {
                id = (existingContainer.id + 1) || 1;
            }

            const container = new Container({
                containerName,
                note,
                isPublished,
                id
            });


            const data = container
            
            await container.save();

            // Fetch sendHelps
            const dateQuery = req.query.date || new Date();
            const type = req.query.type;
            const tag = req.query.tag;
            const adminToken = process.env.ADMIN_TOKEN_ID || 1;

            const startDate = moment(dateQuery).set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            const endDate = moment(dateQuery).set({ hour: 23, minute: 59, second: 59, millisecond: 0 });

            let sendHelps = [];
            if (type === "sender") {
                sendHelps = await MemberToken.find({
                    _id: { $ne: adminToken },
                    sendHelp: null,
                    container: null,
                    createdAt: { $gte: startDate, $lte: endDate },
                }).populate("memberId").exec();

                if (tag !== "All") {
                    sendHelps = sendHelps.filter((item) => {
                        return item?.memberId?.tags?.includes(tag);
                    });
                }
            } else {
                sendHelps = await MemberToken.find({
                    _id: { $ne: adminToken },
                    sendHelp: { $ne: null },
                    container: null,
                    "sendHelp.status": SH_GH_TYPES.COMPLETED,
                    createdAt: { $gte: startDate, $lte: endDate },
                    $or: [
                        { getHelp1: { $exists: false } },
                        { getHelp2: { $exists: false } }
                    ]
                }).populate("memberId").exec();

                if (tag !== "All") {
                    sendHelps = sendHelps.filter((item) => {
                        return item?.memberId?.tags?.includes(tag);
                    });
                }

                sendHelps = sendHelps.filter((item) => {
                    return item?.memberId?.videoKYC?.status === VIDEO_KYC_STATUS.APPROVED;
                });
            }

            // Update sendHelps with container ID
            for (let sendHelp of sendHelps) {
                sendHelp.container = container._id;
                await sendHelp.save();
            }

            res.status(201).json({ data: data, message: "Container created" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async publishContainer(req, res) {
        try {
            const { containerName, containerId, publishDateTime, endDateTime } = req.body;
            const container = await Container.findById(containerId);
            if(!container){
                return res.status(404).json({ message: "Container not found" });
            }

            // convert publishDateTime and endDateTime to IST and remove 5 hours and 30 minutes
            const _publishDateTime = moment(publishDateTime).subtract(5, 'hours').subtract(30, 'minutes').toDate();
            const _endDateTime = moment(endDateTime).subtract(5, 'hours').subtract(30, 'minutes').toDate();

            container.isPublished = true;
            container.publishDateTime = _publishDateTime;
            container.endDateTime = _endDateTime;

            await container.save();
            res.status(200).json({ message: "Container published" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async editContainerNote(req, res) {
        try {
            const { containerName, containerId, note } = req.body;
            const container = await Container.findById(containerId);
            if(!container){
                return res.status(404).json({ message: "Container not found" });
            }
            container.note = note;
            await container.save();
            res.status(200).json({ message: "Container note updated" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
            
    async assignSendHelp(req, res) {
        try {
            const { senders, recipient, sendToAdmin, containerId } = await req.body;
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

                if(containerId){
                    foundSender.container = containerId;
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
                    if(count >= 1){
                        member.isSilver = true;
                        member.stage = checkStatus(member.silverCount);
                        await member.save();
                        await silverTrigger(Id, member?.referredBy);
                    }
                }
            }
            
            await member.save();

            res.status(200).json({ message: "Member status updated" });

        } catch (error) {
            console.log("Member status update error", error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async addNote(req, res) {
        try {
            const { Id, Note } = await req.body;
            const member = await Member.findById(Id);
            if(!member){
                return res.status(404).json({ message: "Member not found" });
            }

            member.note = Note;
            await member.save();

            res.status(200).json({ message: "Note added" });
        } catch (error) {
            console.log("Note add error", error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async fetchContainerMemberTokens (req, res) {
        try {
            const containerId = req.params.id;
            const members = await MemberToken.find({ container: containerId }).populate("memberId").populate("sendHelp.recipient").populate("sendHelp.recipientUserId").exec();
            res.json(members);
        } catch (error) {
            console.error(error);
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
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10; 
            const skip = (page - 1) * limit;
            const searchText = req.query.query || "";
            const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
        
            const _adminId = new mongoose.Types.ObjectId(adminId);
            let filterObj = {
                sendHelp: { $ne: null },
                "sendHelp.recipientUserId": _adminId
            };

            if(searchText){
                filterObj = {
                    ...filterObj,
                    $and: searchTerms.map(term => ({
                        $or: [
                            { "memberId.fname": term },
                            { "memberId.lname": term },
                            { $expr: { $regexMatch: { input: { $toString: "$memberId.mobile" }, regex: term } } }
                        ]
                    })
                )}
            }

            let aggregateObj = [
                { $lookup: { from: "members", localField: "memberId", foreignField: "_id", as: "memberId" } },
                { $unwind: { path: "$memberId", preserveNullAndEmptyArrays: true } },
                { $match: filterObj }
            ]

            let data;
            let totalGH = 0;
            if(id === adminId){
                data = await MemberToken.aggregate([
                    ...aggregateObj,
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: limit }
                ]);

                const totalGHH = await MemberToken.aggregate([
                    ...aggregateObj,
                    { $count: "totalCount" }
                ]);

                totalGH = totalGHH.length > 0 ? totalGHH[0].totalCount : 0;
            }
            
            res.json({
                gh: data,   
                totalGH
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async updateGH(req, res) {
        try {
            const tokenId = req.params.id;
            const memberToken = await MemberToken.findById(tokenId).populate("memberId");
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
                await distributeIncome(memberToken._id, memberToken?.memberId?.referredBy);

                const count = await MemberToken.find({
                    memberId: memberToken?.memberId?._id,
                    sendHelp: { $ne: null },
                    "sendHelp.status": SH_GH_TYPES.COMPLETED
                }).countDocuments();
                const member = await Member.findById(memberToken?.memberId?._id);
                if(member?.videoKYC?.status === VIDEO_KYC_STATUS.APPROVED && count === 1){
                    member.isSilver = true;  
                    member.stage = MEMBER_STAGE.SILVER;
                    await member.save();
                    await silverTrigger(member?._id, member?.referredBy);
                }
            }

            res.json({ message: "Member Token updated" });
            
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    } 
    
    async getPinEnquiries(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10; // Default limit is 10'
            const searchText = req.query.query || "";
            const searchTerms = searchText.split(' ').map(term => new RegExp(term, 'i'));
            const type = req.query.type || "pinEnquiries";
            const skip = (page - 1) * limit;

            const filterObj = {
                $and: searchTerms.map(term => ({
                    $or: [
                        { "requestedBy.fname": term },
                        { "requestedBy.lname": term },
                        { $expr: { $regexMatch: { input: { $toString: "$requestedBy.mobile" }, regex: term } } }
                    ]
                }))
            };

            const aggregateObj = [
                { $lookup: { from: "members", localField: "requestedBy", foreignField: "_id", as: "requestedBy" } },
                { $unwind: { path: "$requestedBy", preserveNullAndEmptyArrays: true } },
                { $match: filterObj }
            ]

            const members = await PinEnquiry.aggregate([
                ...aggregateObj,
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit }
            ]);

            const totalMemberss = await PinEnquiry.aggregate([
                ...aggregateObj,
                { $count: "totalCount" }
            ]);

            const totalMembers = totalMemberss.length > 0 ? totalMemberss[0].totalCount : 0;

            res.json({ members, totalMembers });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async sendPins(req, res) {
        try {
            const {id, memberId, qty} = await req.body;
            const member = await Member.findById(memberId);
            if(!member){
                return res.status(404).json({ message: "Member not found" });
            }
            member.epinBalance += qty;
            await member.save();
            await PinEnquiry.findByIdAndUpdate(id, { status: PIN_STATUS.SENT });

            const ePinPrice = await Settings.findOne({ key: "ePinPrice" }).lean();
            const price = ePinPrice?.value[0]?.value || 10;

            await Transaction.create({
                qty,
                recipient: memberId,
                transactionType: TRANSACTION_TYPES.BUY,
                totalAmount: qty * price,
                sentByAdmin: true
            });
            
            res.status(200).json({ message: "Pins sent" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }       
    }

    async unlockFreePin(req, res) {
        try {
            const { memberId } = await req.body;
            const member = await Member.findById(memberId);
            if(!member){
                return res.status(404).json({ message: "Member not found" });
            }
            
            const ePinPrice = await Settings.findOne({ key: 'Epin' });
            const price = ePinPrice?.value?.[0]?.value;
            
            await Transaction.create({
                qty: 1,
                recipient: member._id,
                transactionType: TRANSACTION_TYPES.FREE,
                totalAmount: price,
                sentByAdmin: true 
            });
            
            member.isFollowed = true;
            member.epinBalance += 1;
            member.freePinStatus = FREE_PIN_STATUS.APPROVED;
            
            await member.save();
            res.status(200).json({ message: "Free pin unlocked" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    async rejectFreePin(req, res) {
        try {
            const { memberId } = await req.body;
            const member = await Member.findById(memberId);
            if(!member){
                return res.status(404).json({ message: "Member not found" });
            }
            if(member.freePinStatus === FREE_PIN_STATUS.APPROVED){
                member.epinBalance -= 1;
            }
            member.freePinStatus = FREE_PIN_STATUS.REJECTED;
            await member.save();
            res.status(200).json({ message: "Free pin rejected" });
        }catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }

    // Cron Job Functions
    async ApproveGH() {
        try{
            const currentDate = moment().toISOString();
            const filterObj = {
                sendHelp: { $ne: null },
                "sendHelp.status": SH_GH_TYPES.APPROVAL_PENDING,
                container: { $ne: null },
                "container.endDateTime": { $lte: currentDate }
            }
            const aggregateObj = [
                { $lookup: { from: "members", localField: "memberId", foreignField: "_id", as: "memberId" } },
                { $unwind: { path: "$memberId", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "containers", localField: "container", foreignField: "_id", as: "container" } },
                { $unwind: { path: "$container", preserveNullAndEmptyArrays: true } },
                { $match: filterObj }
            ]
            const GHs = await MemberToken.aggregate([
                ...aggregateObj
            ]);

            GHs.forEach(async (gh) => {
                gh.sendHelp.status = SH_GH_TYPES.APPROVED;
                gh.sendHelp.updatedAt = new Date();
                // save the updated GH
                await gh.save();
                // distribute income
                await distributeIncome(gh._id, gh?.memberId?.referredBy);

                // silver silverTrigger
                const count = await MemberToken.find({
                    memberId: gh?.memberId?._id,
                    sendHelp: { $ne: null },
                    "sendHelp.status": SH_GH_TYPES.COMPLETED
                }).countDocuments();
                const member = await Member.findById(gh?.memberId?._id);
                if(member?.videoKYC?.status === VIDEO_KYC_STATUS.APPROVED && count === 1){
                    member.isSilver = true;  
                    member.stage = MEMBER_STAGE.SILVER;
                    await member.save();
                    await silverTrigger(member?._id, member?.referredBy);
                }
            });

        } catch (error) {
            console.log(error);
        }
    }

    async ExprieSH() {
        try{
            const currentDate = moment().toISOString();
            const filterObj = {
                sendHelp: { $ne: null },
                "sendHelp.status": SH_GH_TYPES.PAYMENT_PENDING,
                "sendHelp.screenShot": { $ne: null },
                container: { $ne: null },
                "container.endDateTime": { $lte: currentDate }
            }
            const aggregateObj = [
                { $lookup: { from: "members", localField: "memberId", foreignField: "_id", as: "memberId" } },
                { $unwind: { path: "$memberId", preserveNullAndEmptyArrays: true } },
                { $lookup: { from: "containers", localField: "container", foreignField: "_id", as: "container" } },
                { $unwind: { path: "$container", preserveNullAndEmptyArrays: true } },
                { $match: filterObj }
            ]

            const SHs = await MemberToken.aggregate([
                ...aggregateObj
            ]);

            SHs.forEach(async (sh) => {
                sh.sendHelp.status = SH_GH_TYPES.EXPIRED;
                sh.sendHelp.updatedAt = new Date();
                await sh.save();
            });
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new CustomerController();

const distributeIncome = async (sourceToken, referredBy) => {
  try {
    const temp = referredBy;
    const levelPrice = await LevelPrice.findOne({}).lean();
    for (let i = 1; i < 7; i++) {
      if (!referredBy) break;

      await LevelIncome.create({
        sourceToken,
        member: referredBy,
        level: i,
        amount: levelPrice?.price[i - 1],
        type: INCOME_TYPES.LEVEL
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

      let PLATINUM = false, LEADER = false, DIAMOND = false;
      referredBy = temp;
      let level = 1;
      while (referredBy && (!PLATINUM || !LEADER || !DIAMOND)) {
          let member = await Member.findById(referredBy).populate('referredBy');
          const stage = member?.stage;
          const amount = categoryPrices[stage] || 0;
          if (stage === MEMBER_STAGE.PLATINUM) PLATINUM = true;
          else if (stage === MEMBER_STAGE.LEADER) LEADER = true;
          else if (stage === MEMBER_STAGE.DIAMOND) DIAMOND = true;

          if (amount) {
              if (stage === MEMBER_STAGE.PLATINUM || stage === MEMBER_STAGE.LEADER || stage === MEMBER_STAGE.DIAMOND) {
                  await LevelIncome.create({
                      sourceToken,
                      member: referredBy,
                      amount,
                      level: level,
                      type: INCOME_TYPES.CATEGORY
                  });
              }
              member = await Member.findOneAndUpdate({
                  _id: referredBy
              }, {
                  $inc: {
                      income: amount
                  }
              }, { new: true });
          }
          referredBy = member?.referredBy;
          level++;
      }

  } catch (error) {
    console.log(error);
  }
};


silverTrigger = async (memberId, referredBy) => {
    try {
        let referreingMember = await Member.findById(referredBy);

        // 1] Change Parent's rank
        while(referreingMember){
            const silverCount = (referreingMember?.silverCount || 0) + 1;
            let status = MEMBER_STAGE.NEW;
            if(referreingMember.isSilver){
                status = checkStatus(silverCount);
            }
            referreingMember.silverCount = silverCount;
            referreingMember.stage = status;
            await referreingMember.save();
            referreingMember = await Member.findById(referreingMember?.referredBy);
        }

        // 2] Change Self's rank
        const member = await Member.findById(memberId);
        if(member.isSilver){
            member.stage = checkStatus(member.silverCount);
            await member.save();
        }
    } catch (error) {
        console.log(error);
    }
}

const checkStatus = (count) => {
    if(count >= 250){
        return MEMBER_STAGE.DIAMOND;
    } else if(count >= 50){
        return MEMBER_STAGE.LEADER;
    } else if(count >= 20){
        return MEMBER_STAGE.PLATINUM;
    } else if(count >= 5){
        return MEMBER_STAGE.GOLD;
    } else {
        return MEMBER_STAGE.SILVER;
    }
}