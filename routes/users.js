const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//mettre a jour un utilisateur
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Compte mis a jour !");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Vous ne pouvez mettre a jour que votre compte");
  }
});

//supprimer un utilisateur
router.delete("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.status(200).json("compte supprimé");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("Vous ne pouvez supprimer que votre compte");
  }
});


module.exports = router;
