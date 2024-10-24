const { DayTable } = require("../models/dayTableModel");

class DayTableController {

    async createDayTable(req, res) {
        try {
            const { date, systemIdCreationLimit, published } = await req.body;
            
            const foundDayTable = await DayTable.findOne({ date: date });
            if (foundDayTable) {
                return res.status(400).json({ message: "Entry already exists for this date."});
            }

            const lastDay = await DayTable.findOne().sort({ day: -1 });
            let day = 1;
            if (lastDay) {
                day = lastDay.day + 1;
            }

            const formattedDate = new Date(date);
            const savedDayTable = await DayTable.create({
                day: day,
                date: formattedDate,
                systemIdCreationLimit: systemIdCreationLimit,
                published: true,
            });
            res.status(200).json(savedDayTable);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err });
        }
    }

    async getDayTables(req, res) {
        try {
            
            const daysBeforeLimit = process.env.DAYS_BEFORE_LIMIT || 5;
            const daysAfterLimit = process.env.DAYS_AFTER_LIMIT || 5;
            
            const today = new Date();
            const DaysBefore = new Date(today);
            DaysBefore.setDate(DaysBefore.getDate() - daysBeforeLimit);
            const DaysAfter = new Date(today);
            DaysAfter.setDate(DaysAfter.getDate() + daysAfterLimit);

            const dayTables = await DayTable.find({ date: { $gte: DaysBefore, $lte: DaysAfter } });
            res.status(200).json(dayTables);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    async updateDayTable(req, res) {
        try {
            const { published, systemIdCreationLimit } = await req.body;
            const { id } = await req.params;

            const updatedDayTable = await DayTable.findByIdAndUpdate(id, { 
                published: published,
                systemIdCreationLimit: systemIdCreationLimit
            }, { new: true });

            if (!updatedDayTable) {
                return res.status(404).json({ message: "Entry not found." });
            }

            res.status(200).json(updatedDayTable);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    async deleteDayTable(req, res) {
        try {
            const { id } = await req.params;

            const deletedDayTable = await DayTable.findByIdAndDelete(id);

            if (!deletedDayTable) {
                return res.status(404).json({ message: "Entry not found." });
            }

            res.status(200).json(deletedDayTable);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

}

module.exports = new DayTableController();