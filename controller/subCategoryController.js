
const subCategoryModel = require("../model/subCategoryModel")
const { Validator } = require("node-input-validator")
const { imageupload, checkValidation } = require("../middleWare/helper")
const session = require("express-session")

module.exports = {
    addSubCategory: async (req, res) => {
        try {
            if (!req.session.users) {
                res.redirect("/loginPage")
            }
            const v = new Validator(req.body, {
                name: "required",
                categoryId: "required",
            })
            let errorResponse = await checkValidation(v)
            if (errorResponse) {
                return res.json({
                    success: false,
                    status: 404,
                    message: errorResponse,
                    body: {}
                })
            }
            if (req.files && req.files.image.name) {
                const image = req.files.image;
                if (image) req.body.image = imageupload(image, "userImage");
            }
            const data = await subCategoryModel.create({
                name: req.body.name, image: req.body.image,
                categoryId: req.body.categoryId
            })
            res.redirect("/getSubCategory")
        } catch (error) {
            console.log(error, "error");
        }
    },

    getSubCategory: async (req, res) => {
        try {
            if (!req.session.users) {
                res.redirect("/loginPage")
            }
            const Data = await subCategoryModel.find().populate("categoryId")
            res.render("category/subcategory", { Data, session: req.session.users })
        } catch (error) {
            console.log(error, "error");
        }
    },

    findSingleSubCategory: async (req, res) => {
        try {
            const data = await subCategoryModel.findById({
                _id: req.params.id
            }).populate("categoryId")
        } catch (error) {
            console.log(error, "error");
        }
    },

    updateSubCategory: async (req, res) => {
        try {
            if (req.files && req.files.image.name) {
                const image = req.files.image;
                if (image) req.body.image = imageupload(image, "userImage");
            }
            const data = await subCategoryModel.findByIdAndUpdate({
                _id: req.body.id
            }, { name: req.body.name, categoryId: req.body.categoryId, image: req.body.image }, { new: true })
            res.redirect("/getSubCategory")
        } catch (error) {
            console.log(error, "error");
        }
    },

    deleteSubCategory: async (req, res) => {
        try {
            const data = await subCategoryModel.findByIdAndDelete({
                _id: req.body.id
            })
        } catch (error) {
            console.log(error, "error");
        }
    },
}