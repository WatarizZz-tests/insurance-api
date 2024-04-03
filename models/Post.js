const mongoose = require("mongoose");

// schema database
const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    nom: {
      type: String,
      max: 30,
    },
    prenom: {
      type: String,
      max: 30,
    },
    assurance: {
      type: String,
      max: 10,
    },
    police: {
      type: String,
      max: 30,
    },
    img: {
      // type: String,
      type: Array,
      default: [],
    },
    effexp: {
      type: Array,
      default: [],
    },
    garanties: {
      type: Array,
      default: [],
    },
    datelieu: {
      type: Array,
      default: [],
    },
    nature: {
      type: String,
      max: 30,
    },
    etat: {
      type: String,
      max: 30,
    },
    request: {
      type: String,
      max: 30,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
