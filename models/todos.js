const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    reminder: {
        type: Boolean
    }
})

const todos = mongoose.model('Todos', userSchema);
module.exports = todos;


