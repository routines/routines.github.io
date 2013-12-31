function main(Pipe, job, timeout) {

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
        var pipe = new Pipe(),
            out = document.getElementById('eg1out');

        job(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    if (!true) {
                        $ctx.next = 7;
                        break;
                    }

                    $ctx.next = 3;
                    return timeout(250).get();
                case 3:
                    $ctx.next = 5;
                    return pipe.put(1);
                case 5:
                    $ctx.next = 0;
                    break;
                case 7:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));

        job(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    if (!true) {
                        $ctx.next = 7;
                        break;
                    }

                    $ctx.next = 3;
                    return timeout(1000).get();
                case 3:
                    $ctx.next = 5;
                    return pipe.put(2);
                case 5:
                    $ctx.next = 0;
                    break;
                case 7:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));

        job(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    if (!true) {
                        $ctx.next = 7;
                        break;
                    }

                    $ctx.next = 3;
                    return timeout(1500).get();
                case 3:
                    $ctx.next = 5;
                    return pipe.put(3);
                case 5:
                    $ctx.next = 0;
                    break;
                case 7:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));


        job(wrapGenerator.mark(function() {
            var data, newItem;

            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    data = [];
                case 1:
                    if (!true) {
                        $ctx.next = 10;
                        break;
                    }

                    out.innerHTML = render(data);
                    $ctx.next = 5;
                    return pipe.get();
                case 5:
                    newItem = $ctx.sent;
                    data.push(newItem);
                    data = peekn(data, 10);
                    $ctx.next = 1;
                    break;
                case 10:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));
        
    })();

}


main(JSPipe.Pipe, JSPipe.job, JSPipe.timeout);
