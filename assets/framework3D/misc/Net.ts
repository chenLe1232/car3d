import { assetManager, loader, resources } from 'cc';
import { JSB } from 'cc/env';

export default class Net {
  static Code = {
    Error: '__error__',
    Success: 1,
    Timeout: '__timeout__',
  };

  _timeout: number = 8000;

  setTimeout(v: any) {
    this._timeout = v;
  }

  httpRequest(url: any, method: any, params?: any): Promise<string> {
    console.warn('[' + method + ']: ' + url);
    return new Promise(_ => {
      var time = false; //是否超时
      var timer = setTimeout(function () {
        time = true;
        xhr.abort(); //请求中止
        _(Net.Code.Timeout);
      }, this._timeout);
      var xhr = loader.getXMLHttpRequest(); //loader
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            var respone = xhr.responseText;
            if (time) return; //请求已经超时，忽略中止请求
            clearTimeout(timer); //取消等待的超时
            _(respone);
          } else {
            _();
          }
        }
      };
      xhr.open(method, url, true);

      if (JSB) {
        xhr.setRequestHeader('Accept-Encoding', 'gzip,deflate');
      }
      Object.keys(this.headers).forEach(k => {
        let v = this.headers[k];
        xhr.setRequestHeader(k, v);
      });

      // note: In Internet Explorer, the timeout property may be set only after calling the open()
      // method and before calling the send() method.
      xhr.timeout = this._timeout; // 8 seconds for timeout
      if (method == 'POST' || method == 'PUT') {
        //set params to body
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(params);
      } else {
        xhr.send();
      }
    });
  }

  headers = {};

  setHeader(key: any, value: any) {
    this.headers[key] = value;
  }

  httpGet(url: any, params?: any) {
    if (params && url.indexOf('?') == -1) {
      if (Object.keys(params).length > 0) url += '?';
    }
    if (params)
      url += Object.keys(params)
        .map(k => `${k}=${params[k]}`)
        .join('&');
    return this.httpRequest(url, 'GET');
  }

  httpPost(url: any, params?: any): Promise<string> {
    return this.httpRequest(url, 'POST', params);
  }

  httpPut(url: any, params?: any) {
    return this.httpRequest(url, 'PUT', params);
  }
}

export let net: Net = new Net();
