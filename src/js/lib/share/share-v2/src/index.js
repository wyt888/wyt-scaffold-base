let wxSDK = '//assets.geilicdn.com/v-components/cdn/jweixin/1.2.0/index.fix.min.js';
let qqSDK = '//assets.geilicdn.com/v-components/cdn/qqsdk/default/index.fix.min.js';
let qqBrowserServer = '//jsapi.qq.com/get?api=app.share';
let kdjsbridge2 = 'https://s.geilicdn.com/script/common/jsbridge.min.js';

let ua = window.navigator.userAgent;
let inWeixin = isInWeixin();
let inQQ = isInQQ();
let inQQBroswer = isInQQBroswer();

let WFR_MAP = {
  qq: "qfriendh5",
  qzone: "qzoneh5",
  chats: "wxh5",
  moments: "wxph5"
};

function Share(setting) {
  this._wxSdkReady = false;
  this._setShareOption(setting.option);
  this._setUserConfig(setting.config);
  this._initShareDOM();
}

/**
 * 默认分享渠道配置参数
 * @type {{isInApp: boolean, appName: string}}
 * @scene 卖家版 native 面板渠道
  {1:微信好友,2:朋友圈,3:qq好友,4:qq空间,5:微博,6复制链接}     
 * @momentMode 卖家版 native 面板朋友圈分享方式
  {0:普通分享,1:多图分享,2:大图分享,3:小程序分享}
 */
let defaultOption = {
  vbuyerShare: true,
  wdShare: true,
  scene: [1, 2, 3, 4, 5],
  prependHtml: '',
  wxShareTipImge: '',
  wxSuccessCb: null,
  hideMenuItems: [],
  momentMode: 0
};

Share.prototype._singleShare = function (channel) {
  if (inQQBroswer) {
    this._shareInQQBrowser(channel);
    return;
  }

  this.showPanel();
};

Share.prototype.sharePyq = function () {
  this._singleShare("moments");
};

Share.prototype.shareChats = function () {
  this._singleShare("chats");
};

Share.prototype.shareQZone = function () {
  this._singleShare("qzone");
};

Share.prototype.shareQQ = function () {
  this._singleShare("qq");
};

/**
 * 对外接口，用来重设分享配置
 */
Share.prototype.resetShareOption = function (option) {
  var newOption = assgin(option, this.option);
  this._setShareOption(newOption);
  this._initShareDOM(true);
};

/**
 * 对外接口，用来重设用户分享信息
 */
Share.prototype.resetUserConfig = function (config) {
  // merge参数
  var newConfig = assgin(config, this.config);
  this._setUserConfig(newConfig);

  if (this._checkWxSdk()) { // 如果是微信且微信SDK已经配置完毕，重设参数
    this._setWXMenuEvent();
  }

  // 需要jsbridge 加载完毕
  if (this.option.appContainer === "vbuyer" && window.KDJSBridge2 !== undefined && this.option.vbuyerShare) {
    this._showVbuyerShare();
  }

  if (this.option.appContainer === "kdweidian" && window.KDJSBridge2 !== undefined && this.option.wdShare) {
    this._showWDShare()
  }
};

/**
 * 对外接口,直接显示分享面板
 */
Share.prototype.showPanel = function () {
  var self = this;
  var config = self.config;

  if (this.option.isInApp !== false) {
    this._showNativeShare();

  } else {
    this.option.$dom.style.display = 'block';
    document.body.classList.add('ui-share__hidden');
    document.querySelector(".copy-href") && (document.querySelector(".copy-href").value = this.config.url);
  }
};

Share.prototype._checkWxSdk = function () {
  return this._wxSdkReady;
};

/**
 * 根据当前环境，配置参数
 * @private
 */
Share.prototype._setShareOption = function (option) {
  var self = this,
    newOption = {};

  newOption.appContainer = getAppContainer();
  newOption.isInApp = isInApp();

  if (option && option.vbuyerShare !== undefined) {
    newOption.vbuyerShare = option.vbuyerShare;
  } else {
    newOption.vbuyerShare = defaultOption.vbuyerShare;
  }

  if (option && option.wdShare !== undefined) {
    newOption.wdShare = option.wdShare;
  } else {
    newOption.wdShare = defaultOption.wdShare;
  }

  if (option && option.scene !== undefined && option.scene.length > 0) {
    newOption.scene = option.scene;

  } else {
    newOption.scene = defaultOption.scene;
  }

  newOption.wxShareTipImge = (option && option.wxShareTipImge) || defaultOption.wxShareTipImge;
  newOption.wxSuccessCb = (option && option.wxSuccessCb) || defaultOption.wxSuccessCb;
  newOption.hideMenuItems = (option && option.hideMenuItems) || defaultOption.hideMenuItems;
  newOption.momentMode = (option && option.momentMode) || defaultOption.momentMode;

  newOption.$dom = self.option && self.option.$dom;

  newOption.prependHtml = (option && option.prependHtml !== undefined) ? option.prependHtml : defaultOption.prependHtml;

  self.option = newOption;
};

/**
 * 配置用户分享信息
 * @private
 */
Share.prototype._setUserConfig = function (config) {
  this.config = {};
  let shareConfig = config;
  shareConfig.pyq = shareConfig.pyq || shareConfig.title;

  if (Object.getOwnPropertyNames(shareConfig).length > 0) {
    for (let key in shareConfig) {
      this.config[key] = shareConfig[key];
    }
  }
};

/**
 * 初始化分享DOM结构
 * @private
 */
Share.prototype._initShareDOM = function (isReset) {
  var option = this.option;

  if (isReset) {
    if (inQQ || inWeixin) {
      option.$dom.innerHTML = this._renderShareTip();
    } else if (inQQBroswer) {
      option.$dom.innerHTML = this._renderSharePanel();
    } else {
      option.$dom.innerHTML = this._renderCopyPanel()
    }
    this._bindEvent();
    return;
  }
  let shareBox = document.createElement('div');
  shareBox.id = 'ui-share-box';
  shareBox.style.display = "none";
  shareBox.dataset.spider = "share";
  this.option.$dom = shareBox;

  if (inQQ) {                 // 在QQ中
    shareBox.innerHTML = this._renderShareTip();
    this._loadQQSdk();

  } else if (inWeixin) {    // 在微信中
    shareBox.innerHTML = this._renderShareTip();
    this._loadWeixinSDK();

  } else if (inQQBroswer) {  // 在QQ浏览器中
    shareBox.innerHTML = this._renderSharePanel();
    this._loadQQServer();

  } else if (this.option.isInApp) {
    this._loadJsbridge(option.appContainer);

  } else {
    shareBox.innerHTML = this._renderCopyPanel();
  }

  document.body.appendChild(shareBox);
  this._bindEvent();
};

Share.prototype._loadQQSdk = function () {
  var self = this;
  loadSdk(qqSDK, () => {
    self._initQQShare();
  });
};

Share.prototype._initQQShare = function () {
  var self = this,
    config = {
      title: self.config.title,
      desc: self.config.content,
      share_url: _coverUrlWfr(self.config.url, "qfriendh5"),
      image_url: self.config.img
    };
  window.mqq.data.setShareInfo(config);
};

/**
 * 在微信中，引入jweixin.js
 * @private
 */
Share.prototype._loadWeixinSDK = function () {
  var self = this;
  if (window.wx !== undefined) {
    self._initWeixinShare()
    return;
  }

  if (window.SdkLoader !== undefined) {
    SdkLoader().ready(() => {
      self._initWeixinShare()
    });
    return;
  }

  loadSdk(wxSDK, () => {
    self._initWeixinSDK();
  });
};

/**
 * 微信分享配置
 */
Share.prototype._initWeixinSDK = function () {
  let self = this,
    url = `https://vap.gw.weidian.com/h5/weixin/getjsconfig/1.0?url=${encodeURIComponent(location.href)}&mpid=gh_c6feb778444d`;

  self._ajax(url, (res) => {
    if (res.status.code == 0) {
      let args = res.result;
      // 配置微信JS-SDK
      if (typeof window.WeixinJSBridge === 'undefined') {
        document.addEventListener("WeixinJSBridgeReady", () => {
          self._initWeixinConfig(args);
        }, false)
        return;
      }
      self._initWeixinConfig(args);
    }
  });
};

Share.prototype._initWeixinConfig = function (args) {
  let self = this;
  wx.config({
    beta: true,
    debug: false,
    appId: args.appId,
    timestamp: args.timestamp,
    nonceStr: args.nonceStr,
    signature: args.signature,
    jsApiList: [
      'onMenuShareTimeline',
      'onMenuShareAppMessage',
      'onMenuShareQQ',
      'onMenuShareQZone',
      'hideMenuItems',
      'chooseImage',
      'getLocalImgData',
      'previewImage',
      'downloadImage',
      'openLocation',
      'getLocation',
      'hideMenuItems',
      'launch3rdApp',
      'getInstallState',
      'uploadImage'
    ]
  });

  wx.ready(() => {
    self._setWXMenuEvent();
    self._wxSdkReady = true;
  });
};

Share.prototype._initWeixinShare = function () {
  let self = this;
  if (typeof window.WeixinJSBridge === 'undefined') {
    document.addEventListener("WeixinJSBridgeReady", () => {
      wx.ready(() => {
        self._setWXMenuEvent();
        self._wxSdkReady = true;
      });
    }, false)
    return;
  }

  wx.ready(() => {
    self._setWXMenuEvent();
    self._wxSdkReady = true;
  });
};

Share.prototype._setWXMenuEvent = function () {
  // 分享给朋友
  wx.onMenuShareAppMessage(this._setWeixinConfig('chats'));

  // 分享到朋友圈
  wx.onMenuShareTimeline(this._setWeixinConfig('moments'));

  // 分享到QQ
  wx.onMenuShareQQ(this._setWeixinConfig('qq'));

  // 分享到QQ空间
  wx.onMenuShareQZone(this._setWeixinConfig('qzone'));

  // 隐藏部分菜单按钮
  if (this.option.hideMenuItems.length > 0) {
    wx.hideMenuItems(this._setHideMenuItem());
  }
};

Share.prototype._setHideMenuItem = function () {
  let hideMenuItems = this.option.hideMenuItems;
  let menuList = [];
  let shareIndex = hideMenuItems.indexOf("share");
  let protectIndex = hideMenuItems.indexOf("protect");
  if (shareIndex > -1) {
    [].push.apply(menuList, ["menuItem:share:appMessage", "menuItem:share:timeline", "menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:favorite", "menuItem:share:facebook", "menuItem:share:QZone"])
    hideMenuItems.splice(shareIndex, 1);
  }

  if (protectIndex > -1) {
    [].push.apply(menuList, ["menuItem:editTag", "menuItem:delete", "menuItem:copyUrl", "menuItem:originPage", "menuItem:readMode", "menuItem:openWithQQBrowser", "menuItem:openWithSafari", "menuItem:share:email"])
    hideMenuItems.splice(protectIndex, 1);
  }

  [].push.apply(menuList, hideMenuItems);
  if (menuList.length > 0) {
    return { menuList };
  }

  return {};
}

/**
 * 微信分享参数设置
 * @param way
 * @returns {{title: string, desc: string, link: string, imgUrl: string, trigger: param.trigger, fail: param.fail}}
 * @private
 */
Share.prototype._setWeixinConfig = function (channel) {
  let self = this;
  let channels = {
    chats: '分享给微信好友',
    moments: '分享到朋友圈',
    qq: '分享给qq好友',
    qzone: '分享到qq空间',
  };
  let wfr = WFR_MAP[channel];
  let param = {
    title: self.config.title,
    desc: self.config.content,
    link: _coverUrlWfr(self.config.url, wfr),
    imgUrl: self.config.img,
    trigger(res) {
      if (window.piwik) {
        piwik.paq(`${channels[channel]};dshare${channel.toString()}`, '');
      }

      if (window.spider) {
        spider.trackAction({
          actionName: "_share",
          actionArgs: {
            channel: channels[channel].slice(3)
          }
        })
      }
    },
    success() {
      self.option.wxSuccessCb && self.option.wxSuccessCb(wfr);
    }
  };

  if (channel && (channel === 'moments')) {
    delete param.desc;
    if (channel === 'moments') param.title = self.config.pyq;
  }

  return param;
};

/**
 * 微信模板
 * @returns {string}
 */
Share.prototype._renderShareTip = function () {
  return `${'<a href="javascript:;" class="ui-share__placeholder J_closed"></a>' +
    '<a href="javascript:;" class="ui-share--weixin J_closed">' +
    '<img src="'}${this.option.wxShareTipImge ? this.option.wxShareTipImge : 'https://si.geilicdn.com/110c5d9454010c64fc4366d75230a729.png'}"></a>`;
};

/**
 * 其他模板
 * @returns {string}
 */
Share.prototype._renderSharePanel = function () {
  var html = '';
  var scene = this.option.scene;

  if (scene.indexOf(1) >= 0) {
    html += '<a href="javascript:;" class="ui-share--icon J_channel" scene="0" type="weixin" channel="chats" spm-auto data-spider="dsharechats">' +
      '<img src="https://si.geilicdn.com/hz_img_032100000158d24945100a02685e_48_48_unadjust.png">' +
      '<p>微信好友</p>' +
      '</a>';
  }

  if (scene.indexOf(2) >= 0) {
    html += '<a href="javascript:;" class="ui-share--icon J_channel" scene="1" type="weixin" channel="moments" spm-auto data-spider="dsharemoments">' +
      '<img src="https://si.geilicdn.com/hz_img_033300000158d26282d20a02685e_48_48_unadjust.png">' +
      '<p>朋友圈</p>' +
      '</a>';
  }

  if (scene.indexOf(3) >= 0) {
    html += '<a href="javascript:;" class="ui-share--icon J_channel" type="qq" scene="0" channel="qq" spm-auto data-spider="dshareqq">' +
      '<img src="https://si.geilicdn.com/hz_img_136f00000158d26814dc0a026860_48_48_unadjust.png">' +
      '<p>QQ好友</p>' +
      '</a>';
  }

  if (scene.indexOf(4) >= 0) {
    html += '<a href="javascript:;" class="ui-share--icon J_channel" type="qq" scene="1" channel="qzone" spm-auto data-spider="dshareqzone">' +
      '<img src="https://si.geilicdn.com/hz_img_030900000158d22b05690a02685e_48_48_unadjust.png">' +
      '<p>QQ空间</p>' +
      '</a>';
  }
  return `${'<a href="javascript:;" class="ui-share__placeholder J_closed"></a>' +
    '<section class="ui-share">' +
    '<div class="ui-share--panel">'}${this.option.prependHtml}${html
    }</div><a href="javascript:;" class="ui-share--closed J_closed">取消</a>` +
    `</section>`;
};

Share.prototype._renderCopyPanel = function () {
  return '<a href="javascript:;" class="ui-share__placeholder J_closed"></a>' +
    '<section class="ui-share">' +
    '<div class="ui-share--panel">' +
    '<div class="ui-share-copy">' +
    '<p>长按复制下方链接，去粘贴给好友吧</p>' +
    '<input class="copy-href" type="text">' +
    '</div>' +
    '</div><a href="javascript:;" class="ui-share--closed J_closed">取消</a>' +
    '</section>';
}

/**
 * 在QQ浏览器中唤起本地接口
*/
Share.prototype._loadQQServer = function () {
  loadSdk(qqBrowserServer, () => { });
};

/**
 * 在App中加载jsbridge
*/
Share.prototype._loadJsbridge = function (appName) {
  var self = this;

  if (appName === "vbuyer" && self.option.vbuyerShare) {
    loadSdk(kdjsbridge2, () => {
      self._showVbuyerShare();
    });
    return;
  } else if (appName === "kdweidian" && self.option.wdShare) {
    loadSdk(kdjsbridge2, () => {
      self._showWDShare();
    });
    return;
  }

  loadSdk(kdjsbridge2, () => { });
};

Share.prototype._showVbuyerShare = function () {
  var config = this.config;
  var option = this.option;

  KDJSBridge2.call("Share", "showOption", {
    title: config.title,
    content: config.content,
    content_ext: config.pyq,
    url: config.img,
    cmd: config.url,
    scene: option.scene,
    src: location.href
  }, (res) => { });
};

Share.prototype._showWDShare = function () {
  var config = this.config;
  var option = this.option;

  KDJSBridge2.call("WDJSBridge", "share", {
    title: config.title,
    content: config.content,
    content_ext: config.pyq,
    url: config.img,
    cmd: config.url,
    mini_path: config.path,
    mini_id: config.id,
    mini_withShareTicket: "1",
    mini_programType: config.miniType,
    img_urls: config.img_urls,
    moments_mode: option.momentMode,
    scene: option.scene,
    action_immediately: 0,
  }, (res) => { });
};

/**
 * 绑定事件
 */
Share.prototype._bindEvent = function () {
  var self = this;
  var closed = document.querySelectorAll('.J_closed');
  var channel = document.querySelectorAll('.J_channel');
  var invoking = false;

  for (let i = 0; i < closed.length; i++) {
    closed[i].addEventListener('click', () => { // eslint-disable-line
      invoking = false;
      self.option.$dom.style.display = 'none';
      document.body.classList.remove('ui-share__hidden');
    });
  }

  for (let i = 0; i < channel.length; i++) {
    channel[i].addEventListener('click', function () { // eslint-disable-line
      if (invoking == true) return;
      let channel = this.getAttribute("channel");
      self._shareInQQBrowser(channel);
      invoking = true;

      setTimeout(() => {
        invoking = false;
      }, 5000)
    });
  }
};

/**
 * ajax
 * @param url 调用参数链接
 * @param callback 回调函数
 * @private
 */
Share.prototype._ajax = function (url, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (this.status >= 200 && this.status < 300 || xhr.status == 304) {
      callback && callback(JSON.parse(this.response));
    }
  };
  xhr.open("POST", url, true);
  xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
  xhr.send();
};

/**
 * 调用QQ浏览器分享服务
 * @private
 */
Share.prototype._shareInQQBrowser = function (channel) {
  var curConfig = this.config,
    map = { qq: 4, qzone: 3, chats: 1, moments: 8 },
    toApp = map[channel],
    wfr = WFR_MAP[channel];

  var url = _coverUrlWfr(curConfig.url, wfr);
  var config = {
    url,
    title: curConfig.title,
    description: curConfig.content,
    img_url: curConfig.img,
    to_app: toApp,// 微信好友1,腾讯微博2,QQ空间3,QQ好友4,生成二维码7,微信朋友圈8,啾啾分享9,复制网址10,分享到微博11,创意分享13
  };
  if (toApp == 8) {
    config.title = curConfig.pyq;
  }
  browser.app.share(config);
};

/**
 * 调用native分享
 * @private
 */
Share.prototype._showNativeShare = function () {
  var config = this.config;
  var option = this.option

  KDJSBridge2.call("WDJSBridge", "share", {
    title: config.title,
    content: config.content,
    content_ext: config.pyq,
    url: config.img,
    cmd: config.url,
    mini_path: config.path,
    mini_id: config.id,
    mini_withShareTicket: "1",
    mini_programType: config.miniType,
    img_urls: config.img_urls,
    moments_mode: option.momentMode,
    scene: option.scene
  }, (res) => { });
}

/**
 * 加载jsSDK
 * @param src sdk链接
 * @param cb  回调函数
 */
function loadSdk(src, cb) {
  var script = document.createElement('script');
  script.src = src;
  script.addEventListener('load', () => {
    cb();
  });
  document.body.appendChild(script);
}

/**
 * 克隆对象或分配对象
 * @param obj
 * @returns {object}
 * @private
 */
function assgin(target) {
  var sourceArray = [].slice.call(arguments, 1); // eslint-disable-line
  sourceArray.forEach((source) => {
    for (let key in source) {
      if (source.hasOwnProperty(key) && !target.hasOwnProperty(key)) { // eslint-disable-line
        target[key] = source[key];
      }
    }
  })
  return target;
}

function _coverUrlWfr(url, wfr) {
  var parsedUrl = _urlParse(url);
  var hash = parsedUrl.hash;

  var inheritWfr = _queryStringParse(location.search).wfr;
  if (!inheritWfr) {
    inheritWfr = "h5direct"
  } else {
    Object.keys(WFR_MAP).forEach((channel) => {
      var wfr = WFR_MAP[channel];
      inheritWfr = inheritWfr.replace(`_${wfr}`, "");
    })
  }

  let queryParam = _queryStringParse(parsedUrl.search);
  queryParam.wfr = `${inheritWfr}_${wfr}`;

  let querystring = _queryStringStringify(queryParam);
  return `${url.replace(/(\?|#)[\S]*$/, "")}?${querystring}${hash}`;
}

function _urlParse(url) {
  var anchor = document.createElement("a");
  anchor.href = url;
  return anchor;
}

function _queryStringParse(querystring) {
  var ret = {};

  querystring = querystring.replace("?", "");

  if (querystring !== "") {
    querystring.split("&").forEach((entry) => {
      var arr = entry.split("=");
      ret[decodeURIComponent(arr[0])] = decodeURIComponent(arr[1] || "");
    });
  }

  return ret;
}

function _queryStringStringify(query) {
  var arr = [];
  for (let key in query) {
    if (query[key] === "" || query[key] === undefined || query[key] === null) continue;
    arr.push(`${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`);
  }
  return arr.length === 0 ? "" : arr.join("&");
}

/**
 * 是否微信 true: 微信  false:不是微信
 * @returns {boolean}
 */
function isInWeixin() {
  return /MicroMessenger/i.test(ua);
}

function isInQQ() {
  return /QQ\/([\d\.]+)/i.test(ua);
}

function isInQQBroswer() {
  return /MQQBrowser\//i.test(ua) && !isInQQ();
}

/**
 * 判断是否在App中
 * @return {boolean}
 * private
 */
function isInApp() {
  return !!getAppContainer();
}

/**
 * 获取当前所在App名称
 * @return {string}
 * private
 */
function getAppContainer() {
  if (/WDAPP\(KD/.test(ua)) return 'koudai';
  if (/WDAPP\(BanJia/.test(ua)) return 'banjia';
  if (/WDAPP\(HaiDai/.test(ua)) return 'global';
  if (/WDAPP\(WDBuyer/.test(ua)) return 'vbuyer';
  if (/WDAPP\(WD\//.test(ua)) return 'kdweidian';
  if (/WDAPP\(PPS/.test(ua)) return 'pps';
  if (/WDAPP\(VDTuwen/.test(ua)) return 'ruyu';
  if (/WDAPP\(WDCampus/.test(ua)) return 'school';
  if (/WDAPP\(VDSword/.test(ua)) return 'input';
  if (/WDAPP\(/.test(ua)) return 'wdapp';
  return '';
}

export default Share;