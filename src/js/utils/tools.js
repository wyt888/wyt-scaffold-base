
export function parseUrlQuery(param) {
  param = param.replace('?', '').split('&');
  const result = {};
  if (param.length > 0) {
    param.forEach((item) => {
      const itemList = item.split('=');
      result[itemList[0]] = itemList[1];
    });
  }
  return result;
}

export function parseCookies() {
  const cookies = {};
  document.cookie.split('; ').forEach((item) => {
    const itemList = item.split('=');
    cookies[itemList[0]] = itemList[1];
  });
  return cookies;
}

