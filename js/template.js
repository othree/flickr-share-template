/*jslint vars: true, plusplus: true, browser: true */
/*global chrome: false, DOMParser: false, localStorage: false, Q: false, QX: false*/

(function () {
    "use strict";

    var urlapikey = 'private/api_key.json';
    var urltpl = 'template/default.mustache';

    var current_tpl = '';

    var SIZES_LABEL = {
        Square: true,
        Square75: true,
        LargeSquare: true,
        Square150: true,
        Thumbnail: true,
        Small: true,
        Small240: true,
        Small320: true,
        Medium: true,
        Medium500: true,
        Medium640: true,
        Medium800: true,
        Large: true,
        Large1024: true,
        Large1600: true,
        Large2048: true,
        Original: true
    };

    var LABEL_MAPPING = {
        Square: 'Square75',
        LargeSquare: 'Square150',
        Small: 'Small240',
        Medium: 'Medium500',
        Large: 'Large1024'
    };

    var hogan = document.getElementById('hogan').contentWindow;

    var parseSizes = function (doc) {
        var nodes = doc.querySelectorAll('rsp>sizes>size'),
            data = {},
            node = null,
            label = '',
            i;

        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            label = node.getAttribute('label').replace(' ', '');
            data[label] = {
                url: node.getAttribute('url'),
                source: node.getAttribute('source'),
                sourceNoProtocol: node.getAttribute('source').replace(/^http:/, ''),
                width: node.getAttribute('width'),
                height: node.getAttribute('height')
            };
            if (LABEL_MAPPING[label]) {
                data[LABEL_MAPPING[label]] = data[label];
            }
        }

        return data;
    };

    var parseMeta = function (doc) {
        var title = '',
            desc = '',
            owner = {},
            url = '';

        if (doc.querySelector('title').firstChild) {
            title = doc.querySelector('title').firstChild.nodeValue;
        }
        if (doc.querySelector('description').firstChild) {
            desc = doc.querySelector('description').firstChild.nodeValue;
        }
        owner = {
            username: doc.querySelector('owner').getAttribute('username')
        };
        url = doc.querySelector('urls > url').firstChild.nodeValue;

        return {
            title: title,
            description: desc,
            owner: owner,
            url: url
        };
    };

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

    var extend = function (dest, source) {
        var key;
        for (key in source) {
            dest[key] = source[key];
        }
        return dest;
    };

    var active = function (photo_id) {
        QX.get(urlapikey).then(function (api_key) {
            var urlmeta = 'http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + api_key + '&photo_id=' + photo_id,
                urlsize = 'http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=' + api_key + '&photo_id=' + photo_id;

            return Q.all([QX.getXML(urlmeta), QX.getXML(urlsize)]);
        }).then(function (xmls) {
            render(extend(parseMeta(xmls[0]), parseSizes(xmls[1])));
        });
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

    tpldfd.done(function () {
        //Delay to wait until iframe ready
        setTimeout(function () {
            var event = document.createEvent('Event');
            event.initEvent('blur', true, true);
            document.getElementById('template_txt').dispatchEvent(event);
        }, 100);
    });

}());
