const categoryModel = require("../model/categoryModel")
const { Validator } = require("node-input-validator")
const { imageupload, checkValidation } = require("../middleWare/helper")

module.exports = {
    createCategory: async (req, res) => {
        try {
            if (!req.session.users) {
                res.redirect("/loginPage")
            }
            const v = new Validator(req.body, {
                name: "required",
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
            const data = await categoryModel.create({
                name: req.body.name, image: req.body.image
            })
            res.redirect("/getCategory")
        } catch (error) {
            console.log("error");
        }
    },

    getCategory: async (req, res) => {
        try {
            if (!req.session.users) {
                res.redirect("/loginPage")
            }
            const Data = await categoryModel.find()
            res.render("category/category", { Data, session: req.session.users })
        } catch (error) {
            console.log(error, "error");
        }
    },

    findSingleCategory: async (req, res) => {
        try {
            const data = await categoryModel.findById({
                _id: req.params.id
            })
        } catch (error) {
            console.log(error, "error");
        }
    },

    updateCategory: async (req, res) => {
        try {
            if (req.files && req.files.image.name) {
                const image = req.files.image;
                if (image) req.body.image = imageupload(image, "userImage");
            }
            const data = await categoryModel.findByIdAndUpdate({
                _id: req.body.id
            }, { name: req.body.name, image: req.body.image }, { new: true })
            res.redirect("/getCategory")
        } catch (error) {
            console.log(error, "error");
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const data = await categoryModel.findByIdAndDelete({
                _id: req.body.id
            })
        } catch (error) {
            console.log(error, "error");
        }
    },
}