var common = require('../template/getCode.js');
var Bmob = require("../../utils/bmob.js");
var util = require('../../utils/util.js');
import { $wuxButton } from '../../components/wux'
var app = getApp();
var that;
var optionId; //车位的Id
var ownerId; //车位主的Id
var joinpId; //如果当前用户已经加入，该车位在订单表中的Id
var joinlist;
var myDate = new Date();
//格式化日期
function formate_date(myDate) {
  let month_add = myDate.getMonth() + 1;
  var formate_result = myDate.getFullYear() + '-'
    + month_add + '-'
    + myDate.getDate();
  return formate_result;
}
//格式化时间
function formate_time(myDate) {
  var formate_result = myDate.getHours()
    + ':' + myDate.getMinutes();
  return formate_result;
}

Page({
  data: {
    spacestatus:"",
    realname: "",
    carnumber:"",
    contactValue: "",
    showTopTips: false, //是否显示提示
    TopTips: '', //提示的内容
    linkmainHe: false,//车位主的详细信息
    money:'',
    usemoney:'',
    //----------------
    showImage: false,
    loading: false,
    join: 0,
    isMe: false,
    isEnd:false,//是否结束使用
    status: 0,//tab切换按钮
    adminId: "",
    adminname: "",
    adcontactValue: "",
    //----------------------------------
    index: 2,
    opened: !1,
    style_img: ''
  },


  //打开发布者联系方式弹窗
  showmainLink: function () {
    this.setData({
      linkmainHe: true
    })
  },
  //关闭发布者联系方式弹窗
  closemainLink: function () {
    this.setData({
      linkmainHe: false
    })
  },
  //打开加入者联系方式弹窗
  showjoinLink: function (e) {
    var id = e.currentTarget.dataset.id;
    that.setData({
      currJoinId: id
    })
    var joinList2 = that.data.joinList;
    joinList2.forEach(function (item) {
      if (item.id === id) {
        item.linkjoinHe = true;
      }
    })
    this.setData({
      joinList: joinList2
    })
  },
  //关闭加入者联系方式弹窗
  closejoinLink: function () {
    var id = that.data.currJoinId;
    var joinList2 = that.data.joinList;
    joinList2.forEach(function (item) {
      if (item.id === id) {
        item.linkjoinHe = false;
      }
    })
    this.setData({
      joinList: joinList2
    })
  },
  //复制联系方式
  copyLink: function (e) {
    var value = e.target.dataset.value;
    wx.setClipboardData({
      data: value,
      success() {
        common.dataLoading("复制成功", "success");
        console.log('复制成功')
      }
    })
  },

  //切换tab操作
  changePage: function (e) {
    let id = e.target.id;
    this.setData({
      status: id
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    var openid = wx.getStorageSync("user_openid");
    optionId = options.spaceid;
    ownerId = options.ownid;
    var buttons2 = new Array()
    wx.getStorage({ //判断当前发布人是不是自己
      key: 'user_id',
      success: function (ress) {
        if (ownerId == ress.data) {
          that.setData({
            join: 3, //已经无法停车
            isMe: true,
          })
          console.log("这是我的车位");
        }
      },
    })

    console.log('this is options.spaceid=' + options.spaceid);
    console.log('this is options.ownid=' + options.ownid);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.hideToast()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var myInterval = setInterval(getReturn, 500);//半秒定时查询
    function getReturn() {
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval); //清除定时器
            //如果这个车位不是自己发的
            if (that.data.isMe == false) {
              var pp = Bmob.Object.extend("parking_space");
              var ppss = new Bmob.Query(pp);
              ppss.equalTo("objectId", optionId);
              ppss.find({
                success: function (result) {
                  var joinArray = result[0].get("joinArray");
                  var isJoin = false;
                  if (joinArray != null) {
                    if (joinArray.length > 0) {
                      for (var i = 0; i < joinArray.length; i++) {
                        if (joinArray[i] == ress.data) {
                          joinArray.splice(i, 1);
                          isJoin = true;
                          break;
                        }
                      }
                    }
                  }
                  if (isJoin == "1") {
                    that.setData({
                      join: 1
                    })
                  } else if (isJoin == "0") {
                    that.setData({
                      join: 0
                    })
                  }
                },
                error: function (error) {
                  console.log(error)
                }
              });
            }
            var join=that.data.join;
            //查询车位信息
            var Diary = Bmob.Object.extend("parking_space");
            var query = new Bmob.Query(Diary);
            query.equalTo("objectId", optionId);
            query.include("owner");
            query.find({
              success: function (result) {
                var spacename = result[0].get("spacename");
                var content = result[0].get("content");//注意事项
                var owner = result[0].get("owner");
                var spacetype = result[0].get("type");
                var starttime = result[0].get("starttime");
                var startdate = result[0].get("startdate");
                var enddate = result[0].get("enddate");
                var endtime = result[0].get("endtime");
                var address = result[0].get("address");//地址
                var longitude = result[0].get("longitude");//经度
                var latitude = result[0].get("latitude");//纬度
                var spacenum = result[0].get("number");//车位数
                var money = result[0].get("money");//收费标准
                var spacestatus = result[0].get("status");//车位状态
                var joinnumber = result[0].get("joinnumber"); //已经停车的人数
                var pay = result[0].get("paypicture")._url;
                var ownerName = owner.nickname;
                var objectIds = owner.id;
                var ownerPic;
                var url;
                if (owner.userPic) {
                  ownerPic = owner.userPic;
                }
                else {
                  ownerPic = "../../images/user_defaulthead@2x.png";
                }
                if (result[0].get("picture")) 
                {
                  url = result[0].get("picture")._url;
                }
                else {
                  url = "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1519799158654&di=838bfa6f461af4668c3966369f8f620c&imgtype=0&src=http%3A%2F%2Fimage.huisou.com%2Fupload%2F2015%2F01%2F20%2FpZz2v6wCQlH8.jpg";
                }
                if (owner.id == ress.data) {
                  that.setData({
                    isMine: true
                  })
                } that.setData({
                  listTitle: spacename,
                  listContent: content,
                  listPic: url,
                  payPic:pay,
                  spacetype: spacetype,
                  starttime: starttime,
                  startdate: startdate,
                  enddate: enddate,
                  endtime: endtime,
                  address: address,
                  longitude: longitude,//经度
                  latitude: latitude,//纬度
                  spacenum: spacenum,
                  money:money,
                  spacestatus:spacestatus,
                  joinnumber: joinnumber,
                  ownerPic: ownerPic,
                  ownerName: ownerName,
                  objectIds: objectIds,
                  loading: true
                })
                that.findOwner(optionId);
                if(join!=3)
                {
                that.joinDetail0(result[0]);
                }
                else 
                {
                that.joinDetail(result[0]);
                }
              },
              error: function (error) {
                that.setData({
                  loading: true
                })
                console.log(error);
              }
            })
          }
        },
      })
    }
  },

  findOwner:function(parking_space)
  {
    //先获取车位主的联系信息
    console.log("找车位主");
    var Diary = Bmob.Object.extend("parking_space");
    var query = new Bmob.Query(Diary);
    query.equalTo("objectId", parking_space);
    query.first({
      success: function (re) {
        var ownerId = re.get("owner").objectId;
        var adminname = re.get("realname"); //加入的人的真实姓名
        var adcontactValue = re.get("phonenumber"); //联系方式
        that.setData({
          adminId: ownerId,
          adminname: adminname,
          adcontactValue: adcontactValue,
          loading: true
        })
        console.log("获取车位主信息成功");
      },
      error: function (error) {
        that.setData({
          loading: true
        })
        console.log(error);
        console.log("找车主失败");
      }
    })
  },
  //---------------------------------------------------
  //获取停车详情信息
  joinDetail0: function (parking_space) {
    joinlist = new Array();
    var Orderr = Bmob.Object.extend("order");
    var queryJoin = new Bmob.Query(Orderr);
    queryJoin.equalTo("space", parking_space);
    queryJoin.equalTo("status", "正在使用");
    queryJoin.include("currentuser");
    queryJoin.include("owner");
    queryJoin.descending("createAt");
    queryJoin.find({
      success: function (result) {
        console.log(result.length);
        for (var i = 0; i < result.length; i++) {
          var joinuserid = result[i].get("currentuser").objectId; //加入的人的objectIdd
            if (joinuserid == wx.getStorageSync("user_id"))
             {
              var id = result[i].id;
              joinpId = id;
              var joincarnumber = result[i].get("carnumber");
              var joinname = result[i].get("userrealname"); //加入的人的真实姓名
              var jocontactValue = result[i].get("userphonenumber"); //联系方式
              that.setData({
                joinId: id,
                joincarnumber: joincarnumber,
                joinname: joinname,
                jocontactValue: jocontactValue,
                loading: true
              })
              console.log("获取停车者信息成功0");
            }
            var id = result[i].id;
            var carnumber = result[i].get("carnumber")
            var realname = result[i].get("userrealname"); //加入的人的真实姓名
            var contactValue = result[i].get("userphonenumber"); //联系方式
            var joinusername = result[i].get("currentuser").username; //加入的人昵称
            var joinuserpic = result[i].get("currentuser").userPic; //加入的人头像
            var linkjoinHe = false;
            var jsonA;
            jsonA = {
              "id": id,
              "carnumber": carnumber,
              "realname": realname,
              "joinuserid": joinuserid,
              "joinusername": joinusername,
              "joinuserpic": joinuserpic,
              "contactValue": contactValue,
              "linkjoinHe": linkjoinHe,
            }
            joinlist.push(jsonA)
            that.setData({
              joinList: joinlist,
              loading: true
            })
        }
      },
      error: function (error) {
        common.dataLoadin(error, "loading");
        console.log(error);
      }
    })
  },

  //---------------------------------------------------
  //获取停车详情信息
  joinDetail: function (parking_space) {
    joinlist = new Array();
    var Orderr = Bmob.Object.extend("order");
    var queryJoin = new Bmob.Query(Orderr);
    queryJoin.equalTo("space", parking_space);
    queryJoin.equalTo("status","正在使用");
    queryJoin.include("currentuser");
    queryJoin.include("owner");
    queryJoin.descending("createAt");
    queryJoin.find({
      success: function (result) {
        console.log(result.length);
        for (var i = 0; i < result.length; i++) {
          var joinuserid = result[i].get("currentuser").objectId; //加入的人的objectIdd

            var id = result[i].id;
            joinpId = id;
            var joincarnumber = result[i].get("carnumber");
            var joinname = result[i].get("userrealname"); //加入的人的真实姓名
            var jocontactValue = result[i].get("userphonenumber"); //联系方式
            that.setData({
              joinId: id,
              joincarnumber: joincarnumber,
              joinname: joinname,
              jocontactValue: jocontactValue,
              loading: true
            })
            console.log("获取停车者信息成功");

          var id = result[i].id;
          var carnumber = result[i].get("carnumber")
          var realname = result[i].get("userrealname"); //加入的人的真实姓名
          var contactValue = result[i].get("userphonenumber"); //联系方式
          var joinusername = result[i].get("currentuser").username; //加入的人昵称
          var joinuserpic = result[i].get("currentuser").userPic; //加入的人头像
          var linkjoinHe = false;
          var jsonA;
          jsonA = {
            "id": id,
            "carnumber": carnumber,
            "realname": realname,
            "joinuserid": joinuserid,
            "joinusername": joinusername,
            "joinuserpic": joinuserpic,
            "contactValue": contactValue,
            "linkjoinHe": linkjoinHe,
          }
          joinlist.push(jsonA)
          that.setData({
            joinList: joinlist,
            loading: true
          })
        }
      },
      error: function (error) {
        common.dataLoadin(error, "loading");
        console.log(error);
      }
    })
  },


  //查看车位大图
  seespaceBig: function (e) {
    wx.previewImage({
      current: that.data.listPic, // 当前显示图片的http链接
      urls: [that.data.listPic] // 需要预览的图片http链接列表
    })
  },

  //查看收钱码大图
  seespaceBig1: function (e) {
    wx.previewImage({
      current: that.data.payPic, // 当前显示图片的http链接
      urls: [that.data.payPic] // 需要预览的图片http链接列表
    })
  },

  //查看活动地图位置
  viewspaceAddress: function () {
    let latitude = this.data.latitude;
    let longitude = this.data.longitude;
    wx.openLocation({ latitude: latitude, longitude: longitude })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log(this.data.listTitle);
    return {
      title: this.data.listTitle,
      path: '/pages/detail/detail?spaceid=' + optionId + "&ownid" + ownerId,
      imageUrl: this.data.istPic,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'success'
        });
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: '转发失败',
          icon: 'fail'
        });
      }
    }
  },

  //-----------------加入------------
  //现在加入功能
  click_join: function (event) {
    var join = that.data.join;
    var isEnd=that.data.isEnd;
    if (join == "1") { //如果已经加入，则不弹出表单，点击结束使用
    wx, wx.showModal({
      title: '温馨提示',
      content: '确定结束使用吗？',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {//如果点击确认
          that.setData({
            status: 0
          });
          //先修改订单表里的数据
          wx.getStorage({
            key: 'user_id',
            success: function (ress) {
              var me = new Bmob.User();
              me.id = ress.data;
              var parking_space = Bmob.Object.extend("parking_space");
              var ps = new parking_space();
              ps.id = optionId;
              var Diary = Bmob.Object.extend("order");
              var query = new Bmob.Query(Diary);
              query.equalTo("currentuser", me);
              query.equalTo("status", "正在使用");
              query.equalTo("space", ps);
              query.descending("createdAt");
              query.find({
                success: function (resu) {
                  console.log("找到这个订单！");
                  var oid = resu[0].id;
                  console.log(oid);
                  var money = that.data.money;
                  console.log(money);
                  var Diary0 = Bmob.Object.extend("order");
                  var query0 = new Bmob.Query(Diary0);
                  query0.get(oid, {
                    success: function (r) {
                      var sdate = r.get("startdate");
                      var stime = r.get("starttime");
                      console.log(sdate + stime);
                      var date2 = new Date();
                      console.log(date2);
                      var date3 = date2.getTime() - new Date(sdate + ' ' + stime).getTime();
                      console.log(date3);
                      var hours = Math.ceil(date3 / 3600000);
                      console.log(hours);
                      var usemoney = money * hours;
                      console.log(usemoney);

                      that.setData({
                        usemoney: usemoney
                      });

                      r.set("enddate", formate_date(myDate));
                      r.set("endtime", formate_time(myDate));
                      r.set("status", "结束使用");
                      r.set("usemoney", usemoney);
                      r.save();
                      console.log("结束订单成功");
                      // The object was retrieved successfully.
                    },
                    error: function (object, error) {
                      console.log("修改订单失败");
                    }
                  });
                },
                error: function (error) {
                  console.log(error);
                }
              });

              var Diary = Bmob.Object.extend("parking_space");
              var query0 = new Bmob.Query(Diary);
              query0.equalTo("objectId", optionId);
              query0.find({
                success: function (result) {
                  var joinArray = result[0].get("joinArray");
                  for (var i = 0; i < joinArray.length; i++) {
                    if (joinArray[i] == ress.data) {
                      joinArray.splice(i, 1);
                      result[0].set('joinnumber', result[0].get('joinnumber') - 1);
                      break;
                    }
                  }
                  result[0].save();
                  that.setData({
                    isEnd: true
                  });
                }
              })
              that.onShow();
            },
          })
        }
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
     else if (that.data.spacenum > 0 && (that.data.spacenum - that.data.joinnumber) <= 0) { //如果人加入满了
      this.setData({ spacestatus: "不可使用" });
      wx.showModal({
        title: '温馨提示',
        content: '此车位已满',
        showCancel: true,
      })
    } else if (join == "3") { //如果是自己的发起,弹出改变活动状态的弹窗
      this.setData({
      });
    } else if (join == "0") {//如果没有加入，弹出联系表单
      this.setData({
        showDialog: !this.data.showDialog
      });
    }
    
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },

  payOk:function()
  {
    that.setData(
      {
        isEnd:false
      }
    )
  },
  //加入操作
  joinSubmit: function (parking_space) {
    var join = that.data.join;
    if (join == "0") { // 未加入，点击加入
      that.setData({
        join: 1
      })
    }
    else if (join == "1") { //已加入，点击结束使用
      that.setData({
        join: 0
      })
    }

    var realname = parking_space.detail.value.realname;
    var carnumber=parking_space.detail.value.carnumber;
    var contactValue = parking_space.detail.value.contactValue;
    var phReg = new RegExp("0?(13|14|15|17|18|19)[0-9]{9}");
    var nameReg = new RegExp("^[\u4e00-\u9fa5]{2,4}$");
    if (realname == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入真实姓名'
      });
    } else if (realname != "" && !nameReg.test(realname)) {
      this.setData({
        showTopTips: true,
        TopTips: '真实姓名一般为2-4位汉字'
      });
    } else if (carnumber == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入车牌号'
      });
    } else if (contactValue == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入联系方式'
      });
    } else if (!phReg.test(contactValue)) {
      this.setData({
        showTopTips: true,
        TopTips: '手机号格式不正确'
      });
    } else {
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          var Order = Bmob.Object.extend("order");
          var order = new Order();
          var parking_space = Bmob.Object.extend("parking_space");
          var ps = new parking_space();
          ps.id = optionId;
          var me = new Bmob.User();
          me.id = ress.data;
          var pub = new Bmob.User();
          pub.id = ownerId;
          order.set("owner", pub);
          order.set("currentuser", me);
          order.set("space", ps);
          order.set("carnumber",carnumber);
          order.set("userrealname", realname);
          order.set("userphonenumber", contactValue);
          order.set("startdate",formate_date(myDate));
          order.set("starttime", formate_time(myDate));
          order.set("status","正在使用");
          console.log(order);
          order.save(null, {
            success: function () {
              that.setData({
                showDialog: !that.data.showDialog
              })
              console.log("写入订单表成功");
              that.setData({
                carnumber:"",
                contactValue: "",
                realname: ""
              })
            },
            error: function (error) {
              console.log(error);
            }
          });

          //将参加的人的消息写入车位表中,并更新参加人数
          var Diary = Bmob.Object.extend("parking_space");
          var queryLike = new Bmob.Query(Diary);
          queryLike.equalTo("objectId", optionId);
          queryLike.find({
            success: function (result) {
              var joinArray = result[0].get("joinArray");
              joinArray.push(ress.data);
              result[0].set('joinnumber', result[0].get('joinnumber') + 1);
              result[0].save();
            }
          })
          that.onShow();
        },
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
  },
})