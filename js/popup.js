/*jslint vars: true, plusplus: true, browser: true */
/*global chrome: false*/

(function () {
    "use strict";

    document.querySelector('#expand span').addEventListener('click', function () {
        var txt = document.getElementById('template_txt');
        var doc = document.getElementById('doc');
        if (txt.style.display !== 'inline') {
            txt.style.display = 'inline';
            doc.style.display = 'block';
            this.innerHTML = 'hide';
        } else {
            txt.style.display = 'none';
            doc.style.display = 'none';
            this.innerHTML = 'show';
        }
    });

    var openInNewTab = function (url) {
        return chrome.tabs.create({url: url});
    };
    var openLinkInNewTab = function (link) {
        return openInNewTab(this.getAttribute('href'));
    };

    var links = document.querySelectorAll('p a'),
        i = 0;
    for (i = 0; i < links.length; i++) {
        links[i].addEventListener('click', openLinkInNewTab, false);
    }

}());
