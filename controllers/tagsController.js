const Tag = require("../models/tagModel");

class TagsController {
  async getAllTags(req, res) {
    const { status } = req.query;
    try {
      let data;
      if (status) {
        data = await Tag.find({ status: status });
      } else {
        data = await Tag.find();
      }
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }

  async createTag(req, res) {
    const { name, status } = req.body;

    const existingTag = await Tag.findOne({ name });

    if (existingTag) {
      return res
        .status(400)
        .json({ error: "Tag with the same name already exists." });
    }

    const newTag = new Tag({ name, status });

    try {
      const savedTag = await newTag.save();
      res.status(201).json(savedTag);
    } catch (err) {
      res.status(400).json({ error: "Bad request" });
    }
  }

  async updateTag(req, res) {
    const { id: _id } = req.params;
    const updates = req.body;
    const options = { new: true };
    const tag = await Tag.findById(_id);
    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }
    try {
      const updatedTag = await Tag.findByIdAndUpdate(_id, updates, options);
      res.json(updatedTag);
    } catch (e) {
      res.status(400).send("Error updating Tag");
    }
  }

  async deleteTag(req, res) {
    const { id: _id } = req.params;
    try {
      const tag = await Tag.findByIdAndRemove(_id);
      if (!tag)
        return res.status(404).json({ error: "This tag does not exist." });
      res.json(tag);
    } catch (e) {
      console.log(e);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new TagsController();
