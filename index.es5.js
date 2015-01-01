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

        go(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    $ctx.next = 2;
                    return timeout(250).get();
                case 2:
                    if (!$ctx.sent) {
                        $ctx.next = 6;
                        break;
                    }

                    chan.send(1);
                    $ctx.next = 0;
                    break;
                case 6:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));

        go(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    $ctx.next = 2;
                    return timeout(1000).get();
                case 2:
                    if (!$ctx.sent) {
                        $ctx.next = 6;
                        break;
                    }

                    chan.send(2);
                    $ctx.next = 0;
                    break;
                case 6:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));

        go(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    $ctx.next = 2;
                    return timeout(1500).get();
                case 2:
                    if (!$ctx.sent) {
                        $ctx.next = 6;
                        break;
                    }

                    chan.send(3);
                    $ctx.next = 0;
                    break;
                case 6:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));


        go(wrapGenerator.mark(function() {
            var data, newItem;

            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    data = [];
                case 1:
                    $ctx.next = 3;
                    return chan.get();
                case 3:
                    if (!(newItem = $ctx.sent)) {
                        $ctx.next = 9;
                        break;
                    }

                    out.innerHTML = render(data);
                    data.push(newItem);
                    data = peekn(data, 10);
                    $ctx.next = 1;
                    break;
                case 9:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));

    })();

}


main(Routines.Chan, Routines.go, Routines.timeout);
