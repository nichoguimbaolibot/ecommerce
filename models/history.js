var express = require("express");
var router = express.Router();
var mongoose = require("mongoose");
var User = require("../models/user");
var Schema = mongoose.Schema;


var historySchema = new mongoose.Schema({
	customer: String,
    date: { type: Date, default: Date.now},
    paid: {type: Number, default: 0},
    item: {type: Schema.Types.ObjectId, ref: "Product"}
});

module.exports = mongoose.model("History", historySchema);
