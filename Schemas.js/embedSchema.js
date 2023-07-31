const { model, Schema } = require('mongoose');
 
let embedSchema = new Schema({
    MessageID: String,
    ChannelID: String,
    UserID: String,
    GuildID: String,
    Title: {type: String, default: 'Embed Builder'},
    Author: {type: String, default: ' '},
    Description: {type: String, default: ' '},

    Footer: {type: String, default: 'Xuân Hạ Thu Đông'},
    Timestamp: {type: String, default: '0'},
    Image: {type: String, default: ' '},
    Thumbnail: {type: String, default: ' '},
    Color: {type: String, default: ' '}
})
 
module.exports = model('embedSchema', embedSchema);