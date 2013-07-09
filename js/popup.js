/*jslint vars: true, plusplus: true */
/*global chrome: false, window: false, document: false, XMLHttpRequest: false, DOMParser: false, localStorage: false, Q: false */

(function () {
    "use strict";

    var hogan = document.getElementById('hogan').contentWindow;

    var default_tpl = '<a class="thumbnail" href="{{url}}" title="Flickr 上 {{owner.username}} 的 {{title}}"><img src="{{Large.sourceNoProtocol}}" width="{{Large.width}}" height="{{Large.height}}" alt="{{title}}" srcset="{{Medium.sourceNoProtocol}} 768w{{#Large}}, {{Large.sourceNoProtocol}} 768w 2x{{/Large}}{{#Large2048}}, {{Large2048.sourceNoProtocol}} 2x{{/Large2048}}" /></a>';

    var api_key = '10f5fbcc6287ee905f7df31b25be1cff';

    var SIZES_LABEL = {
        Square: true,
        LargeSquare: true,
        Thumbnail: true,
        Small: true,
        Small320: true,
        Medium: true,
        Medium640: true,
        Medium800: true,
        Large: true,
        Large1600: true,
        Large2048: true,
        Original: true
    };

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

    var handler = {
        compileDone: function () {},
        renderDone: function (result) {
            document.getElementById('share_txt').innerHTML = result;
            document.getElementById('share').style.display = 'block';
            document.getElementById('template').style.display = 'block';
            document.getElementById('nosupport').style.display = 'none';
            document.getElementById('loading').style.display = 'none';
        }
    };

    window.addEventListener('message', function (event) {
        var data = event.data;
        handler[data.event](data.value);
    }, false);

    var render = function (tpl, data) {
        hogan.postMessage({compile: [tpl]}, '*');
        hogan.postMessage({render: [data]}, '*');
    };

    var extend = function (dest, source) {
        var key;
        for (key in source) {
            dest[key] = source[key];
        }
        return dest;
    };

    var get = function (url) {
        var req = new XMLHttpRequest(),
            dfd = Q.defer();
        req.open("GET", url, true);
        req.onload = function (event) {
            if (req.status === 200) {
                dfd.resolve(req.response);
            } else { dfd.reject(); }
        };
        req.send();
        return dfd.promise;
    };

    var text2XML = function (text) {
        var parser = new DOMParser();
        return parser.parseFromString(text, "text/xml");
    };

    var getXML = function (url) {
        var dfd = get(url);
        return dfd.then(text2XML);
    };

    var active = function (photo_id) {
        var tpl = window.localStorage.template || default_tpl,
            urlmeta = 'http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + api_key + '&photo_id=' + photo_id,
            urlsize = 'http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=' + api_key + '&photo_id=' + photo_id;

        Q.all([getXML(urlmeta), getXML(urlsize)]).then(function (xmls) {
            render(tpl, extend(parseMeta(xmls[0]), parseSizes(xmls[1])));
        });
    };

    var go = function () {
        chrome.tabs.query({active: true}, function (tabs) {
            var tab = tabs[0],
                url = tab.url,
                urlobj = document.createElement('a');

            urlobj.href = url;

            var frags = urlobj.pathname.split('/');

            if (urlobj.hostname === 'www.flickr.com' && frags.length >= 4 && frags[1] === 'photos' && /^\d+$/.test(frags[3])) {
                active(frags[3]);
            } else {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('share').style.display = 'none';
                document.getElementById('template').style.display = 'none';
                document.getElementById('nosupport').style.display = 'block';
            }
        });
    };


    var readAndGo = function () {
        localStorage.setItem('template', this.value || default_tpl);
        go();
    };

    document.getElementById('template_txt').addEventListener('blur', readAndGo, false);
    document.getElementById('template_txt').addEventListener('keydown', function (event) {
        if (event.keyCode === 13) { readAndGo(); }
    }, false);

    document.querySelector('#expand span').addEventListener('click', function () {
        var txt = document.getElementById('template_txt');
        if (txt.style.display !== 'inline') {
            txt.style.display = 'inline';
            this.innerHTML = 'hide';
        } else {
            txt.style.display = 'none';
            this.innerHTML = 'show';
        }
    });

    document.getElementById('template_txt').value = localStorage.getItem('template') || default_tpl;

    go();

}());
