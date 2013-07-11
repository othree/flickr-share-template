/*jslint vars: true, plusplus: true, browser: true */
/*global chrome: false, DOMParser: false, localStorage: false, Q: false, QX: false*/

(function (root) {
    "use strict";

    var urlapikey = 'private/api_key.json';

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

    var extend = function (dest, source) {
        var key;
        for (key in source) {
            dest[key] = source[key];
        }
        return dest;
    };

    var get = function (photo_id) {
        return QX.get(urlapikey).then(function (api_key) {
            var urlmeta = 'http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=' + api_key + '&photo_id=' + photo_id,
                urlsize = 'http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key=' + api_key + '&photo_id=' + photo_id;

            return Q.all([QX.getXML(urlmeta), QX.getXML(urlsize)]);
        }).then(function (xmls) {
            return extend(parseMeta(xmls[0]), parseSizes(xmls[1]));
        });
    };

    root.flickr = {
        get: get
    };
}(this));
