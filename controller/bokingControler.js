const bokingModel = require("../model/bokingModel")
const patientModel = require("../model/patientModel")
const doctorModel = require("../model/doctorModel")
const { imageupload } = require("../middleWare/helper")
const bcrypt = require("bcrypt")
const saltRound = 10


module.exports = {
    createBoking: async (req, res) => {
        try {
            const dataBook = await bokingModel.create({
                doctorId: req.body.doctorId, patientId: req.body.patientId,
                date: req.body.date, status: req.body.status, title: req.body.title, fees: req.body.fees
            })
            res.redirect("/booking")
        } catch (error) {
            console.log(error, "error");
        }
    },

    getBoking: async (req, res) => {
        try {
            if (!req.session.users) {
                res.redirect("/loginPage")
            }
            const getData = await bokingModel.find().populate({
                path: 'doctorId',
                select: 'name'
            })
                .populate({
                    path: 'patientId',
                    select: 'name'
                });

            res.render("booking/boking", { getData, session: req.session.users })
        } catch (error) {
            console.log(error, "error");
        }
    },

    getSingleBoking: async (req, res) => {
        try {
            if (!req.session.users) {
                res.redirect("/loginPage")
            }
            const getData = await bokingModel.findOne({
                _id: req.params.id
            })
            return res.json({
                status: 200,
                message: "get single",
                body: getData
            })
        } catch (error) {
            console.log(error, "error");
        }
    },
    bookingStatus: async (req, res) => {
        try {
            console.log(req.params,"-----params----");
          const data = await bokingModel.findByIdAndUpdate({
            _id: req.params.id
          }, { status: req.body.status }, { new: true })
         
          return res.status(200).json({
            code: 200,
            msg: req.flash("msg", "Status update successfully"),
          });
        } catch (error) {
          console.log(error, "error");
        }
      },

    //////////////////////////////////patient controller//////////////////////////
    addPatient: async (req, res) => {
        try {
            const password = await bcrypt.hash(req.body.password, saltRound)
            if (req.files && req.files.image.name) {
                const image = req.files.image;
                if (image) req.body.image = imageupload(image, "userImage");
            }
            const data = await patientModel.create({
                name: req.body.name, age: req.body.age,
                image: req.body.image, phone: req.body.phone,
                email: req.body.email, password: password, status: req.body.status
            })
            return res.json({
                status: 200,
                message: "added patient succ",
                body: data
            })
        } catch (error) {
            console.log(error, "error");
        }
    },

    getPatient: async (req, res) => {
        try {
            const getDatas = await patientModel.findById({ _id: req.body.patientId })
            res.send(getDatas)
        } catch (error) {
            console.log(error, "error");
        }
    },
    pStatus: async (req, res) => {
        try {
            const data = await patientModel.findByIdAndUpdate({
                _id: req.params.id
            }, { status: req.body.status }, { new: true })
            return res.status(200).json({
                code: 200,
                msg: req.flash("msg", "Status update successfully"),
            });
        } catch (error) {
            console.log(error, "error");
        }
    },

    ///////////////////////////////Doctor Controller/////////////////////
    addDoctor: async (req, res) => {
        try {
            if (req.files && req.files.image.name) {
                const image = req.files.image;
                if (image) req.body.image = imageupload(image, "userImage");
            }
            const data = await doctorModel.create({
                name: req.body.name, age: req.body.age,
                image: req.body.image, phone: req.body.phone, status: req.body.status, fees: req.body.fees,
                doctorId: req.body.doctorId,doctorCategory:req.body.doctorCategory
            })
            res.redirect("/booking")
        } catch (error) {
            console.log(error, "error");
        }
    },

    getdoctor_data: async (req, res) => {
        try {      
            const getData = await doctorModel.find({doctorCategory:req.body.category}); 
            res.send(getData);
        } catch (error) {
            console.log(error, "error");

        }
    },

    getDoctor: async (req, res) => {
        try {
            const { doctorId, doctorCategory } = req.body;
            let query = { _id: doctorId };
            if (doctorCategory) {
                query = { ...query, doctorCategory };
            }
            const getData = await doctorModel.findOne(query);
            // console.log(getData,"-----t--");
            res.send(getData);
        } catch (error) {
            console.log(error, "error");

        }
    },
    dStatus: async (req, res) => {
        try {
            const data = await doctorModel.findByIdAndUpdate({
                _id: req.params.id
            }, { status: req.body.status }, { new: true })
            return res.status(200).json({
                code: 200,
                msg: req.flash("msg", "Status update successfully"),
            });
        } catch (error) {
            console.log(error, "error");
        }
    },
}