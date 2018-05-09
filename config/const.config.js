
const ENV = process.env.ENV;
const CONSTANT_CONFIG = {
  DAILY: {
    __LOGIN_API__: JSON.stringify('https://sso-daily.test.weidian.com'),
    // __LOGIN_API__: JSON.stringify('https://wd.daily.weidian.com'),
    __VAP_API__: JSON.stringify('https://vap.gw.daily.weidian.com'),

  },
  PRE: {
    // __LOGIN_API__: JSON.stringify('https://sso-pre.test.weidian.com'),
    __LOGIN_API__: JSON.stringify('https://wd.pre.weidian.com'),
    __VAP_API__: JSON.stringify('https://vap.gw.pre.weidian.com'),
  },
  PROD: {
    __LOGIN_API__: JSON.stringify('https://sso.weidian.com'),
    __VAP_API__: JSON.stringify('https://vap.gw.weidian.com'),
  },
};

function getConstant() {
  if (ENV === 'env') {
    return CONSTANT_CONFIG.DAILY;
  } else if (ENV === 'daily') {
    return CONSTANT_CONFIG.DAILY;
  } else if (ENV === 'pre') {
    return CONSTANT_CONFIG.PRE;
  } else if (ENV === 'prod') {
    return CONSTANT_CONFIG.PROD;
  } else {
    return CONSTANT_CONFIG.DAILY;
  }
}


module.exports = getConstant()
