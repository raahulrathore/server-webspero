const router = require("express").Router();
const { User, validate } = require("../models/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

router.post("/", async (req, res) => {
  try {
    // console.log(req.body, "body");
    const { error } = validate(req.body);
    // console.log("9--", error);
    if (error)
      return res.status(400).send({ message: error.details[0].message });
    // console.log(error, "error");
    const user = await User.findOne({ email: req.body.email });
    // console.log("userrrr", user);
    if (user)
      return res
        .status(409)
        .send({ message: "User with given email already Exist!" });

    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    // const hashPassword = await bcrypt.hash(req.body.password, salt); req.body.password
    // console.log("21----", req.body);
    await new User({
      ...req.body,
      password: req.body.password,
      photo: "",
    }).save();
    // await new User({ ...req.body, password: hashPassword }).save();
    // console.log("user created");
    res.status(201).send({ message: "User created successfully" });
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

router.get("/profile", async (req, res) => {

  try {
    // let user = req.user;
    const user = await User.findOne({ id: req.body.userId });
    //   console.log("user", user.location.coordinates["lat"]);
    let lang = user.location.coordinates["lat"];
    let lat = user.location.coordinates["lng"];
    //   console.log("lat", lat, lang, "---------", user);
    const opt = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lang, lat],
          },
        },
      },
    };
    nearUser = await User.find(opt).limit(5);
    //   console.log(nearUser, "---nearBy");
    let userArr = [];
    if (nearUser.length > 0) {
      nearUser.forEach((data) => {
        let serializedData = {
          name: data.firstName + " " + data.lastName,
          email: data.email,
          mobile: data.mobile,
          photo: data.photo,
        };

        userArr.push(serializedData);
      });
    }
    return res.status(200).json({
      message: "Nearest user fetched successfully",
      result: userArr,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Unable to fetch data",
      success: false,
    });
  }
 
});
/*
router.get("/nearest-user", async (req, res) => {
  try {
  // let user = req.user;
  const user = await User.findOne({ email: req.body.email });
  console.log("user", user.location.coordinates["lat"]);
  let lang = user.location.coordinates["lat"];
  let lat = user.location.coordinates["lng"];
  console.log("lat", lat, lang, "---------", user);

  //   const opt = {location:{
  // 	$geoWithin:{
  // 		$centerSphere:[[lat,lang],20000/3963.2]
  // 	}
  //   }}
  const opt = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lang, lat],
        },
      },
    },
  };
  nearUser = await User.find(opt).limit(5);
  console.log(nearUser, "---nearBy");
  
  let userArr = [];

  if (nearUser.length > 0) {
    nearUser.forEach((data) => {
      let serializedData = {
        name: data.firstName + ' ' + data.lastName,
        email: data.email,
        phone: data.mobile,
      };

      userArr.push(serializedData);
    });
  }

  return res.status(200).json({
    message: "Nearest user fetched successfully",
    result: userArr,
  });
  
  
    } catch (err) {
      return res.status(500).json({
        message: "Unable to fetch data",
        success: false,
      });
    }
});
*/
const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, uuidv4() + "." + ext);
  },
});
const fileFilter = (req, file, cb) => {
  const isValid = !!MIME_TYPE_MAP[file.mimetype];
  let error = isValid ? null : new Error("Invalid mime type!");
  cb(error, isValid);
};

let upload = multer({ storage, fileFilter });

// router.patch("/current-profile", async (req, res) => {
router
  .route("/current-profile")
  .patch(upload.single("photo"), async (req, res) => {
    let user;
    try {
      // console.log("req.body", req.file);
      // req.file.filename = req.file.filename+'.'+'png'
      console.log("body--", req.body);
      let firstName = req.body.firstName;
      let lastName = req.body.lastName;
      let email = req.body.email;
      let mobile = req.body.mobile;
      let photo = req.file?.filename;
      // console.log('photoo',photo)
      user = await User.findOne({ email: req.body.email });
      console.log('user--',user)
      
      user.firstName = firstName;
      user.lastName = lastName;
      user.email = email;
      user.mobile = mobile;
      if(photo){
        user.photo = photo
      }
      console.log('upd--',user)
     
    } catch (err) {
      console.log(err);
    }
    try {
      await user.save();
      res.status(201).json({
        message: "Updated data",
        user,
      });
    } catch (e) {
      console.log(e);
    }
  });
module.exports = router;
