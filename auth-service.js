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

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://arman:arman123@senecaweb.arcergv.mongodb.net/?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise((resolve,reject) => {
        if(userData.password != userData.password2){
            reject("Password do not match");
        }
        else {
            bcrypt.hash(userData.password, 10).then(hash=>{ // Hash the password using a Salt that was generated using 10 rounds
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
            })
            .catch(err=>{
                console.log(err); // Show any errors that occurred during the process
                reject("There was an error encrypting the password");
            });
        }
    })
};


module.exports.checkUser = function (userData) {
    return new Promise((resolve,reject) => {
        User.findOne({ userName: userData.userName })
        .exec()
        .then(user => {
            bcrypt.compare(userData.password, user.password).then((result) => {
                if(result === true) {   
                    user.loginHistory.push({dateTime: (new Date()).toString(), userAgent:userData.userAgent});
                    User.update(
                        { userName: user.userName },
                        { $set: {loginHistory: user.loginHistory} },
                        { multi: false }
                    )
                    .exec()
                    .then(() => {resolve(user)})
                    .catch(err => {reject("There was an error verifying the user: " + err)})
                }
                else {
                    reject("Incorrect Password for user: " + userData.userName); 
                }
            });
                          
                
        })
        .catch(() => { 
            reject("Unable to find user: " + userData.userName); 
        }) 
    })
};