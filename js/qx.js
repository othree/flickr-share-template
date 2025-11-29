/*jslint vars: true, plusplus: true, browser: true */
/*global DOMParser: false, Q: false */

(function (root) {
  "use strict";

  var QX = {
    get: function (url) {
      var req = new XMLHttpRequest(),
        dfd = Q.defer();
      req.open("GET", url, true);
      req.onload = function (event) {
        if (req.status === 200) {
          dfd.resolve(req.response);
        } else {
          dfd.reject();
        }
      };
      req.send();
      return dfd.promise;
    },

    text2XML: function (text) {
      var parser = new DOMParser();
      return parser.parseFromString(text, "text/xml");
    },

    getXML: function (url) {
      return QX.get(url).then(QX.text2XML);
    },
  };

  root.QX = QX;
})(this);
