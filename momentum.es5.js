function main(job, Pipe, listen) {
    wrapGenerator.mark(releasingMouseButton);
    wrapGenerator.mark(pressingMouseButtonOnSquare);
    wrapGenerator.mark(momentumPositioningBall);
    wrapGenerator.mark(bouncingBall);
    wrapGenerator.mark(draggingBall);
    var square = document.getElementById('square');
    var mousemovePipe = listen(document, 'mousemove');
    var mouseIsDown = false;
    var mousePositionInSquare = {};
    var throwPipe = new Pipe();
    var currentPosition;
    var lastSampledPosition;
    var sampleFrequency = 5;

    function placeSquare(x, y, duration) {
        square.style.webkitTransitionDuration = duration | 0;
        square.style.webkitTransitionTimingFunction = 'ease-out';
        square.style.webkitTransform = 
            'translateX(' + (x) + 
            'px) translateY(' + (y) + 'px)';
    }

    function draggingBall() {
        var evt, i;

        return wrapGenerator(function draggingBall$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                i = 0;
            case 1:
                $ctx.next = 3;
                return mousemovePipe.get();
            case 3:
                if (!(evt = $ctx.sent)) {
                    $ctx.next = 7;
                    break;
                }

                if (mouseIsDown) {
                    i++;
                    
                    currentPosition = { x: evt.clientX - mousePositionInSquare.x,
                                        y: evt.clientY - mousePositionInSquare.y };

                    placeSquare(currentPosition.x, currentPosition.y);

                    if (lastSampledPosition) {
                        if (i % sampleFrequency === 0) {
                            lastSampledPosition = currentPosition;
                        }
                    } else {
                        lastSampledPosition = currentPosition;
                    }

                } else {
                    i = 0;
                }

                $ctx.next = 1;
                break;
            case 7:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function bouncingBall() {
        return wrapGenerator(function bouncingBall$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function momentumPositioningBall() {
        var vector, deltaX, deltaY, targetX, targetY, cur, prev;

        return wrapGenerator(function momentumPositioningBall$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                $ctx.next = 2;
                return throwPipe.get();
            case 2:
                if (!(vector = $ctx.sent)) {
                    $ctx.next = 12;
                    break;
                }

                cur = vector[0];
                prev = vector[1];
                deltaX = cur.x - prev.x;
                deltaY = cur.y - prev.y;
                targetX = cur.x + (deltaX * 1);
                targetY = cur.y + (deltaY * 1);
                placeSquare(targetX, targetY, 300);
                $ctx.next = 0;
                break;
            case 12:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function pressingMouseButtonOnSquare() {
        var mousedown, evt;

        return wrapGenerator(function pressingMouseButtonOnSquare$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                mousedown = listen(square, 'mousedown');
            case 1:
                $ctx.next = 3;
                return mousedown.get();
            case 3:
                if (!(evt = $ctx.sent)) {
                    $ctx.next = 8;
                    break;
                }

                mouseIsDown = true;

                mousePositionInSquare = { x: evt.offsetX,
                                          y: evt.offsetY };

                $ctx.next = 1;
                break;
            case 8:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function releasingMouseButton() {
        var mouseup, evt;

        return wrapGenerator(function releasingMouseButton$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                mouseup = listen(document, 'mouseup');
            case 1:
                $ctx.next = 3;
                return mouseup.get();
            case 3:
                if (!(evt = $ctx.sent)) {
                    $ctx.next = 7;
                    break;
                }

                if (mouseIsDown) {
                    mouseIsDown = false;
                    throwPipe.send([currentPosition, lastSampledPosition]);
                }

                $ctx.next = 1;
                break;
            case 7:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    job(draggingBall);
    job(momentumPositioningBall);
    job(bouncingBall);
    job(pressingMouseButtonOnSquare);
    job(releasingMouseButton);
}


main(JSPipe.job, JSPipe.Pipe, JSPipe.listen);
