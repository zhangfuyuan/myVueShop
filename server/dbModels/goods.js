/**
 * Created by Jeffrey on 2017/11/14.
 */

var mongoose = require('./db.js'),
    Schema = mongoose.Schema;

var productSchema = new Schema({
    "productId": { type: String },
    "productName": { type: String },
    "salePrice": { type: Number },
    "productImage": { type: String },
    "productNum": { type: Number },
}, { collection: "Goods" });

module.exports = mongoose.model("Goods", productSchema);
