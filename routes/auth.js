const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const Usera = require("../models/Usera");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const checkPrimeAccount = require('../middleware/checkPrimeAccount');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


const primeAccountId = process.env.PRIME_ACCOUNT_ID;

let primeAccountObjectId;
try {
  primeAccountObjectId = new ObjectId(primeAccountId);
} catch (err) {
  console.error("Invalid PRIME_ACCOUNT_ID format:", err);
}

//REGISTER
router.post("/register", async (req, res) => {
  try {
    // Generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    // Save user and respond
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error
      if (err.keyPattern.email) {
        res.status(400).json({ errorCode: "email_already_registered" });
      } else if (err.keyPattern.username) {
        res.status(400).json({ errorCode: "username_already_taken" });
      }
    } else {
      res.status(500).json({ errorCode: "generic_error" });
    }
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


// RECOVER PASSWORD
router.post('/forgot-password', async (req, res) => {
  try {
    console.log('Received password recovery request for email:', req.body.email);

    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log('User not found for email:', req.body.email);
      return res.status(404).json({ message: "Aucun Email correspondant" });
    }

    console.log('User found:', user);

    // Generate token
    const token = jwt.sign({ id: user._id }, "jwt_secret_key", { expiresIn: "1d" });
    console.log('Generated JWT token:', token);

    // Retrieve language from query parameters
    const lang = req.query.lang || 'fr'; // Default to 'fr' if not provided
    console.log('Language:', lang);

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // ssl
      auth: {
        user: "nodemailerpassrec@zohomail.com",
        pass: "DangDang99"
      }
    });

    console.log('Nodemailer transporter created.');

    const mailOptions = {
      from: 'nodemailerpassrec@zohomail.com',
      to: req.body.email,
      subject: lang === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Reinitialisation du mot de passe',
      text: lang === 'ar' ? `
عزيزي المستخدم،

لقد طلبت مؤخرًا إعادة تعيين كلمة المرور الخاصة بك لمنصتنا. للمتابعة مع إعادة التعيين، يرجى النقر على الرابط أدناه:

https://leet-z-assurance.vercel.app/${lang}/reset_password/${user._id}/${token}

إذا لم تكن قد طلبت هذا الإجراء لإعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني. أمان حسابك مهم بالنسبة لنا.

مع خالص التحيات،
شركة  للتأمين
      ` : `
Cher utilisateur,

Vous avez récemment demandé à réinitialiser votre mot de passe pour notre plateforme. Pour procéder à la réinitialisation, veuillez cliquer sur le lien ci-dessous:

https://leet-z-assurance.vercel.app/${lang}/reset_password/${user._id}/${token}

Si vous n'avez pas effectué cette demande de réinitialisation de mot de passe, veuillez ignorer cet e-mail. La sécurité de votre compte est importante pour nous.

Cordialement,
Don't Worry
      `
    };

    console.log('Mail options set:', mailOptions);

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error while sending email:', error);
        return res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: "Email de réinitialisation envoyé avec succès" });
      }
    });
  } catch (err) {
    console.error('Error during password recovery:', err);
    return res.status(500).json({ message: "Une erreur s'est produite lors de la récupération de l'utilisateur" });
  }
});
//CHANGE PASSWORD 
router.post('/reset-password/:id/:token', (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.status(500).json({ Status: "Error with token" });
    } else {
      bcrypt.hash(password, 10)
        .then(hash => {
          User.findByIdAndUpdate({ _id: id }, { password: hash })
            .then(u => res.status(200).json({ Status: "Success" }))
            .catch(err => res.status(500).json({ Status: err }));
        })
        .catch(err => res.status(500).json({ Status: err }));
    }
  });
});



//partie speciale pour les assureurs 

// REGISTER assureur
router.post("/registerassureur", checkPrimeAccount, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const newUsera = new Usera({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      assureur: req.body.assureur,
    });
    const usera = await newUsera.save();
    res.status(200).json(usera);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN assureur
router.post("/loginassureurs", async (req, res) => {
  try {
    const usera = await Usera.findOne({ email: req.body.email });
    if (!usera) return res.status(404).json("user not found");
    const validPassword = await bcrypt.compare(req.body.password, usera.password);
    if (!validPassword) return res.status(400).json("wrong password");
    res.status(200).json(usera);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all users
router.get("/users", checkPrimeAccount, async (req, res) => {
  try {
    const users = await Usera.find({ _id: { $ne: primeAccountObjectId } });
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err); // Log the error for debugging
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE user
router.delete("/users/:id", checkPrimeAccount, async (req, res) => {
  try {
    await Usera.findByIdAndDelete(req.params.id);
    res.status(200).json("User deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE user password
router.put("/users/:id/password", checkPrimeAccount, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await Usera.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json("Password updated");
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE prime user password
router.put("/prime/password", checkPrimeAccount, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    await Usera.findByIdAndUpdate(req.user._id, { password: hashedPassword });
    res.status(200).json("Prime password updated");
  } catch (err) {
    console.error("Error updating prime password:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
