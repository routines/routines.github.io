function main(Chan, go, listen,  pace) {
    wrapGenerator.mark(getUserSearchInput);
    wrapGenerator.mark(displaySearchResults);
    wrapGenerator.mark(search);

    var input = document.getElementById('searchtext'),
        results = document.getElementById('results'),
        wikipediaUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=?&search=',
        searchRequestChan = new Chan(),
        searchResultsChan = new Chan();

    go(search, [searchRequestChan, searchResultsChan]);
    go(displaySearchResults, [searchResultsChan]);
    go(getUserSearchInput, [searchRequestChan]);

    function search(requestChan, resultChan) {
        var searchTerm, httpRequest;

        return wrapGenerator(function search$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                $ctx.next = 2;
                return requestChan.get();
            case 2:
                if (!(searchTerm = $ctx.sent)) {
                    $ctx.next = 7;
                    break;
                }

                httpRequest && httpRequest.abort();

                httpRequest = $.getJSON(wikipediaUrl + encodeURIComponent(searchTerm),
                                        resultChan.send.bind(resultChan));

                $ctx.next = 0;
                break;
            case 7:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function displaySearchResults(resultChan) {
        var res, lines;

        return wrapGenerator(function displaySearchResults$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                $ctx.next = 2;
                return resultChan.get();
            case 2:
                if (!(res = $ctx.sent)) {
                    $ctx.next = 7;
                    break;
                }

                lines = res.error && ['<h1>' + res.error + '</h1>'] || res[0] && res[1];

                results.innerHTML = lines.map(function(line) {
                    return '<p>' + line + '</p>';
                }).join('');

                $ctx.next = 0;
                break;
            case 7:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function getUserSearchInput(requestChan) {
        var pacedKeyup, evt, text, previousText, minLength;

        return wrapGenerator(function getUserSearchInput$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                pacedKeyup = pace(300, listen(input, 'keyup'));
            case 1:
                $ctx.next = 3;
                return pacedKeyup.get();
            case 3:
                if (!(evt = $ctx.sent)) {
                    $ctx.next = 10;
                    break;
                }

                text = evt.target.value;
                minLength = text.length > 2;

                if (minLength && text !== previousText) {
                    requestChan.send(text);
                } else if (!minLength) {
                    results.innerHTML = '';
                }

                previousText = text;
                $ctx.next = 1;
                break;
            case 10:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }
};

main(Routines.Chan, Routines.go, Routines.listen, Routines.pace);
