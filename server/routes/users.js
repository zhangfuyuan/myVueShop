
var express = require('express');
var router = express.Router();
var Goods = require('../dbModels/goods');
var User = require('../dbModels/user');
require('../tools/util');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('用户，欢迎您！');
});

/* 登录接口 */
router.post('/login', function(req, res, next) {
  let param = {
    userName: req.body.userName,
    userPwd: req.body.userPwd
  };

  User.findOne(param, function(err, doc) {
    if(err){
      return res.json({
        status: 500,
        msg: err.message
      });
    }

    if(!doc){
      return res.json({
        status: 404,
        msg: '用户名和密码错误'
      });
    }

    res.cookie('userId', doc.userId, { maxAge: 1000 * 60 * 10 });
    res.cookie('userName', doc.userName, { maxAge: 1000 * 60 * 10 });
    res.json({
      status: 200,
      msg: '登录成功',
      data: {
        userName: doc.userName,
        cartLength: doc.cartList.length
      }
    });
  });
});

/* 检查是否登录 */
router.post('/checkLogin', function(req, res, next) {
  res.json({
    status: 200,
    msg: '已登录',
    data: req.cookies.userName
  });
});

/* 退出登录 */
router.post('/logout', function(req, res, next) {
    res.cookie('userId', '', { maxAge: -1 });

    res.json({
        status: 200,
        msg: '退出成功'
    })
});

/* 获取购物车商品列表 */
router.post("/cartList", function(req, res, next) {
  let userId = req.cookies.userId;

  User.findOne({ "userId": userId }, function(err, doc) {
    if(err){
      return res.json({
        status: 500,
        msg: err.message
      });
    }

    res.json({
        status: 200,
        msg: '获取购物车商品数据成功',
        data: doc.cartList
    });
  });
});

/* 编辑购物车 */
router.post('/cartEdit', function(req, res, next) {
  let userId = req.cookies.userId,
      productId = req.body.productId,
      checked = req.body.checked,
      productNum = req.body.productNum,
      flag = req.body.flag,
      changeNum = 0;

    switch (flag) {
      case 'minu':
        changeNum = -1;
        break;
      case 'add':
        changeNum = 1;
        break;
    }

  Goods.findOne({ "productId": productId }, function(err, goodsDoc) {
      productNum += changeNum;
      goodsDoc.productNum -= changeNum;

    if (goodsDoc.productNum < 0) {
      return res.json({
        status: 400,
        msg: '此商品已倾销'
      });
    }

    goodsDoc.save(function (err, doc) {
      User.update({ "userId": userId, "cartList.productId": productId }, {
        "cartList.$.productNum": productNum,
        "cartList.$.checked": checked
      }, function(err2, doc2) {
        if(err2){
          return res.json({
            status: 500,
            msg: err.message
          });
        }

        res.json({
          status: 200,
          msg: '编辑购物车成功'
        });
      });
    });
  });
});

/* 编辑全选 */
router.post('/editCheckAll', function(req, res, next) {
  let userId = req.cookies.userId,
      checkAll = req.body.checkAllVal;

  User.findOne({ "userId": userId }, function(err, userDoc) {
    if(err){
      return res.json({
          status: 500,
          msg: err.message
      });
    }
    if(!userDoc){
      return res.json({
          status: 404,
          msg: '用户不存在'
      });
    }

    userDoc.cartList.forEach(item=>{
      item.checked = checkAll;
    });
    userDoc.save(function(err2, doc2) {
      if(err2){
        return res.json({
          status: 500,
          msg: err2.message
        });
      }
      res.json({
        status: 200,
        msg: '操作成功'
      });
    })
  });
});

/* 购物车删除商品操作 */
router.post('/cartDel', function(req, res, next) {
  let userId = req.cookies.userId,
      productId = req.body.productId,
      productNum = req.body.productNum;

  User.update({ "userId": userId }, {
    $pull: {
      "cartList": {
        "productId": productId
      }
    }
  }, function(err, doc) {
    if(err){
      return res.json({
        status: 500,
        msg: err.message
      });
    }

    Goods.findOne({ "productId": productId }, function(err2, goodsDoc) {
      goodsDoc.productNum += productNum;
      goodsDoc.save(function(err3, doc3) {
        if(err3){
          return res.json({
            status: 500,
            msg: err2.message
          });
        }
        res.json({
          status: 200,
          msg: '商品删除成功'
        });
      });
    });
  });
});

/* 用户地址列表 */
router.get('/addressList', function(req, res, next) {
  let userId = req.cookies.userId;

  User.findOne({ "userId": userId }, function(err, doc) {
    if(err){
      return res.json({
          status: 500,
          msg: err.message
      });
    }

    res.json({
      status: 200,
      msg: '获取用户地址列表成功',
      data: doc.addressList
    });
  });
});

/* 设置常规地址 */
router.post("/setDefault", function(req, res, next) {
  let userId = req.cookies.userId,
      addressId = req.body.addressId;

  if (!addressId) {
    return res.json({
      status: 400,
      msg: '参数错误'
    })
  }

  User.findOne({ "userId": userId }, function(err, doc) {
    if(err){
      return res.json({
          status: 500,
          msg: err.message
      });
    }

    doc.addressList.forEach(item => {
      item.isDefault = (item.addressId === addressId);
    });
    doc.save(function (err2, doc2) {
      if(err2){
        return res.json({
            status: 500,
            msg: err2.message
        });
      }
      res.json({
        status: 200,
        msg: '设置常规地址成功',
        data: doc2
      });
    });
  });
});

/* 生成并保存订单 */
router.post("/payMent", function(req, res, next) {
  let userId = req.cookies.userId,
      addressId = req.body.addressId,
      orderTotal = req.body.orderTotal;

  User.findOne({ "userId": userId }, function(err, doc) {
    if(err){
      return res.json({
        status: 500,
          msg: err.message
      });
    }

    let orderAddress = '', orderGoodsList = [];

    // 获取收货地址 -> 订单地址
    doc.addressList.forEach(item => {
      if(item.addressId === addressId) {
        orderAddress = item;
      }
    });

    // 获取购买的商品 -> 订单商品
    doc.cartList.forEach(item => {
      if(item.checked === '1') orderGoodsList.push(item);
    });

    // 生成订单号
    let platform = '622';
    let r1 = Math.floor(Math.random() * 10);
    let r2 = Math.floor(Math.random() * 10);
    let orderSysDate = (new Date()).Format('yyyyMMddhhmmss');
    let orderCreateDate = (new Date()).Format('yyyy-MM-dd hh:mm:ss');
    let orderId = platform + r1 + orderSysDate + r2;
    let order = {
      "orderId": orderId,
      "orderTotal": orderTotal,
      "addressInfo": orderAddress,
      "goodsList": orderGoodsList,
      "orderStatus": '10',
      "createDate": orderCreateDate
    };

    doc.orderList.push(order);
    doc.save(function(err2, doc2) {

      User.update({ "userId": userId }, {
        $pull: {
          "cartList": {
            "checked": '1'
          }
        }
      }, function(err3, doc3) {
        if(err3){
          return res.json({
            status: 500,
            msg: err.message
          });
        }
        res.json({
          status: 200,
          msg: '订单生成成功',
          data: {
            orderId: order.orderId,
            orderTotal: orderTotal
          }
        });
      });
    });
  });
});

/* 获取订单信息 */
router.get('/orderDetail', function(req, res, next) {
  let userId = req.cookies.userId,
      orderId = req.param('orderId');

  User.findOne({ "userId": userId }, function(err, userInfo) {
    if(err){
      return res.json({
        status: 500,
        msg: err.message
      });
    }
    if(!userInfo){
      return res.json({
        status: 404,
        msg: '找不到数据'
      });
    }

    let orderList = userInfo.orderList;

    if (orderList.length > 0) {
      let orderTotal = 0;

      orderList.forEach(item => {
        if (item.orderId === orderId) {
          orderTotal = item.orderTotal;
        }
      });

      if (orderTotal > 0) {
        res.json({
          status: 200,
          msg: '获取订单数据成功',
          data: {
            orderId: orderId,
            orderTotal: orderTotal
          }
        });
      }
    } else {
      res.json({
          status: '404',
          msg: '当前用户未创建订单'
      });
    }
  });
});

module.exports = router;
