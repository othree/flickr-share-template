(function () {

var default_tpl = 'A_A';

var api_key = '10f5fbcc6287ee905f7df31b25be1cff';

var jsonFlickrApi = function (data) {return data;}

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
			url: node.getAttribute('source'),
			width: node.getAttribute('width'),
			height: node.getAttribute('height')
		};
		data[label] = item;
	}

	return data;
}

var parseMeta = function (node) {
	var title = '',
		desc = '';

	if (node.querySelector('title').firstChild) {
		title = node.querySelector('title').firstChild.nodeValue;
	}
	if (node.querySelector('description').firstChild) {
		desc = node.querySelector('description').firstChild.nodeValue;
	}
	return {
		title: title,
		description: desc
	};
}


var render = function(tpl, meta, sizes) {

};

var active = function (photo_id) {
	var tpl = window.localStorage['template'] || default_tpl,
		xhr1 = new XMLHttpRequest(),
		url1 = 'http://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key='+api_key+'&photo_id='+photo_id;

		xhr2 = new XMLHttpRequest(),
		url2 = 'http://api.flickr.com/services/rest/?method=flickr.photos.getSizes&api_key='+api_key+'&photo_id='+photo_id,

		sizes = null,
		meta = null,

		flag = 0;

	xhr1.open("GET", url1, true);
	xhr1.onload = function(e) {
		var data = xhr1.response,
			parser = new DOMParser(),
        	xmlDoc = parser.parseFromString(data, "text/xml");

		meta = parseMeta(xmlDoc);
		flag++;
		if (flag == 2) {
			render(tpl, meta, sizes);
		}
	}
	xhr1.send();

	xhr2.open("GET", url2, true);
	xhr2.onload = function(e) {
		var data = xhr2.response,
			parser = new DOMParser(),
        	xmlDoc = parser.parseFromString(data, "text/xml"),
        	sizeNodes = xmlDoc.querySelectorAll('rsp>sizes>size');

		sizes = parseSizes(sizeNodes);
		flag++;
		if (flag == 2) {
			render(tpl, meta, sizes);
		}
	}
	xhr2.send();
}


chrome.tabs.query({active: true}, function (tabs) {
	var tab = tabs[0],
		url = tab.url,
		urlobj = document.createElement('a');

	urlobj.href = url;

	var frags = urlobj.pathname.split('/');

    document.getElementById('loading').style.display = 'none';
	if (urlobj.hostname == 'www.flickr.com' && frags.length >= 4 && frags[1] == 'photos') {
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
