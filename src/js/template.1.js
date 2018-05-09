
const doc = document;
function getNumFormat(num) {
  return Number(num) > 9 ? num : '0' + num
}

function getCurTime() {
  var _date = new Date();
  return `${getNumFormat(_date.getHours())}:${getNumFormat(_date.getMinutes())}`
}

function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);
  var ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
  var dataURL = canvas.toDataURL("image/" + ext);
  return dataURL;
}

function loadImg(src) {
  let res = '';
  let _promise = new Promise(function (resolve, reject) {
    if (src) {
      let img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () {
        resolve(getBase64Image(img));
        // resolve(src);
        img = null;
      };
      img.onerror = function () {
        resolve('');
        img = null;
      };
      img.src = src;
    } else {
      resolve('');
    }
  });
  return _promise
}

function getImgEle(src) {
  return `<img src="${src}" alt="" crossorigin="anonymous">`
}

function getGoods(info, promiseArr, dom) {
  let res = '';
  let len = 0;
  if (info) {
    len = info.length > 2 ? 3 : info.length;
  }
  for (let i = 0; i < len; i++) {
    res += `
      <div class="page__sss-products-img" id="goodsImg${i}"></div>
    `;
    (function (num) {
      promiseArr.push(loadImg(info[num].itemMainPic).then(function (res) {
        if (res) {
          dom.querySelector(`#goodsImg${num}`).innerHTML = getImgEle(res);
        }
        return true;
      }));
    })(i);
  }
  dom.querySelector('.page__sss-products').innerHTML = res;
  // <div class="page__sss-products-img">${getImgEle(info[i].itemMainPic)}</div>

}

function getSayIng(infos) {
  return infos.text;
}

function renderSaying(shopInfo) {
  let res = '';
  if (shopInfo.sayingNum) {
    res += `
      <div class="page__sss-title">回头客说 - <span>${shopInfo.sayingNum}</span>条</div>
      <div class="page__sss-desc">${getSayIng(shopInfo.saying)}</div>
    `;
  } else {
    res += `<div class="page__sss-title">店铺公告</div>`;
    if (shopInfo.shopNote) {
      res += `<div class="page__sss-desc">${shopInfo.shopNote}</div>`;
    } else {
      res += '<div class="page__sss-desc">欢迎光临小店，我的产品就是我最好的名片。小店给你好回忆，比一个忆更有意义！</div>';
    }
  }
  return res;
}

function renderBody(userInfo, shopInfo, qrCode) {
  return `
  <section class="page__screenshot">
    <div class="page__ssu-time">${getCurTime()}</div>
    <div class="page__ssu-photo"></div>
    <div class="page__ssu-name"></div>
    <div class="page__ssu-shop">
      <div class="page__sss-info">
        <div class="page__sss-logo"></div>
        <div class="page__sss-data">
          <p class="page__sss-name"></p>
          <div class="page__sss-statistic">
            <div class="page__sss-headBack">回头率 ${shopInfo.repurRatePercent || '0%'}</div>
            <div class="page__sss-line"></div>
            <div class="page__sss-buyNum">${parseInt(shopInfo.payBuyerCnt) || 0} 人买过</div>
          </div>
        </div>
        <div class="page__sss-btn">收藏</div>
      </div>
      <div class="page__sss-products"></div>
      <div class="page__sss-custom">${renderSaying(shopInfo)}</div>
    </div>
    <div class="page__ss-mask">
      <div class="page__ss-qrcode"></div>
    </div>
  </section>
  `
}

export function getPicTemp(userInfo, shopInfo, qrCode) {
  let dom = doc.createElement('div');

  dom.innerHTML = renderBody(userInfo, shopInfo, qrCode);

  let _resArr = [];
  _resArr.push(loadImg(userInfo.headImg).then(function (res) {
    if (res) {
      dom.querySelector('.page__ssu-photo').innerHTML = getImgEle(res);
    }
    return true;
  }));

  _resArr.push(loadImg(shopInfo.shopLogo).then(function (res) {
    if (res) {
      dom.querySelector('.page__sss-logo').innerHTML = getImgEle(res);
    }
    return true;
  }));

  getGoods(shopInfo.topItems, _resArr, dom);

  _resArr.push(loadImg(qrCode).then(function (res) {
    if (res) {
      dom.querySelector('.page__ss-qrcode').innerHTML = getImgEle(res);
    }
    return true;
  }));

  // 文本单独插入 防止转义
  dom.querySelector('.page__ssu-name').textContent = `--${userInfo.nickname}`;
  dom.querySelector('.page__sss-name').textContent = `${shopInfo.shopName}`

    ;
  return Promise.all(_resArr).then(function () {
    return dom.querySelector('.page__screenshot');
  });
}