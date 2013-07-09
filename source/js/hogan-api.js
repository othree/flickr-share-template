/*jslint vars: true, plusplus: true, browser: true */
/*global window: false, Hogan: false */

(function () {
    "use strict";

    var template = {};

    var api = {
        compile: function (name, text) {
            if (!text) {
                text = name;
                name = null;
            }
            if (!name) { name = '_default'; }
            template[name] = Hogan.compile(text);
        },
        render: function (name, data) {
            if (!data) {
                data = name;
                name = null;
            }
            if (!name) { name = '_default'; }
            if (!template[name]) { return ''; }
            return template[name].render(data);
        }
    };

    window.addEventListener('message', function (event) {
        var args = event.data,
            method,
            data;

        for (method in api) {
            if (args[method]) {
                data = {
                    event: method + 'Done',
                    value: api[method].apply(null, args[method])
                };
                event.source.postMessage(data, event.origin);
            }
        }
    }, false);

}());
