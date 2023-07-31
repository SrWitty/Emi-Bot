const {model, Schema} = require("mongoose");

let notifyschema = new Schema ({
    Guild: String,
    ID: String,
    Channel: String,
    Latest: Array,
    Message:  String,
    PingRole: String
})

module.exports = model("notif", notifyschema)