const mongoose = require('mongoose')
const exerciceSchema = new mongoose.Schema({
    description: String,
    duration: Number,
    date: String,
});

const userSchema = new mongoose.Schema({
    username: {type: String, required: true },
    log: [exerciceSchema]
});

module.exports = mongoose.model('User', userSchema)