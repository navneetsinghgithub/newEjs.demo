const mongoose = require("mongoose")
const bokingSchema = new mongoose.Schema({
    doctorId:
        { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
    patientId:
        { type:  mongoose.Schema.Types.ObjectId, ref: "patient" },
    date:
        { type: String },
    title:
        { type: String },
    fees:
        { type: Number },
    status:
        { type: String },   //Reject = 0 , accept = 1

}, { timestamps: true })
const boking = mongoose.model("boking", bokingSchema)
module.exports = boking