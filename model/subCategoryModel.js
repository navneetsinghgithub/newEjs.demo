const mongoose = require("mongoose")
const subCategorySchema = new mongoose.Schema({
    name:
        { type: String },
    image:
        { type: String },
    categoryId:
        { type: mongoose.Schema.Types.ObjectId, ref: "category" }
})
const subCategory = mongoose.model("subCategory", subCategorySchema)
module.exports = subCategory