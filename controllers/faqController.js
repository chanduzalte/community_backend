const FAQ = require("../models/faqModel");

class FAQController {
    
    async createFAQ(req, res) {
        try {
            const { question, answer } = await req.body;
            
            const foundFAQ = await FAQ.create({ question: question, answer: answer });
            res.status(200).json(foundFAQ);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: err });
        }
    }

    async getFAQs(req, res) {
        try {
            const faqs = await FAQ.find().sort({ id: -1 });
            res.status(200).json(faqs);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    async updateFAQ(req, res) {
        try {
            const { question, answer } = await req.body;
            const { id } = await req.params;

            const updatedFAQ = await FAQ.findByIdAndUpdate(id, { 
                question: question,
                answer: answer
            }, { new: true });
            res.status(200).json(updatedFAQ);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

    async deleteFAQ(req, res) {
        try {
            const { id } = await req.params;
            const deletedFAQ = await FAQ.findByIdAndDelete(id);
            if (!deletedFAQ) {
                return res.status(404).json({ message: "Entry not found." });
            }
            res.status(200).json(deletedFAQ);
        } catch (err) {
            res.status(500).json({ message: err });
        }
    }

}

module.exports = new FAQController();