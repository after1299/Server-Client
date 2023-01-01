const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").userModel;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
    console.log("A request is coming in to auth.js.");
    next();
})

router.get("/testAPI", (req, res) => {
    const msgObj = {
        message: "Test API is working."
    }
    return res.json(msgObj);
})

router.post("/register", async (req, res) => {
    // console.log("Register!!");
    // console.log(registerValidation(req.body));
    const {error} = registerValidation(req.body);
    // console.log(error.details);
    if(error) return res.status(400).send(error.details[0].message)

    // check if user exists
    const emailExist = await User.findOne({email: req.body.email});
    if(emailExist) {
        return res.status(400).send("Email has already been register.");
    } else {
        const newUser = new User({
            email: req.body.email,
            username: req.body.username,
            password: req.body.password,
            role: req.body.role,
        });
        try {
            // we don't nned to hash password this step because we have set up the middleware in user schema.
            // Once user saved, password will be hash automatically.
            const savedUser = await newUser.save();
            res.status(200).send({
                msg: "success",
                savedObject: savedUser,
            })
        } catch(err) {
            res.status(400).send("failure.")
        }
    }
})

router.post("/login", (req, res) => {
    const {error} = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    User.findOne({email: req.body.email}, function(err, user) {
        if(err) {
            res.status(400).send(err);
        } else if(!user){
            res.status(401).send("User not found.");
        } else {
            user.comparePassword(req.body.password, function(err, isMatch) {
                if(err) return res.status(400).send(err);
                else if(isMatch) {
                    const tokenObject = {_id: user._id, email: user.email};
                    const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET);
                    res.send({success: true, token: "JWT "+token, user}); // "JWT "後面記得加空白建!!!
                }
            })
        }
    })
})

module.exports = router;