/*jslint vars: true, plusplus: true, browser: true */
/*global Q: false, QX: false*/

(function (root) {
    "use strict";

    var urlapikey = 'private/api_key.json';

    var SIZES_LABEL = [
        {label: "Square", width: 75},
        {label: "Square75", width: 75},
        {label: "Thumbnail", width: 100},
        {label: "LargeSquare", width: 150},
        {label: "Square150", width: 150},
        {label: "Small", width: 240},
        {label: "Small240", width: 240},
        {label: "Small320", width: 320},
        {label: "Medium", width: 500},
        {label: "Medium500", width: 500},
        {label: "Medium640", width: 640},
        {label: "Medium800", width: 800},
        {label: "Large", width: 1024},
        {label: "Large1024", width: 1024},
        {label: "Large1600", width: 1600},
        {label: "Large2048", width: 2048},
        // {label: "Original"}
    ];

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
            latest = null,
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
        for (i = 0; i < SIZES_LABEL.length; i++) {
            latest = data[SIZES_LABEL[i].label] || latest;
            data['to' + SIZES_LABEL[i].label] = latest;
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
