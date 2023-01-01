const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50,
    },
    email: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 50,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
        maxLength: 1024,
    },
    role: {
        type: String,
        required: true,
        enum: ["student", "instructor"],
    },
    date: {
        type: Date,
        default: Date.now,
    }
})

// userSchema.methods.isStudent = function() {
//     return this.role == "student";
// }
// userSchema.methods.isInstructor = function() {
//     return this.role == "instructor";
// }

userSchema.method("isStudent", function() {
    return this.role == "student";
})
userSchema.method("isInstructor", function() {
    return this.role == "instructor";
})
userSchema.method("isAdmin", function() {
    return this.role == "admin";
})

// mongoose schema middleware
userSchema.pre("save", async function(next) {
    if(this.isModified(this.password) || this.isNew) {
        this.password = await bcryptjs.hash(this.password, 10);
        next();
    } else {
        return next();
    }
})
userSchema.method("comparePassword", function(password, callback) {
    bcryptjs.compare(password, this.password, (err, isMatch) => {
        if(err) {
            return callback(err, isMatch);
        } else {
            callback(null, isMatch);
        }
    })
})

module.exports = mongoose.model("User", userSchema);