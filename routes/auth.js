const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Usera = require("../models/Usera");

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err)
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json("user not found"); // Exit the function after sending response
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json("wrong password"); // Exit the function after sending response
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//partie speciale pour les assureurs 

//REGISTER assureur
router.post("/registerassureur", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create new assureur
    const newUsera = new Usera({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      assureur: req.body.assureur,
    });

    //save assureur and respond
    const usera = await newUsera.save();
    res.status(200).json(usera);
  } catch (err) {
    res.status(500).json(err)
  }
});

//LOGIN
router.post("/loginassureurs", async (req, res) => {
  try {
    const usera = await Usera.findOne({ email: req.body.email });
    !usera && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(req.body.password, usera.password)
    !validPassword && res.status(400).json("wrong password")

    res.status(200).json(usera)
  } catch (err) {
    res.status(500).json(err)
  }
});




module.exports = router;
