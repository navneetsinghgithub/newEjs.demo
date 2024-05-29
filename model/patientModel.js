const mongoose = require("mongoose")
const patientSchema = new mongoose.Schema({
    name:
        { type: String },
    age:
        { type: Number },
    phone:
        { type: Number },
    email:
        { type: String },
    password:
        { type: String },
    image:
        { type: String },
    status:
        { type: String }, ///// reject = 0 , pending = 1 , accept = 2

}, { timestamps: true })
const patient = mongoose.model("patient", patientSchema)
module.exports = patient