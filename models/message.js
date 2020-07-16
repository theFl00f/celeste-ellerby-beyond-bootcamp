var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var messageSchema = new Schema({
    body: String,
    user: {
        id: String,
        nickname: String
    },
}, {timestamps: {createdAt: 'created_at'}})

module.exports = mongoose.model('Message', messageSchema)
