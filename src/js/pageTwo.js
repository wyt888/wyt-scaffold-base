
import {
  getWxCode,
  getShopCard,
} from '@/js/services/interface';

import {
  getPicTemp,
} from './template';

const doc = window.document;
let loadPromise;
let createTag = false;

function loadData(userInfo) {
  let _arr = [
    getWxCode().then(({ qrCode }) => {
      return qrCode;
    }),
    getShopCard().then((data) => {
      return data.shopInfo || data
    })
  ];

  return Promise.all(_arr).then((res) => {
    const [qrCode, shopInfo] = res;
    return getPicTemp(userInfo, shopInfo, qrCode);
  });
}

function loadSource() {
  let _arr = [
    loadPromise,
    require.ensure([], function (require) {
      return require('@/js/lib/html2canvas');
    })
  ];
  return Promise.all(_arr)
}

/**
 * 创建图片
 * @param {html2canvas} html2canvas 
 */
function createPic(html2canvas) {

  let tmp = doc.querySelector('.page__screenshot');

  html2canvas(tmp, {
    useCORS: true,//允许加载跨域的图片
    tainttest: true, //检测每张图片都已经加载完成
    logging: false, //日志开关，发布的时候记得改成false
  }).then(function (canvas) {

    doc.body.removeChild(tmp);

    // doc.querySelector('#pageOne').style.display = 'none';
    doc.querySelector('#loading').style.display = 'none';
    doc.querySelector('#pageTwo').style.display = 'block';
    try {
      // canvas.toDataURL("image/png");
      doc.querySelector('#container').innerHTML = `<img src="${canvas.toDataURL("image/png")}" alt="">`;
    } catch (e) {
      alert(e);
    }

  });

}


export default {
  preload: (userInfo) => {
    if (!loadPromise) {
      loadPromise = loadData(userInfo)
    }
  },
  createPage: () => {
    if (createTag) {
      return false
    } else {
      createTag = true;
    }

    // doc.querySelector('.marketing-content').style.display = 'none';

    loadSource().then((res) => {

      const [tmp, html2canvas] = res;

      doc.body.appendChild(tmp);

      createPic(html2canvas);

    });
  }
}


    // doc.querySelector('#container').appendChild(canvas);
    // let img = doc.createElement('img');
    // img.src=canvas.toDataURL
