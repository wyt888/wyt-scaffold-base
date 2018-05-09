# Share-v2

#### 目录结构

```javascript
.
├── ChangeLog.md
├── README.md
├── bower.json
├── build
│   └── static
├── demo
│   └── share.html
├── gulpfile.js
├── node_modules
├── package.json
├── src
│   ├── index.js
│   ├── index.less
│   ├── jsbridge2.js
│   └── jweixin.js
└── webpack.config.js
```

jweixin.js		微信 jssdk 源码

jsbridge2.js		微店 jsbridge js端源码



#### 引入文件：

##### 支持CDN引用CommonJS引用

```html
// CommonJS引入
<script>
	var ShareV2 = require('userPath/share-v2/build/static/index.min.js');
</script>

// cdn引入
<script type="text/javascript" src='assets.geilicdn.com/v-components/share-v2/2.4.5/index.min.js'></script>
```

为了让业务方能够更方便的接入组件，组件使用 `webpack` 打包，将 css 文件与 js 文件合并。此时用标准的兼容写法加载组件会导致 CDN 引用时，组件没有暴露在 window 上。原因是在打包时，`webpack` 将实现 module 对象，导致组件以模块的方式加载。因此学习 QQsdk 的加载方式，现在当前 `this` 对象上暴露组件，再考虑模块的加载方式。

```javascript
!(function(factory){
    var Share = factory();
    this.ShareV2 = Share;
    if (typeof module !== "undefined" && module.exports) {
        module.exports = Share;
    }
}(function(){
  	// main
}));
```




#### 初始化分享：

##### 业务方在分享前需要先创建shareV2实例。

```
var share = new ShareV2(setting)
```

> setting主要分为两个对象，config 和 option。调用后会返回 shareV2实例。

| 属性名    | 类型   | 说明             | 每项是否必传 |
| ------ | ---- | -------------- | ------ |
| config | 对象   | 业务方希望分享出去的可见信息 | 是      |
| option | 对象   | 自定义分享功能外的额外功能  | 否      |

##### 分享配置项：

```
{
    config:{
        title: '微信好友分享标题',
        pyq:'朋友圈单独分享文案',
        content: '微信好友分享内容',
        url: '分享链接',
        img: '分享主图',
        img_urls: '仅多图分享使用',
        path: '仅小程序使用',
        id: '仅小程序使用'
    },
    option:{}
}
```

##### 可选 option 配置

| 配置字段           | 备注                                       | 类型       | 默认值                                |
| -------------- | ---------------------------------------- | -------- | ---------------------------------- |
| vbuyerShare    | 是否买家版右上角分享按钮                             | Boolean  | true                               |
| wdShare        | 是否卖家版右上角分享按钮                             | Boolean  | true                               |
| shareChannel   | 分享渠道                                     | [String] | ["chats", "moment", "qq", "qzone"] |
| wxShareTipImge | 微信中提示右上角分享的图片                            | String   | ""                                 |
| wxSuccessCb    | 微信分享成功的回调函数                              | function | null                               |
| hideMenuItems  | 微信中需要隐藏的菜单按钮                             | [String] | []                                 |
| scene          | App分享面板按钮控制{1:微信好友,2:朋友圈,3:qq好友,4:qq空间,5:微博,6复制链接} | [Number] | [1,2,3,4,5]                        |
| momentMode     | 卖家版 native 面板朋友圈分享方式{0:普通分享,1:多图分享,2:大图分享,3:小程序分享} | Number   | 0                                  |

> notice:
>
> hideMenuItems 可添加菜单项： [阅读附录3](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421141115)
>
> 提供关键字 "share": 隐藏所有传播类， "protect": 隐藏所有保护类


#### 实例

```javascript
var share = new ShareV2({
    config:{
        title: '上传攻略赢双人日本东京自由行免费机票！',
        pyq:'我上传了攻略，你也一起来赢双人日本东京自由行免费机票吧。',
        content: '灵感生活探店达人招募大赛邀请你参加。',
        url: window.location.href,
        img: 'http://wd.geilicdn.com/3caa5cc65ef3f8a3b0c394e1cd1b935c.png'
    },
    option:{
        shareChannel: ["chats", "moments", "qq", 'qzone'],
        wxSuccessCb: function(wfr) {
			_ajax.get("addScore", {});
		}
    }
})
```



#### 接口


##### 打开分享面板

```javascript
share.showPanel();
```

> 在微信中会提示右上角分享，微店App中会弹出 Native 提供的分享面板。一般浏览器中弹出复制链接面板，QQ 浏览器中弹出 H5 分享面板。
> 目前分享面板分为四类，如下

| 容器       | 分享面板类型     | 如何配置                  |
| -------- | ---------- | --------------------- |
| 普通浏览器    | 复制文本框      | 无                     |
| QQ浏览器    | h5分享面板     | option.shareChannel   |
| 微信       | 分享提示图片     | option.wxShareTipImge |
| 微店、微店买家版 | native分享面板 | 未全部实现定制               |


##### 重设用户分享信息

```javascript
var newConfig = {
	title: '我是重新设置的title',
    pyq:'我是重新设置的朋友圈title',
    content: '我是重新设置的内容',
    url: 'weidian.com',
    img: 'http://wd.geilicdn.com/3caa5cc65ef3f8a3b0c394e1cd1b935c.png',
}
share.resetUserConfig(newConfig)
```

##### 重设分享组件配置参数

```javascript
var newOption = {
    shareChannel: ["chats", "moments"],
}
share.resetShareOption(newOption)
```

##### 对外接口，单个分享渠道（仅适用于QQ浏览器）

```javascript
// 分享到朋友圈
share.sharePyq();

// 分享到微信好友
share.shareChats();

//分享到QQ好友
share.shareQQ();

//分享到QQ空间    
share.shareQZone();
```



#### 常见问题：

##### 多次加载微信 sdk

- 目前分享组件在内部加入了大量微信 API。业务方可以直接使用。

- 如果分享组件中的 APIlist 不能满足需求，请使用 SDKLoader。


##### 重设分享参数：

- 分享组件只需要初始化一次，如果需要改动配置参数请调用 API。

- 用户修改参数务必调用 API ，如果单纯修改 share.config 中配置的值，本次修改将不会应用到微信分享、微店、微店买家版的右上角分享。组件会在调用 API 时重新配置这些参数。
- QQ分享无法重置参数。


##### 分享配置未生效：

- 微信只支持 80 端口分享。
- 一个公众号支持三个域名的分享，若域名未在公众号后台配置，则无法分享。
- 分享链接的域名必须和当前页面域名相同。
- IOS中，如果不配置 content，则默认显示当前链接域名；安卓置空。
- 分享图片链接不能是相对协议头，必须写死，否则无法识别。
- url 必须是全路径，不可以是相对路径。


- 微店买家版中，缺少任意 config 参数则右上角分享无法初始化。
- 若某一分享配置为空，微信会提供默认值。
  - 分享标题：默认文档标题。
  - 分享主图：默认文档中第一张图片。
- 微信、微店App中，分享异步配置。如果用户分享速度非常快，可能出现未成功配置的情况。




#### CSS样式

##### 默认样式

shareV2组件提供默认样式，以 `ui-share` 为前缀。为统一分享组件UI，理论上使用默认样式，不支持自定义分享面板。如有特殊情况，可自定义样式并调用组件内部方法。

##### 样式文件index.less

为保证屏幕适配，shareV2组件选择rem为尺寸单位，未来可能会改为 vw 为单位。组件依据flexible进行尺寸设定，如有出入可自行调节。



#### 关于判断各环境UA

##### QQ：

```javascript
/QQ\/([\d\.]+)/i.test(ua)
```

##### 微信：

```javascript
/MicroMessenger/i.test(ua)
```

##### App:[统一UA规范](http://confluence.vdian.net/pages/viewpage.action?pageId=4428398)

```javascript
if(/WDAPP\(KD/.test(ua)) return 'koudai';
if(/WDAPP\(BanJia/.test(ua)) return 'banjia';
if(/WDAPP\(HaiDai/.test(ua)) return 'global';
if(/WDAPP\(WDBuyer/.test(ua)) return 'vbuyer';
if(/WDAPP\(WD\//.test(ua)) return 'kdweidian';
if(/WDAPP\(PPS/.test(ua)) return 'pps';
if(/WDAPP\(VDTuwen/.test(ua)) return 'ruyu';
if(/WDAPP\(WDCampus/.test(ua)) return 'school';
```

> IOS腾讯移动端的浏览器UA中都会存在 `MQQBrowser` ，QQ中独有标识 `QQ/+版本号` 。需要先判断QQ客户端再判断QQ浏览器。


#### 目前App等待实现的功能

- ``context_ext` 朋友圈单独分享字段
  - 卖家版全部实现。
  - 买家版弹出面板未实现，右上角实现分享实现。
- `scene` 分享面板显示的分享渠道定制
  - 卖家版实现。
  - 买家版未实现。



#### 其他

##### 微信签名认证

微信签名认证主要分成四部分。

- 公众号配置开发权限，获取 `appId` 与 `appSecret` ，设置白名单。
- 中控服务端缓存与更新全局 access_token。
- 业务服务端获取 jsapi_ticket，生成签名，返回前端。
- 前端向微信传入指定参数，认证权限。

##### wfr管理与path-tracker的关联

- 从2.4.0开始，`path-tracker` 对 shareV2 组件进行了封装，并暴露全部接口。


- 为了对分享到微信的页面进行 `wfr` 的管理，分享组件在用户进行分享操作时，对 `wfr` 参数做了统一的管理，目前与 Native 端保持一致。
  - 微信朋友圈：wxGroupShare
  - 微信好友：wxShare
  - QQ 空间：qzoneShare
  - QQ：qqShare

##### 业务方需要调用微信中其他Api时，如何控制多次加载

微信签名认证分在前端主要分为三个阶段

- 业务方加载 微信jssdk
- `wx.config` 认证
- `wx.ready` 完成认证

加载 jssdk 后，`window` 上存在 `wx` 对象。但微信并没有变量来对当前认证状态做判断。分享组件无法判断业务方是否已经自行进行 `wx.config` 认证，或是认证成功与否。

因此，分享组件认为，当业务方加载微信 jssdk 时，就会进行认证。如果业务方有此类需求，需要在认证的 jsApiList 中传入分享需要的 api。分享组件会在 `wx.ready` 中对进行下一步操作。 

```javascript
wx.config({
    debug: false,
    appId: args.appId,
    timestamp: args.timestamp,
    nonceStr: args.nonceStr,
    signature: args.signature,
    jsApiList: [
    	yourApiList
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'onMenuShareQQ',
        'onMenuShareQZone',
    ]
});
```

> 现在分享组件中已经加入大量可用API，一般不需要业务方调用。如果调用处较多，则可以使用 sdk-loader 组件做统一管理。