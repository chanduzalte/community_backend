// controllers/userController.js
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const bcryptSalt = bcrypt.genSaltSync(10);

class UserController {
  async loginUser(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find the user by email
      const user = await User.findOne({ email });

      // Check if the user exists
      if (!user) {
        return res.status(401).json({ msg: 'User not found', body: req.body });
      }

      // Verify the password
      const passwordMatch = await bcrypt.compare(password, user.password);


      if (!passwordMatch) {
        return res.status(401).json({ msg: 'Invalid credentials' });
      }

      // User is authenticated, generate a JWT token
      const token = jwt.sign(
        { userId: user._id, email: user.email, usertype: user.usertype },
        process.env.JWT_SECRET, // Replace with your secret key
        { expiresIn: '3d' } // Set token expiration as needed
      );

      // Send the token in the response
      res.json({ token });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
  


  async registerUser(req, res) {
    const { email, password, usertype, status } = req.body;

    try {
      // const hasPassword = await bcrypt.hash(password, 10);
      const hash_pass = bcrypt.hashSync(password, bcryptSalt);
      const userDoc = new User({
        email,
        password: hash_pass,
        usertype,
        status,
      });
      await userDoc.save();
      res.status(201).json(userDoc);
    } catch (e) {
      res.status(422).json({ message: e.message });
    }
  }

  async getUserProfile(req, res) {
    try {
      const userId = await req.user.userId;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      res.status(200).json({...user._doc, password: undefined});
     
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }

  async updateUserPassword(req, res) {
    try {
      const userId = await req.user.userId;
      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      const passwordMatch = await bcrypt.compare(oldPassword, user.password);

      if (!passwordMatch) {
        return res.status(406).json({ msg: 'Invalid Old Password' });
      }

      const hash_pass = bcrypt.hashSync(newPassword, bcryptSalt);
      user.password = hash_pass;
      await user.save();

      res.status(200).json({ msg: 'Password updated successfully' });
    }
    catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  }
}

module.exports = new UserController();
