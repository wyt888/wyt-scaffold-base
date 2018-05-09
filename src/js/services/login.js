
import {
  parseCookies,
} from '../utils';

function doLogin(obj) {
  document.domain = 'weidian.com';
  if (toString.call(obj) === '[object Object]') {
    obj.redirect = obj.redirect || window.location.href;
  } else {
    obj = {
      redirect: window.location.href,
    };
  }

  window.location.href = `${__LOGIN_API__}/login/index.php?${encodeURIComponent(
    JSON.stringify(obj),
  )}`;
}

function checkLogin() {
  const cookieStorage = parseCookies();
  if (cookieStorage && !cookieStorage.isLogin) {
    doLogin();
  }
}

export {
  checkLogin,
  doLogin,
}