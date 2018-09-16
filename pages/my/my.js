var common = require('../../utils/common.js')
var Bmob = require("../../utils/bmob.js");
var util = require('../../utils/util.js');
const app = getApp()

const MENU_WIDTH_SCALE = 0.82;
const FAST_SPEED_SECOND = 300;
const FAST_SPEED_DISTANCE = 5;
const FAST_SPEED_EFF_Y = 50;

var my_nick = wx.getStorageSync('my_nick')
var my_avatar = wx.getStorageSync('my_avatar')

// pages/my/my.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
	  userInfo:{},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  //事件处理函数
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
    })
  },
 
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  //进入出租订单
  click_myLaunch: function () {
      wx.navigateTo({
        url: '/pages/my/mylaunch/mylaunch',
      });
  },
  //进入停车订单
  click_myJoin: function ()  {
    wx.navigateTo({
      url: '/pages/my/myjoin/myjoin',
    })
  },
  //进入我的钱包
  click_myWallet: function () {
      wx.navigateTo({
      });
  },
//进入项目简介
click_project:function(){
  wx.navigateTo({
    url: '/pages/my/project/project',
  })
}
})