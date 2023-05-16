const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

var userSchema = new Schema({
    "userName": {
        "type":String,
        "unique":true
    },
    "password":String,
    "email":String,
    "loginHistory":[{
        "dateTime":Date,
        "userAgent":String
    }]
});

let User; //to be defined on new connection (see initialize)
//it connect to mongoDB instance
module.exports.initialize = () => {
    return new Promise((resolve,reject) => {
       
        let db = mongoose.createConnection("mongodb+srv://tdwaraha2:Aadhavan@senecaweb.ji8sylh.mongodb.net/?retryWrites=true&w=majority");
        db.on('error', (err) => {
            reject(err);// // reject the promise with the provided error
        })
        db.once('open', () => {
            User = db.model("Users",userSchema);
            resolve("connected to mongodb database");
        })
    })
};

//this function will  perform some data validation (ie: do the passwords match? Is the user name already taken?), return meaningful errors if the data is invalid, as well as saving userData to the database (if no errors occurred).
module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        }
        else {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(userData.password, salt, function(err, hash) {
                    if (err) {
                        reject("error encrypting password");
                    }
                    else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code === 11000) {
                                    reject("User Name already taken");
                                }
                                else {
                                    reject("There was an error creating the user: " + err);
                                }
                            }
                            else {
                                resolve();
                            }
                        })
                    }
                })
            })
        }
    })
};

//this function find the user in the database whose userName property matches userData.userName, the provided password (ie, userData.password) may not match (or the user may not be found at all / there was an error with the query).  In either case,it reject the returned promise with a meaningful message.
module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName})
        .exec()
        .then(users => {if (data.user == ""){
            reject("unable to find user: " + userData.user);
        }
        console.log(userData.password);
            bcrypt.compare(userData.password, users[0].password)
            .then(res => {
                if(res === true) {   
                    users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent:userData.userAgent});
                    User.update(
                        { userName: users[0].userName },
                        { $set: {loginHistory: users[0].loginHistory} },
                        { multi: false }
                    )
                    .exec()
                    .then(() => {resolve(users[0])})
                    .catch(err => {reject("There was an error verifying the user: " + err)})
                }
                else {
                    reject("Incorrect Password for user: " + userData.userName); 
                }
            })
        })
        .catch(() => { 
            reject("Unable to find user: " + userData.userName); 
        }) 
    })
};