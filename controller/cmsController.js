const cms = require("../model/cmsModel");
const cmsModel = require("../model/cmsModel")

module.exports = {
    createCms: async (req, res) => {
        try {
            if (!req.session.users) {
                return res.render("/login", { session: req.session.users })
            }
            const data = await cmsModel.create({
                title: req.body.title, content: req.body.content, type: req.body.type
            })
        } catch (error) {
            console.log("error not create cms");
        }
    },

    updateTermCms: async (req, res) => {
        try {
            const data = await cmsModel.findOneAndUpdate({
                type: 1
            }, {
                title: req.body.title,
                content: req.body.editor1
            }, { new: true })
            res.redirect('/termConditionPage')
        } catch (error) {
            console.log(error);
        }
    },

    updatePrivacyCms: async (req, res) => {
        try {
            const data = await cmsModel.findOneAndUpdate({
                type: 2
            }, { title: req.body.title, content: req.body.editor1 }, { new: true })
            res.redirect("/privacyPolicy")
        } catch (error) {
            console.log(error);
        }
    },

    updateAboutCms: async (req, res) => {
        try {
            const data = await cmsModel.findOneAndUpdate({
                type: 3
            }, { title: req.body.title, content: req.body.editor1 }, { new: true })
            res.redirect("/aboutUss")
        } catch (error) {
            console.log(error);
        }
    },

}