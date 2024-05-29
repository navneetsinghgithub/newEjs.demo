const mongoose = require("mongoose")
const cmsSchema = new mongoose.Schema({
    title:
        { type: String },
    content:
        { type: String },
    type:
        { type: Number }  ///   1 =term & condition ,2 = privacy ,  3= About us  ////

})
const cms = mongoose.model("cms", cmsSchema)
module.exports = cms