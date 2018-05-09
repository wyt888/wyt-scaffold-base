
import {
  getOwnerInfo,
} from '@/js/services/interface';

import pageTwo from './pageTwo';

const doc = window.document;
let video = doc.querySelector('#video_ele');

function clacSize() {
  const defaultP = 0.6;
  const defaultHP = 0.9;
  const winW = window.innerWidth
  const winH = window.innerHeight
  const winP = winW / winH;
  let fixH, fixW;
  if (winP > defaultP) {
    fixH = Math.floor(winH * defaultHP);
    fixW = Math.ceil(fixH * defaultP);
  }

  let dpr = Number(document.documentElement.getAttribute('data-dpr')) || 1;
  // let gap = Math.floor((winW - fixW) / 2) * dpr;
  let gap = Math.floor((winW - fixW) / 2);

  let wrapper = doc.querySelector('#pageOneWrapper');
  wrapper.style.left = gap + 'px';
  wrapper.style.right = gap + 'px';
  // wrapper.style.height = fixH * dpr + 'px';
  // wrapper.style.width = fixW * dpr + 'px';

  wrapper.style.height = fixH + 'px';
  wrapper.style.width = fixW + 'px';
}

function setShopInfo(shopInfo) {
  doc.querySelector('#shopName').textContent = shopInfo.shopName;
  doc.querySelector('#pageOne_bg').innerHTML = `<img src="${shopInfo.shopImg}" alt=""/>`;
}

function bindVideo({ coverImg, videoUrl }) {
  let _cover = doc.querySelector('#video_cover');
  if (coverImg) {
    if (coverImg.indexOf('?') > 0) {
      coverImg = coverImg.substring(0, coverImg.indexOf('?'));
    }
    coverImg += '?w=500&h=281';
  } else {
    coverImg = 'https://si.geilicdn.com/vshop-default-shoplogo-logo1.jpg?w=1000&h=1000'
  }
  _cover.innerHTML = `<img src="${coverImg}" alt=""/>`;

  video.setAttribute('src', videoUrl)
  _cover.addEventListener('click', function () {
    _cover.style.display = 'none';
    video.play();
  });
}

function showPage() {
  doc.querySelector('#pageOne').style.display = 'block';
  doc.querySelector('#loading').style.display = 'none';

}


export default {
  init: () => {

    // 加载首屏数据
    getOwnerInfo().then(function ({ shopInfo, userInfo, videoInfo }) {

      if (shopInfo) {
        setShopInfo(shopInfo);
      }

      // 计算屏幕尺寸与展示的尺寸。    
      clacSize()

      if (videoInfo) {
        // 视频事件绑定
        bindVideo(videoInfo);
      }

      showPage();

      setTimeout(function () {
        pageTwo.preload(userInfo);
      })

      // 按钮事件绑定
      doc.querySelector('#createPage').addEventListener('click', function () {
        doc.querySelector('#loading').style.display = 'block';
        doc.querySelector('#pageOne').style.display = 'none';

        video.pause();
        pageTwo.createPage();
      });
    });
  }
}
