(function (XHR) {
  "use strict";

  var open = XHR.prototype.open;
  var send = XHR.prototype.send;

  XHR.prototype.open = function (method, url, async, user, pass) {
    this._url = url;
    open.call(this, method, url, async, user, pass);
  };

  XHR.prototype.send = function (data) {
    var self = this;
    var url = this._url;

    if (url && url.toLowerCase() === "https://ifm8j86spyejgsfbvvzsy2x3-fast.searchtap.net/v2".toLowerCase()) {
      const body = JSON.parse(data);
        //body.facetCount = 500;
      data = JSON.stringify(body);
    }
    send.call(this, data);
  }
})(XMLHttpRequest);