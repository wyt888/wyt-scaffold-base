
import {
  $ajax,
} from '../utils';

import {
  doLogin
} from '@/js/services/login';

function resInterceptor({ result, status }) {
  let responseResult = {};
  if (status && Number(status.code) === 0) {
    responseResult = result || {};
  } else if (status && Number(status.code) === 2) {
    // 登陆错误跳转登陆页面
    doLogin();
  }
  return responseResult;
}

// 加入拦截器的ajax
$ajax.interceptors.response.use(resInterceptor, (error) => {
  return Promise.reject(error);
});

export function getOwnerInfo(imGid) {
  return $ajax.get('/medusa/wdrevision.mine/1.0');
}

export function getWxCode(imGid) {
  return $ajax.get('/medusa/wdrevision.getwxacode/1.0');
}

export function getShopCard(imGid) {
  return $ajax.get('/ares/shop.getShopCardInfo/1.1');
}
