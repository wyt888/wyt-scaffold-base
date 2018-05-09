/**
 * @description 分享组件开发
 */
import Share from '@/utils/share/share-v2/src/index';

let url = `${window.location.origin + window.location.pathname}#/`;
let defaultCfg = {
  title: "微店抱团群组",
  content: '抱团群组可帮助商家及时了解官方活动，找到同类商家',
  url,
  img: 'https://si.geilicdn.com/vshop-shop-logo-default.jpg',
};

const share = new Share({
  config: defaultCfg,
});

export default share

export function showPanel() {
  share.showPanel();
}

export function setShare(info) {
  if (info && info.title && info.url && info.img) {
    info.img = fixImgHttp(info.img);
    share.resetUserConfig(info)
  } else {
    defaultCfg.url = window.location.href;
    share.resetUserConfig(defaultCfg)
  }
}

// 修正图片的HTTP头 // 增加 http：
function fixImgHttp(url) {
  let regexp = /^(http:\/\/|https:\/\/)/;
  if (regexp.test(url)) {
    return url;
  } else {
    return `https:${url}`
  }
}