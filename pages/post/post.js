//获取应用实例
var app = getApp()
var Bmob = require("../../utils/bmob.js");
var common = require('../template/getCode.js')
var that;
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
  +':'+myDate.getMinutes();
  return formate_result;
}
Page({
  /**
   * 页面的初始数据
   */
  data: {
    notice_status: false,
    isAgree: false,
    startdate: formate_date(myDate),
    starttime:formate_time(myDate),
    enddate: formate_date(myDate),
    endtime: formate_time(myDate),
    address: '点击选择位置',
    longitude: 0, //经度
    latitude: 0,//纬度
    showTopTips: false,
    TopTips: '',
    noteMaxLen: 200,//备注最多字数
    content: "",
    noteNowLen: 0,//备注当前字数
    types: ["公共","私家"],
    typeIndex: "0",
    showInput: false,//显示输入真实姓名,电话
  },

  tapNotice: function (e) {
    if (e.target.id == 'notice') {
      this.hideNotice();
    }
  },
  showNotice: function (e) {
    this.setData({
      'notice_status': true
    });
  },
  hideNotice: function (e) {
    this.setData({
      'notice_status': false
    });
  },


  //字数改变触发事件
  bindTextAreaChange: function (e) {
    var that = this
    var value = e.detail.value,
      len = parseInt(value.length);
    if (len > that.data.noteMaxLen)
      return;
    that.setData({
      content: value, 
      noteNowLen: len
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this;
    that.setData({//初始化数据
      src: "",
      isSrc: false,
      ishide: "0",
      autoFocus: true,
      isLoading: false,
      loading: true,
      isdisabled: false
    })
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
    var myInterval = setInterval(getReturn, 500); ////半秒定时查询
    function getReturn() {
      wx.getStorage({
        key: 'user_openid',
        success: function (ress) {
          if (ress.data) {
            clearInterval(myInterval)
            that.setData({
              loading: true
            })
          }
        }
      })
    }
  },

  //上传车位图片
  uploadPic: function () {
    wx.chooseImage({
      count: 1, 
      sizeType: ['compressed'], //压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          isSrc: true,
          src: tempFilePaths
        })
      }
    })
  },

  //删除图片
  clearPic: function () {//删除图片
    that.setData({
      isSrc: false,
      src: ""
    })
  },

  //上传收钱码
  uploadCodePic: function () {
    wx.chooseImage({
      count: 1, 
      sizeType: ['compressed'],//压缩图
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        that.setData({
          isCodeSrc: true,
          codeSrc: tempFilePaths
        })
      }
    })
  },

  //删除二维码
  clearCodePic: function () {
    that.setData({
      isCodeSrc: false,
      codeSrc: ""
    })
  },

  //改变开始日期
  bindDateChange1: function (e) {
    this.setData({
      startdate: e.detail.value
    })
  },
  //改变开始时间
  bindTimeChange1: function (e) {
    this.setData({
      starttime: e.detail.value
    })
  },

  //改变结束日期
  bindDateChange2: function (e) {
    this.setData({
      enddate: e.detail.value
    })
  },
  //改变结束时间
  bindTimeChange2: function (e) {
    this.setData({
      endtime: e.detail.value
    })
  },

  //改变车位类别
  bindTypeChange: function (e) {
    this.setData({
      typeIndex: e.detail.value
    })
  },
  //选择地点
  addressChange: function (e) {
    this.addressChoose(e);
  },
  addressChoose: function (e) {
    var that = this;
    wx.chooseLocation({
      success: function (res) {
        that.setData({
          address: res.name,
          longitude: res.longitude, //经度
          latitude: res.latitude,//纬度
        })
        if (e.detail && e.detail.value) {
          this.data.address = e.detail.value;
        }
      },
      fail: function (e) {
      },
      complete: function (e) {
      }
    })
  },

  //同意相关条例
  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length,
      showInput: !this.data.showInput
    });
  },

  //表单验证
  showTopTips: function () {
    var that = this;
    this.setData({
      showTopTips: true
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },
  //提交表单
  submitForm: function (e) {
    var that = this;

    if (that.data.showInput == false) {
      wx.showModal({
        title: '提示',
        content: '请先阅读《发布须知》！'
      })
      return;
    }
    var spacename = e.detail.value.spacename;
    var startdate=this.data.startdate;
    var starttime=this.data.starttime;
    var enddate = this.data.enddate;
    var endtime=this.data.endtime;
    var typeIndex = this.data.typeIndex;
    var typename = getTypeName(typeIndex); //获得类型名称
    var address = this.data.address;
    var longitude = this.data.longitude; //经度
    var latitude = this.data.latitude;//纬度
    var money = e.detail.value.money;
    var switchHide = e.detail.value.switchHide;
    var spacenumber = e.detail.value.spacenumber;
    var content = e.detail.value.content;
    var isSrc=e.detail.value.isSrc;
    var isCodeSrc=e.detail.value.isCodeSrc;
    //------发布者真实信息------
    var realname = e.detail.value.realname;
    var contactValue = e.detail.value.contactValue;
    var phReg = /^1[34578]\d{9}$/;
    var nameReg = new RegExp("^[\u4e00-\u9fa5]{2,4}$");
    //先进行表单非空验证
    if (spacename == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入车位名称'
      });
    } else if (address == '点击选择位置') {
      this.setData({
        showTopTips: true,
        TopTips: '请选择地点'
      });
    } else if (spacenumber == "请输入车位数") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入车位数'
      });
    } else if (money =='请输入收费标准（元）/时') {
      this.setData({
        showTopTips: true,
        TopTips: '请输入收费标准'
      });
    }  else if (content == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入注意事项或其他备注'
      });
    } else if (realname == "") {
      this.setData({
        showTopTips: true,
        TopTips: '请输入真实姓名'
      });
    } else if (realname != "" && !nameReg.test(realname)) {
      this.setData({
        showTopTips: true,
        TopTips: '真实姓名一般为2-4位汉字'
      });
    }  else if (!phReg.test(contactValue)) {
      this.setData({
        showTopTips: true,
        TopTips: '手机号格式不正确'
      });
    } else {
      console.log('校验完毕');
      that.setData({
        isLoading: true,
        isdisabled: true
      })
      //向 parking_space表中新增一条数据
      wx.getStorage({
        key: 'user_id',
        success: function (ress) {
          var Diary = Bmob.Object.extend("parking_space");
          var diary = new Diary();
          var me = new Bmob.User();
          me.id = ress.data;
          diary.set("spacename", spacename);
          diary.set("starttime", starttime);
          diary.set("startdate", startdate);
          diary.set("enddate", enddate);
          diary.set("endtime", endtime);
          diary.set("type", typename);
          diary.set("address", address);
          diary.set("longitude", longitude);//经度
          diary.set("latitude", latitude);//纬度
          diary.set("money", money);//收费标准
          diary.set("realname",realname);
          diary.set("phonenumber",contactValue);
          diary.set("number", spacenumber);
          diary.set("content", content);
          diary.set("owner", me);
          diary.set("joinnumber", 0); //发布后初始加入人数为0
          diary.set("joinArray", []);
          diary.set("status","可使用");
          if (that.data.isSrc == true) {
            var name = that.data.src; //上传图片的别名
            var file = new Bmob.File(name, that.data.src);
            file.save();
            diary.set("picture", file);
          }
          if (that.data.isCodeSrc == true) {
            var name = that.data.codeSrc; //上传图片的别名
            var file = new Bmob.File(name, that.data.codeSrc);
            file.save();
            diary.set("paypicture", file);
          }

          diary.save(null, {
            success: function (result) {

              console.log("发布成功,objectId:" + result.id);
              that.setData({
                isLoading: false,
                isdisabled: false,
              })
              //添加成功，返回成功之后的objectId(注意，返回的属性名字是id,而不是objectId)
              common.dataLoading("发布成功", "success", function () {
                //重置表单
                that.setData({
                  spacename: '',
                  typeIndex: 0,
                  spacenumber: '',
                  address: '点击选择位置',
                  longitude: 0, //经度
                  latitude: 0,//纬度
                  startdate: formate_date(myDate),
                  enddate: formate_date(myDate),
                  starttime: formate_time(myDate),
                  endtime: formate_time(myDate),
                  money: '',   
                  content: '',     
                  noteNowLen: 0,
                  showInput: false,       
                  isAgree: false,
                  realname: "",
                  contactValue: "",
                  src: "",
                  isSrc: false,
                  codeSrc: "",
                  isCodeSrc: false

                })
              });
            },
            error: function (result, error) {
              //添加失败
              console.log("发布失败=" + error);
              common.dataLoading("发布失败", "loading");
              that.setData({
                isLoading: false,
                isdisabled: false
              })
            }
          })
        },
      })
    }
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 1000);
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

  }
})

//根据车位类型获取车位类型名称
function getTypeName(typeIndex) {
  var typeName = "";
  if (typeIndex == 0) typeName = "公共";
  else if (typeIndex == 1) typeName = "私家";
  return typeName;
}