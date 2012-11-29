/*jslint vars: true, plusplus: true */
/*global chrome: false, window: false, document: false, XMLHttpRequest: false, DOMParser: false */

(function () {

    "use strict";

    var default_tpl = '<a href="#{url}" title="Flickr 上 #{owner.username} 的 #{title}"><img src="#{Large.source}" width="#{Large.width}" height="#{Large.height}" alt="#{title}" srcset="#{Large2048.source} 2x" /></a>';

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

    var jsonFlickrApi = function (data) { return data; };

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

    var lookup = function (data, key) {
        var keys = key.split('.'),
            k = keys.shift(),
            v = data;

        while (k && v) {
            v = v[k];
            k = keys.shift();
        }
        return v;
    };

    var render = function (tpl, meta, sizes) {
        var result = tpl.replace(/#\{[\w\d\.]+\}/g, function (param) {
            var key = param.slice(2, -1);
            return lookup(meta, key) || lookup(sizes, key) || '';
        });
        document.getElementById('share_txt').innerHTML = result;
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
                render(tpl, meta, sizes);
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
                render(tpl, meta, sizes);
            }
        };
        xhr2.send();
    };


    chrome.tabs.query({active: true}, function (tabs) {
        var tab = tabs[0],
            url = tab.url,
            urlobj = document.createElement('a');

        urlobj.href = url;

        var frags = urlobj.pathname.split('/');

        document.getElementById('loading').style.display = 'none';
        if (urlobj.hostname === 'www.flickr.com' && frags.length >= 4 && frags[1] === 'photos') {
            document.getElementById('share').style.display = 'block';
            document.getElementById('template').style.display = 'none';
            document.getElementById('nosupport').style.display = 'none';
            active(frags[3]);
        } else {
            document.getElementById('share').style.display = 'none';
            document.getElementById('template').style.display = 'none';
            document.getElementById('nosupport').style.display = 'block';
        }
    });

}());
