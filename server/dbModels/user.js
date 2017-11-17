/**
 * Created by Jeffrey on 2017/11/14.
 */

var mongoose = require('./db.js'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    "userId": { type: String },
    "userName": { type: String },
    "userPwd" : { type: String },
    "orderList": { type: Array },
    "cartList": { type: Array },
    "cartList": [{
        "productId": { type: String },
        "productName": { type: String },
        "salePrice": {type: Number},
        "productImage": { type: String },
        "productNum": {type: Number},
        "checked": { type: String }
    }],
    "addressList": [{
        "addressId": { type: String },
        "userName": { type: String },
        "streetName": { type: String },
        "postCode": { type: Number },
        "tel": { type: Number },
        "isDefault": { type: Boolean }
    }]
}, { collection: "user" });

module.exports = mongoose.model("User", userSchema);
