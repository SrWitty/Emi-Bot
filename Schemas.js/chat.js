const { model, Schema } = require('mongoose');
 
let chatSchema = new Schema({    
    MemberID: String,
    ChannelId: String,
    AskedForSuport: Boolean
})
 
module.exports = model('chatSchema', chatSchema);