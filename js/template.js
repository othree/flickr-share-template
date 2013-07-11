/*jslint vars: true, browser: true */
/*global chrome: false, Q: false, QX: false, flickr: false*/

(function () {
    "use strict";

    var urltpl = 'template/default.mustache';

    var current_tpl = '';

    var hogan = document.getElementById('hogan').contentWindow;

    var show = function () {
        document.getElementById('share').style.display = 'block';
        document.getElementById('template').style.display = 'block';
        document.getElementById('nosupport').style.display = 'none';
        document.getElementById('loading').style.display = 'none';
    };

    var handler = {
        compileDone: function () {
        },
        renderDone: function (result) {
            document.getElementById('share_txt').innerHTML = result;
            show();
        }
    };

    window.addEventListener('message', function (event) {
        var data = event.data;
        handler[data.event](data.value);
    }, false);

    var render = function (data) {
        hogan.postMessage({render: [data]}, '*');
    };

    var active = function (photo_id) {
        flickr.get(photo_id).then(render);
    };

    var go = function () {
        chrome.tabs.query({active: true}, function (tabs) {
            var tab = tabs[0],
                url = tab.url,
                urlobj = document.createElement('a');

            urlobj.href = url;

            var frags = urlobj.pathname.split('/');

            active(frags[3]);
        });
    };

    var newTemplate = function (tpl) {
        if (tpl !== current_tpl) {
            current_tpl = tpl;
            localStorage.setItem('template', tpl);
            hogan.postMessage({compile: [tpl]}, '*');
        }
    };

    var defaultTplDfd = QX.get(urltpl);

    var fillDefaultTpl = function (tpl) {
        if (tpl) { return tpl; }
        return defaultTplDfd;
    };

    var readAndGo = function () {
        Q.resolve(this.value).then(fillDefaultTpl).then(function (tpl) {
            newTemplate(tpl);
            go();
        });
    };

    document.getElementById('template_txt').addEventListener('blur', readAndGo, false);
    document.getElementById('template_txt').addEventListener('keydown', function (event) {
        if (event.keyCode === 13) { readAndGo(); }
    }, false);

    var tpldfd = Q.resolve(localStorage.getItem('template')).then(fillDefaultTpl);

    tpldfd.done(function (tpl) {
        document.getElementById('template_txt').value = tpl;
    });

    tpldfd.delay(100).done(function () {
        //Delay to wait iframe ready
        var event = document.createEvent('Event');
        event.initEvent('blur', true, true);
        document.getElementById('template_txt').dispatchEvent(event);
    });

}());
