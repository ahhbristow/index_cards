var mongoose = require('mongoose');

var CardSchema = new mongoose.Schema({
	text: String,
	x: Number,
	y: Number,
	type: String
});

var SessionSchema = new mongoose.Schema({
	id: Number,
    	name: String,
	cards: [CardSchema]
});

module.exports = mongoose.model('Session', SessionSchema);
