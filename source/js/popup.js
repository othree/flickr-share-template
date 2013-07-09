/*jslint vars: true, plusplus: true */
/*global chrome: false, window: false, document: false, XMLHttpRequest: false, DOMParser: false, localStorage: false */

(function () {
    "use strict";

    var hogan = document.getElementById('hogan').contentWindow;

    var default_tpl = '<a class="thumbnail" href="{{url}}" title="Flickr 上 {{owner.username}} 的 {{title}}"><img src="{{Large.sourceNoProtocol}}" width="{{Large.width}}" height="{{Large.height}}" alt="{{title}}" srcset="{{Medium.sourceNoProtocol}} 768w, {{Large.sourceNoProtocol}} 768w 2x{{#Large2048}}, {{Large2048.sourceNoProtocol}} 2x{{/Large2048}}" /></a>';

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

    var parseSizes = function (nodes) {
        var data = {},
            item = {},
            node = null,
            label = '',
            i;

        for (i = 0; i < nodes.length; i++) {
            node = nodes[i];
            label = node.getAttribute('label').replace(' ', '');
            item = {
                url: node.getAttribute('url'),
                source: node.getAttribute('source'),
                sourceNoProtocol: node.getAttribute('source').replace(/^http:/, ''),
                width: node.getAttribute('width'),
                height: node.getAttribute('height')
            };
            data[label] = item;
        }

        return data;
    };

    var parseMeta = function (node) {
        var title = '',
            desc = '',
            owner = {},
            url = '';

        if (node.querySelector('title').firstChild) {
            title = node.querySelector('title').firstChild.nodeValue;
        }
        if (node.querySelector('description').firstChild) {
            desc = node.querySelector('description').firstChild.nodeValue;
        }
        owner = {
            username: node.querySelector('owner').getAttribute('username')
        };
        url = node.querySelector('urls > url').firstChild.nodeValue;

        return {
            title: title,
            description: desc,
            owner: owner,
            url: url
        };
    };


    var handler = {
        renderDone: function (result) {
            console.log('done');
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

    var active = function (photo_id) {
        var tpl = window.localStorage.template || default_tpl,
            xhr1 = new XMLHttpRequest(),
            url1 = 'http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + api_key + '&photo_id=' + photo_id,

            xhr2 = new XMLHttpRequest(),
            url2 = 'http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=' + api_key + '&photo_id=' + photo_id,

            sizes = null,
            meta = null,

            flag = 0;

        xhr1.open("GET", url1, true);
        xhr1.onload = function (e) {
            var data = xhr1.response,
                parser = new DOMParser(),
                xmlDoc = parser.parseFromString(data, "text/xml");

            meta = parseMeta(xmlDoc);
            flag++;
            if (flag === 2) {
                meta = extend(meta, sizes);
                render(tpl, meta);
            }
        };
        xhr1.send();

        xhr2.open("GET", url2, true);
        xhr2.onload = function (e) {
            var data = xhr2.response,
                parser = new DOMParser(),
                xmlDoc = parser.parseFromString(data, "text/xml"),
                sizeNodes = xmlDoc.querySelectorAll('rsp>sizes>size');

            sizes = parseSizes(sizeNodes);
            flag++;
            if (flag === 2) {
                meta = extend(meta, sizes);
                render(tpl, meta);
            }
        };
        xhr2.send();
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
