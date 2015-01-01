function main(Chan, go, timeout) {

    function render(q) {
        return q.map(function(p) {
            return '<div class="proc-' + p + '">Process ' + p + '</div>';
        }).join('');
    }

    function peekn(array, n) {
        var len = array.length,
            res = len > n ? array.slice(len - n) : array;
        return res;
    }

    // Eg 1
    (function() {
        var chan = new Chan(),
            out = document.getElementById('eg1out');

        go(function* () {
            while (yield timeout(250).get()) {
                chan.send(1);
            }
        });

        go(function* () {
            while (yield timeout(1000).get()) {
                chan.send(2);
            }
        });

        go(function* () {
            while (yield timeout(1500).get()) {
                chan.send(3);
            }
        });


        go(function* () {
            var data = [],
                newItem;

            while (newItem = yield chan.get()) {
                out.innerHTML = render(data);
                data.push(newItem);
                data = peekn(data, 10);
            }
        });

    })();

}


main(Routines.Chan, Routines.go, Routines.timeout);
