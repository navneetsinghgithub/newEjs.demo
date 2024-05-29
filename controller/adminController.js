const Mongoose = require("mongoose")
const cmsModel = require("../model/cmsModel")
const userModel = require("../model/userModel")
const categoryModel = require("../model/categoryModel")
const subcategoryModel = require("../model/subCategoryModel");
const bokingModel = require("../model/bokingModel")
const patientModel = require("../model/patientModel")
const doctorModel = require("../model/doctorModel")
const session = require("express-session");
const { addSubCategory } = require("./subCategoryController");
const { tokenGenerate } = require("../jwt/jsonWebToken")
const bcrypt = require("bcrypt")
const { Validator } = require("node-input-validator")
const { imageupload, checkValidation } = require("../middleWare/helper");
const saltRound = 10

module.exports = {
  dashboard: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const doctor = await doctorModel.find().count()
      const patient = await patientModel.find().count()
     const boking = await bokingModel.find().count()

     const monthlyBooking = await bokingModel.aggregate([
      {
        $match: {
          createdAt: { $exists: true },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    const monthBook = [];
    const countBook = [];

    const bookmonthCountMap = new Map();

    monthlyBooking.forEach((item) => {
      const { month } = item._id;
      bookmonthCountMap.set(month, item.count);
    });

    for (let month = 1; month <= 12; month++) {
      monthBook.push(month);
      countBook.push(bookmonthCountMap.get(month) || 0);
    }
      const msg = req.flash("msg");
      return res.render("common/dashboard", {
        session: req.session.users,
        msg,
        doctor: doctor,
        patient: patient,
        boking:boking,
        monthBook,
        countBook,
      });
    } catch (error) {
      console.log(error);
    }
  },
  signup: async (req, res) => {
    try {
      const v = new Validator(req.body, {
        name: "required",
        email: "required",
        password: "required"
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
      const email = await userModel.findOne({
        email: req.body.email,
      })
      if (email) {
        return res.json({
          success: false,
          status: 400,
          message: "email already exist",
          body: {}
        })
      }
      const contact = await userModel.findOne({
        contact: req.body.contact
      })
      // if (contact) {
      //     return res.json({
      //         success: false,
      //         status: 400,
      //         message: "contact number already exist",
      //         body: {}
      //     })
      // }
      if (req.files && req.files.image.name) {
        const image = req.files.image;
        if (image) req.body.image = imageupload(image, "userImage");
      }
      const password = await bcrypt.hash(req.body.password, saltRound)
      const data = await userModel.create({
        name: req.body.name, lastname: req.body.lastname, email: req.body.email,
        password: password, image: req.body.image, contact: req.body.contact, role: req.body.role,
        status: req.body.status
      })
      const token = await tokenGenerate(data._id)
      const updateResult = await userModel.findByIdAndUpdate({
        _id: data._id
      }, { token: token.token, logintime: token.time }, { new: true })

      return res.json({
        success: true,
        status: 200,
        message: "user created",
        body: updateResult
      })
    } catch (error) {
      console.log(error, "error");
      return res.json({
        success: false,
        status: 400,
        message: "error user not created",

      })
    }
  },

  loginPage: async (req, res) => {
    try {
      const msg = req.flash("msg");
      res.render("common/Login", { msg })
    } catch (error) {
      console.log(error);
    }
  },
  login: async (req, res) => {
    try {
      let login = await userModel.findOne({ email: req.body.email })
      if (!login) {
        req.flash("msg", "Data not found")
        res.redirect('/loginPage')
      }
      else if (login.isVerified === 0) {
        req.flash("msg", "not verified")
        res.redirect('/loginPage')
      }
      const password = await bcrypt.compare(req.body.password, login.password);
      if (!password) {
        req.flash("msg", "wrong password")
        res.redirect('/loginPage')
      } else {
        req.session.users = login
        req.flash("msg", "Login successfully")
        res.redirect("/dashboard")
      }
    } catch (error) {
      console.log(error, "error");
    }
  },

  profile: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      res.render("common/profile", { session: req.session.users })
    } catch (error) {
      console.log(error);
    }
  },
  getAdminProfile: async (req, res) => {
    try {
      const getProfile = await userModel.findById({
        _id: req.params.id
      })
      return res.json({
        success: true,
        status: 200,
        message: " get profile successful",
        body: getProfile
      })
    } catch (error) {
      return res.json({
        success: false,
        status: 400,
        message: "error",
      })
    }
  },
  editProfile: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const msg = req.flash("msg");
      res.render("common/editProfile", { session: req.session.users, msg })
    } catch (error) {
      console.log(error);
    }
  },

  updateAdminProfile: async (req, res) => {
    try {
      if (!req.session.users || !req.session.users._id) {
        return helper.failed(res, "User session not found or missing _id");
      }
      if (req.files && req.files.image.name) {
        const image = req.files.image;
        if (image) req.body.image = imageupload(image, "userImage");
      }
      const updateAdminProfile = await userModel.findByIdAndUpdate({
        _id: req.session.users._id
      }, { name: req.body.name, image: req.body.image, contact: req.body.contact }, { new: true })
      let login = await userModel.findOne({ _id: req.session.users._id })
      req.session.users = login
      res.redirect("/dashboard")
      res.flash("msg", "updated admin profile")
    } catch (error) {
      console.log(error);
    }
  },

  changePasswordPage: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const msg = req.flash("msg");
      res.render("common/ChangePassword.ejs", { session: req.session.users, msg })
    } catch (error) {
      console.log(error);
    }
  },
  changePassword: async (req, res) => {
    try {
      const data = await userModel.findOne({ _id: req.session.users._id })
      const decryptPassword = await bcrypt.compare(req.body.oldPassword, data.password)
      if (decryptPassword == false) {
        req.flash('error', 'Old pass does not match')
      }
      const encryptPassword = await bcrypt.hash(req.body.newPassword, saltRound)
      data.password = encryptPassword
      data.save()
      req.flash("success", "password updated successfully")
      return res.redirect('/changePasswordPage')
    } catch (error) {
      console.log(error, "error");
    }
  },


  userView: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      let Data = await userModel.findOne({ _id: req.params.id })
      res.render("common/userView", { session: req.session.users, Data })
    } catch (error) {
      console.log(error, "error");
    }
  },

  ////////////////////cms///////////////////
  termConditionPage: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.render("/login")
      }
      let data = await cmsModel.findOne({
        type: 1
      })
      res.render("cms/termCondition", { session: req.session.users, data })
    } catch (error) {
      console.log(error);
    }
  },

  privacyPolicy: async (req, res) => {
    try {
      const data = await cmsModel.findOne({
        type: 2
      })
      res.render("cms/privacyPolicy", { session: req.session.users, data })
    } catch (error) {
      console.log(error);
    }
  },

  aboutUss: async (req, res) => {
    try {
      const data = await cmsModel.findOne({
        type: 3
      })
      res.render("cms/aboutUs", { session: req.session.users, data })
    } catch (error) {
      console.log(error);
    }
  },

  /////////////////////////////Category/////////////////////
  addCategory: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      res.render("category/addCategory", { session: req.session.users })
    } catch (error) {
      console.log(error, "error");
    }
  },

  categoryView: async (req, res) => {
    try {

      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const Data = await categoryModel.findOne({ _id: req.params.id })
      res.render("category/categoryView", { Data, session: req.session.users })
    } catch (error) {
      console.log(error, "error");
    }
  },

  editCategory: async (req, res) => {
    try {
      const data = await categoryModel.findById({
        _id: req.params.id
      })

      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      res.render("category/editCategory", { session: req.session.users, data })
    } catch (error) {
      console.log(error, "error");
    }
  },



  addSubCategory: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const DataCategory = await categoryModel.find();
      res.render("category/addSubCategory", { session: req.session.users, DataCategory })
    } catch (error) {
      console.log(error, "error");
    }
  },

  subCategoryView: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const Data = await subcategoryModel.findOne({ _id: req.params.id }).populate("categoryId")
      res.render("category/subCategoryView", { Data, session: req.session.users })
    } catch (error) {
      console.log(error, "error");
    }
  },
  editSubCategory: async (req, res) => {
    try {
      const DataCategory = await subcategoryModel.find();
      const data = await subcategoryModel.findById({
        _id: req.params.id
      })
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      res.render("category/editSubCategory", { session: req.session.users, data, DataCategory })
    } catch (error) {
      console.log(error, "error");
    }
  },

  //////////////////////////////////booking////////

  booking: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const bokingData = await bokingModel.find().populate(['doctorId', 'patientId'])
      res.render("booking/boking", { session: req.session.users, bokingData })

     
    } catch (error) {
      console.log(error, "error");
    }
  },
  
  bookingView: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const Data = await bokingModel.findOne({ _id: req.params.id }).populate(['doctorId', 'patientId'])
      res.render("booking/bookingView", { session: req.session.users, Data })
    } catch (error) {
      console.log(error, "error");
    }
  },


  doctor: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const getDData = await doctorModel.find()
      res.render("booking/doctor", { session: req.session.users, getDData })
    } catch (error) {
      console.log(error, "error");
    }
  },

  addDoctor: async (req, res) => {
    try {

      const validator = new Validator(req.body, {
        doctorCategory: "required",
        title: "required",
        date: "required",
        name: "required",
      });
      const errorResponse = await checkValidation(validator);

      if (errorResponse) {
        console.log('Validation error:', errorResponse);

      }

      if (!req.session.users) {
        return res.redirect("/loginPage")
      }

      const docData = await categoryModel.find()
      const patData = await patientModel.find()
      res.render("booking/addDoctor", { session: req.session.users, docData, patData })
    } catch (error) {
      console.log(error);
    }
  },

  doctorView: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const Data = await doctorModel.findOne({ _id: req.params.id })
      res.render("booking/doctorView", { session: req.session.users, Data })
    } catch (error) {
      console.log(error);
    }
  },

  patient: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const getData = await patientModel.find()
      res.render("booking/patient", { session: req.session.users, getData })
    } catch (error) {
      console.log(error, "error");
    }
  },
  patientView: async (req, res) => {
    try {
      if (!req.session.users) {
        return res.redirect("/loginPage")
      }
      const Data = await patientModel.findOne({ _id: req.params.id })
      res.render("booking/patientView", { session: req.session.users, Data })
    } catch (error) {
      console.log(error);
    }
  },

  logout: async (req, res) => {
    try {
      delete req.session.users
      res.redirect('/loginPage')
    } catch (error) {
      console.log(error, "error");
    }
  },


  // getUser: async (req, res) => {
  //   try {
  //       if (!req.session.users) {
  //           res.redirect("/loginPage")
  //       }
  //       let Data = await userModel.find({ role: 1 })
  //       res.render("common/user", { Data, session: req.session.users })
  //   } catch (error) {
  //       console.log(error)

  //   }
  // },


}