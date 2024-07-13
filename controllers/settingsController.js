// controllers/settingsController.js

const Settings = require("../models/settings");

class SettingsController {
    async getSettings(req, res) {
        try {
            const settings = await Settings.find();
            res.status(200).json({
                message: 'Settings fetched successfully',
                settings,
            });
        } catch (err) {
            res.status(500).json({ error: 'Server error' });
        }
    }

    async createSettings(req, res) {
        try {
            const newSettings = new Settings(req.body);
            await newSettings.save();
            res.status(201).json({
                message: 'Settings created successfully',
                settings: newSettings
            });
        } catch (err) {
            res.status(400).json({ error: 'Bad request' });
        }
    }

    async updateSettings(req, res) {
        try {
            const settings = await Settings.findById(req.params.id);
            if (!settings) {
                return res.status(404).json({ error: 'Settings not found' });
            }
            Object.keys(req.body).forEach(key => {
                settings[key] = req.body[key];
            });
            await settings.save();
            res.status(200).json({
                message: 'Settings updated successfully',
                settings,
            });
        } catch (err) {
            res.status(400).json({ error: 'Bad request' });
        }
    }

    async deleteSettings(req, res) {
        try {
            const id = req.params.id;
            if(!id) return res.status(400).json({ error: 'ID not valid' });
            
            const settings = await Settings.findByIdAndDelete(id);
            if (!settings) {
                return res.status(404).json({ error: 'Settings not found' });
            }
            
            res.status(200).json({
                message: 'Settings deleted successfully',
                settings,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = new SettingsController();
