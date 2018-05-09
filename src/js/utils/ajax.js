/**
 * @description axios 配置
 */
import axios from 'axios';
import Qs from 'qs';

const cfg = {
  withCredentials: true,
  baseURL: `${__VAP_API__}/h5`,
  // transformRequest: [(data) => {
  //   // post 请求中对 data参数处理
  //   data = Qs.stringify(data);
  //   return data;
  // }],
};

function resInterceptor(response) {
  let responseData = { result: {}, status: {} };
  if (response.data) {
    responseData = response.data;
  }
  return responseData;
}

// 加入拦截器的ajax
const $ajax = axios.create(cfg);
$ajax.interceptors.response.use(resInterceptor, (error) => {
  return Promise.reject(error);
});

export {
  $ajax,
}