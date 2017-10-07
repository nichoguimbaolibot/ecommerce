var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../models/user");
var Schema = mongoose.Schema;


var commentSchema = new mongoose.Schema({
    text: String,
    createdAt: { type: Date, default: Date.now },
    author: {
          id: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User"
          },
          email: String
    }
});

module.exports = mongoose.model("Comment", commentSchema);
