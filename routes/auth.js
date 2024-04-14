const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Usera = require("../models/Usera");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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


//RECOVER PASSWORD 

router.post('/forgot-password', (req, res) => {
  
  User.findOne({email:req.body.email})
  .then(user => {
      if(!user) {
          return res.send({Status: "Aucun Email correspondant"})
      } 
      const token = jwt.sign({id: user._id}, "jwt_secret_key", {expiresIn: "1d"})
      var transporter = nodemailer.createTransport({
          service: 'Hotmail',
          auth: {
            user: 'wassimnaruto@live.fr',
            pass: 'navaja25'
          }
        });
        
        var mailOptions = {
          from: 'wassimnaruto@live.fr',
          to: 'user email@gmail.com',
          subject: 'Reinitialisation du mot de passe',
          text: `
    Cher utilisateur,

    Vous avez récemment demandé à réinitialiser votre mot de passe pour notre plateforme. Pour procéder à la réinitialisation, veuillez cliquer sur le lien ci-dessous :

    http://localhost:3000/reset_password/${user._id}/${token}

    Si vous n'avez pas effectué cette demande de réinitialisation de mot de passe, veuillez ignorer cet e-mail. La sécurité de votre compte est importante pour nous.

    Cordialement,
    Leet'z Assurance
  `
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
            return res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
          } else {
            return res.status(200).json({ message: "Email de réinitialisation envoyé avec succès" });
          }
        });
  })
  .catch(err => {
    console.error(err);
    return res.status(500).json({ message: "Une erreur s'est produite lors de la récupération de l'utilisateur" });
  });
})



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
