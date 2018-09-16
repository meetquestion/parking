var common = require('../../../utils/common.js')
var Bmob = require("../../../utils/bmob.js");
var util = require('../../../utils/util.js');
var app = getApp()
var that;
Page({
  data: {
    postsList: [], //总的订单
    currentPage: 0, //要跳过查询的页数
    limitPage: 3,//首先显示3条数据（之后加载时都增加3条数据，直到再次加载不够3条）
    isEmpty: false, //当前查询出来的数据是否为空
    totalCount: 0, //总订单数量
    endPage: 0, //最后一页加载多少条
    totalPage: 0, //总页数
  },

  onLoad() {
    var self = this;
    this.getAll();
    this.fetchPostsData();
  },

  //数据存储
  onSetData: function (data) {
    let page = this.data.currentPage + 1;
    //设置数据
    data = data || [];
    this.setData({
      postsList: page === 1 || page === undefined ? data : this.data.postsList.concat(data),
    });
  },

  //获取总的订单数
  getAll: function () {
    self = this;
    var Diary = Bmob.Object.extend("order");
    var query = new Bmob.Query(Diary);
    query.equalTo("currentuser", wx.getStorageSync("user_id"));
    query.count({
      success: function (count) {
        var totalPage = 0;
        var endPage = 0;
        if (count % self.data.limitPage == 0) {//如果总数的为偶数
          totalPage = parseInt(count / self.data.limitPage);
        } else {
          var lowPage = parseInt(count / self.data.limitPage);
          endPage = count - (lowPage * self.data.limitPage);
          totalPage = lowPage + 1;
        }
        self.setData({
          totalCount: count,
          endPage: endPage,
          totalPage: totalPage
        })
        if (self.data.currentPage + 1 == self.data.totalPage) {
          self.setData({
            isEmpty: true
          })
        }
        console.log("共有" + count + " 条记录");
        console.log("共有" + totalPage + "页");
        console.log("最后一页加载" + endPage + "条");
      },
    });
  },

  //获取首页列表文章
  fetchPostsData: function (data, endpage) {
    var self = this;
    //获取详细活动信息
    var molist = new Array();
    var Diary = Bmob.Object.extend("order");
    var query = new Bmob.Query(Diary);
    query.limit(self.data.limitPage);
    query.skip(3 * self.data.currentPage);
    query.equalTo("currentuser",wx.getStorageSync("user_id")); //查询出联系表中是我的记录wx.getStorageSync("user_id")
    query.include("order");
    query.include("space");
    query.descending("createAt");
    query.include("owner");
    query.find({
      success: function (results) {
        for (var i = 0; i < results.length; i++) {
          var status = results[i].get("status");
          var startdate = results[i].get("startdate");
          var starttime = results[i].get("starttime");
          var space = results[i].get("space");
          var usemoney = results[i].get("usemoney");
          var ownerid = results[i].get("owner").objectId;
          var spaceid = space.objectId;
          var spacename = space.spacename;
      
          var id = results[i].get("objectId");

          var createdAt = results[i].createdAt;
          
          var _url;
          var parkpic = results[i].get("space").picture;
          if (parkpic) {
            _url = parkpic.url;
          } else {
            _url = "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1519799158654&di=838bfa6f461af4668c3966369f8f620c&imgtype=0&src=http%3A%2F%2Fimage.huisou.com%2Fupload%2F2015%2F01%2F20%2FpZz2v6wCQlH8.jpg";
          }
          var jsonA;
          jsonA = {
            "spacename": spacename || '',
            "status": status || '',
            "usemoney": usemoney || '',
            "startdate": startdate || '',
            "starttime": starttime || '',
            "id": id || '',
            "spacePic": _url || '',
            "spaceid":spaceid || '',
            "ownerid":ownerid || ''
          }
          molist.push(jsonA);
          console.log(molist);
        }
        self.onSetData(molist, self.data.currentPage);

        setTimeout(function () {
          wx.hideLoading();
        }, 900);
      },
      error: function (error) {
        console.log(error)
      }
    })
  },

  //加载下一页
  loadMore: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    //一秒后关闭加载提示框
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    var self = this;
    self.setData({
      currentPage: self.data.currentPage + 1
    });
    console.log("当前页" + self.data.currentPage);
    //先判断是不是最后一页
    if (self.data.currentPage + 1 == self.data.totalPage) {
      self.setData({
        isEmpty: true
      })
      if (self.data.endPage != 0) { //如果最后一页的加载不等于0
        self.setData({
          limitPage: self.data.endPage
        })
      }
      this.fetchPostsData(self.data);
    } else {
      this.fetchPostsData(self.data);
    }
  },

  onShow: function () {

  },
  click_activity: function (e) {
    let spaceid = e.currentTarget.dataset.spaceid;
    let ownid = e.currentTarget.dataset.ownid;
    let user_key = wx.getStorageSync('user_key');
    wx.navigateTo({
      url: '/pages/detail/detail?spaceid=' + spaceid + "&ownid=" + ownid
    });
  },

});
