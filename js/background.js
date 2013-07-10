(function () {
    var showPageAction = function (tabId, changeInfo, tab) {
            var url = tab.url,
                urlobj = document.createElement('a');

            urlobj.href = url;

            var frags = urlobj.pathname.split('/');

            if (urlobj.hostname === 'www.flickr.com' && frags.length >= 4 && frags[1] === 'photos' && /^\d+$/.test(frags[3])) {
		        chrome.pageAction.show(tabId);
            }

    };

	chrome.tabs.onUpdated.addListener(showPageAction);
}());