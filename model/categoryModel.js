const mongoose = require("mongoose")
const categorySchema = new mongoose.Schema({

    name:
        { type: String },
    image:
        { type: String }
})

const category = mongoose.model("category", categorySchema)
module.exports = category