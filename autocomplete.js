if (!$async) {
    // It seems that traceur *sometimes*, fails to properly insert our
    // code from async-es.js
    // When that happens, we simply ask the user to reload the page.
    alert('An unexpected error occurred. Please reload the page.');
}

(function(Channel, go, listen, unique, pace, jsonp) {

    function searchWikipedia(term) {
        var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=?&search=' +
                encodeURIComponent(term);
        return jsonp(url);
    }

    go(function* () {
        var input = document.getElementById('searchtext'),
            results = document.getElementById('results'),
            keyup = listen(input, 'keyup'),
            pacedKeyup = pace(keyup, 300),
            evt, data, res, text, previousText,
            minLength,
            i, len,
            p;
        
        while (true) {
            evt = yield pacedKeyup.get();
            text = evt.target.value;
            minLength = text.length > 2;


            if (minLength && text !== previousText) {
                
                data = yield searchWikipedia(text).get();
                
                if (data.error) {
                    results.innerHTML = '<h1p>Error:</h1>' + JSON.stringify(data.error);
                } else {                    
                    if (data[0] && data[1]) {
                        results.innerHTML = '';
                        res = data[1];
                        for (i = 0, len = res.length; i < len; i++) {
                            p = document.createElement('p');
                            p.innerHTML = res[i];
                            results.appendChild(p);
                        }                
                    }
                }
                
            } else if (!minLength) {
                results.innerHTML = '';
            }

            previousText = text;
        }
    });

})($async.Channel, $async.go, $async.listen, $async.unique, $async.pace, $async.jsonp);
