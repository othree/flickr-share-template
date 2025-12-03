/*jslint vars: true, browser: true */
/*global chrome: false */
(function () {
  "use strict";

  var showAction = function (tabId, changeInfo, tab) {
    var url = tab.url;

    if (!url) {
      return;
    }

    var urlobj;
    try {
      urlobj = new URL(url);
    } catch (e) {
      return;
    }

    var frags = urlobj.pathname.split("/");

    if (
      (urlobj.hostname === "www.flickr.com" ||
        urlobj.hostname === "flickr.com") &&
      frags.length >= 4 &&
      frags[1] === "photos" &&
      /^\d+$/.test(frags[3])
    ) {
      chrome.action.enable(tabId);
    } else {
      chrome.action.disable(tabId);
    }
  };

  chrome.tabs.onUpdated.addListener(showAction);
})();
