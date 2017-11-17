/**
 * Created by Jeffrey on 2017/11/14.
 */

var express = require('express');
var router = express.Router();
var Goods = require('../dbModels/goods');
var User = require('../dbModels/user');

router.get('/', function(req, res, next) {
    res.json({
        status: 200,
        msg: '您现在访问的是 goods api'
    });
});

/* 获取商品列表 */
router.get('/list', function(req, res, next) {
    let priceLevel = req.param('priceLevel');
    let currentPage = parseInt(req.param('page')) > 0 ? parseInt(req.param('page')) : 1;
    let pageSize = parseInt(req.param('pageSize')) > 0 ? parseInt(req.param('pageSize')) : 8;
    let skip = (currentPage - 1) * pageSize;
    let sort = req.param('sort');
    let option = {};

    if(priceLevel !== 'all'){
        let priceItem = [
            [0, 100],
            [100, 500],
            [500, 1000],
            [1000, 2000]
        ];

        option = {
            "salePrice": {
                $gt: priceItem[priceLevel][0],
                $lte: priceItem[priceLevel][1]
            }
        }
    }

    Goods.find(option).skip(skip).limit(pageSize).sort(sort?{ "salePrice": sort }:{}).exec(function(err, doc) {
        if (err) {
            res.json({
                status: 500,
                msg: err.message
            });
        } else {
            res.json({
                status: 200,
                msg: '获取商品列表成功',
                data: doc
            });
        }
    });
});

/* 加入购物车 */
router.post('/addCart', function(req, res, next) {
    let productId = req.body.productId,
        userId = req.cookies.userId;

    Goods.findOne({ "productId": productId }, function(err, goodsDoc) {
        if (goodsDoc.productNum === 0) {
            return res.json({
                status: 400,
                msg: '此商品已倾销'
            });
        }

        User.findOne({ "userId": userId }, function(err, userDoc) {
            let goodItem = {};

            userDoc.cartList.forEach(item=>{
                if (item.productId === productId) {
                    goodItem = item;
                    item.productNum++;
                }
            });

            // 数据库中用户的购物车有此商品 -> 根据上步判断处理即可返回请求
            if(JSON.stringify(goodItem) !== '{}'){
                userDoc.save(function(err2, doc2) {
                    if (err2) {
                        res.json({
                            status: 500,
                            msg: err2.message
                        });
                    } else {
                        res.json({
                            status: 200,
                            msg: '已加入购物车的商品数增加成功'
                        });
                    }
                });
            }
            // 数据库中用户的购物车没有此商品 -> 在数据库中添加数据
            else {
                let newProductObj = {
                    productId: goodsDoc.productId,
                    productName: goodsDoc.productName,
                    salePrice: goodsDoc.salePrice,
                    productImage: goodsDoc.productImage,
                    productNum: 1,
                    checked: '0'
                };

                if(goodsDoc.productNum>0) goodsDoc.productNum--;

                goodsDoc.save(function (err4, doc4) {

                    userDoc.cartList.push(newProductObj);
                    userDoc.save(function(err3, doc3) {
                        if(err3){
                            return res.json({
                                status: 500,
                                msg: '内部服务器错误'
                            })
                        }

                        res.json({
                            status: 200,
                            msg: '新加入购物车成功',
                            data: userDoc.cartList.length
                        });
                    });
                });
            }
        });
    });
});

module.exports = router;
