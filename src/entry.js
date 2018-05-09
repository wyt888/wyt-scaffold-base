
// 加载样式
import 'babel-polyfill';
import './style.less';
import {
  docReady
} from '@/js/services/docReady.js';

import {
  checkLogin
} from '@/js/services/login';

import pageOne from '@/js/pageOne';

// import Share from '@/js/lib/share/share-v2/src/index';

(() => {

  // 登陆校验
  checkLogin();

  docReady(() => {

    // let url = `${window.location.origin + window.location.pathname}#/`;
    // let defaultCfg = {
    //   title: "微店抱团群组",
    //   content: '抱团群组可帮助商家及时了解官方活动，找到同类商家',
    //   url,
    //   img: 'https://si.geilicdn.com/vshop-shop-logo-default.jpg',
    // };

    // const share = new Share({
    //   config: defaultCfg,
    // });

    pageOne.init();

  });

})(document);


