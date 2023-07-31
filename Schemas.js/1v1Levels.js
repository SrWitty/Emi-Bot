const { model, Schema } = require("mongoose");
 
let duelslevelSchema = new Schema({
    Guild: String,
    User: String,
    Rank: Number,
    Level: Number
})
 
module.exports = model("duelslevel", duelslevelSchema);