const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: Number, required: false },
    mobile: { type: Number, required: true },
    zip: { type: Number, required: true },
    location: {
      type: {
        type: String,
      },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
    },
    photo:{type:String}
  },
  { timestamps: true }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
    expiresIn: "7d",
  });
  return token;
};
// console.log(userSchema, "before userSchema");
userSchema.index({ location: "2dsphere" });
const User = mongoose.model("user", userSchema);
console.log(userSchema, "userSchema");

const validate = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: passwordComplexity().required().label("Password"),
    phone: Joi.number().required().not().label("Phone"),
    mobile: Joi.number().required().label("Mobile"),
    zip: Joi.number().required().label("Zip Code"),
    // location: Joi.object().pattern(/.*/, [
    //   Joi.string(),
    //  Joi.object().pattern(/.*/, [Joi.number(),Joi.number()])
    // ]),
    location: {
      type: Joi.string().label("Type"),
      coordinates: {
        lat: Joi.number().label("lat"),
        lng: Joi.number().label("lng"),
      },
      //   coords: Joi.array().items(Joi.number(), Joi.number()),
    },
    
  });
  return schema.validate(data);
};

const userProfile = async (req, res) => {
  try {
    let user = req.user;
    if (user) {
      userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
      };

      return res.status(200).json({
        message: "Profile data fetched successfully",
        success: true,
        result: userData,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Unable to fetched user profile",
      success: false,
    });
  }
};

module.exports = { User, validate, userProfile };
