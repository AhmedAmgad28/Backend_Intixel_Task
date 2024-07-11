const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// Register a new user
exports.registerUser = [
  // Validation rules
  check('name', 'Name must be at least 8 characters long').isLength({ min: 8 }),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character').isStrongPassword(),
  check('age', 'Age must be between 16 and 100').isInt({ min: 16, max: 100 }),
  check('profilePictureURL', 'Profile picture must end with .png or .jpg').matches(/\.(jpg|jpeg|png)$/),
  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, age, gender, profilePictureURL, country, city } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      user = new User({
        name,
        email,
        password,
        role,
        age,
        gender,
        profilePictureURL,
        country,
        city
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(payload, 'yourSecretToken', { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
];

// Login user
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, 'yourSecretToken', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update user profile
exports.updateUserProfile = [
  check('name', 'Name must be at least 8 characters long').optional().isLength({ min: 8 }),
  check('email', 'Please include a valid email').optional().isEmail(),
  check('age', 'Age must be between 16 and 100').optional().isInt({ min: 16, max: 100 }),
  check('profilePictureURL', 'Profile picture must end with .png or .jpg').optional().matches(/\.(jpg|jpeg|png)$/),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, age, gender, profilePictureURL, country, city } = req.body;

    try {
      const user = await User.findById(req.user.id);

      if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        user.age = age || user.age;
        user.gender = gender || user.gender;
        user.profilePictureURL = profilePictureURL || user.profilePictureURL;
        user.country = country || user.country;
        user.city = city || user.city;

        await user.save();
        res.json(user);
      } else {
        res.status(404).json({ msg: 'User not found' });
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
];

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ msg: 'User not found' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};