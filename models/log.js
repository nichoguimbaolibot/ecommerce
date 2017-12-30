var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var LogSchema = new Schema({
	name: String,
	email: String,
	accountType: String,
	login: Date,
	logout: Date
});

module.exports = mongoose.model("Log", LogSchema);