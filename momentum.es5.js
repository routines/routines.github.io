function main(go, Chan, listen) {
    wrapGenerator.mark(endingTouch);
    wrapGenerator.mark(touchmoving);
    wrapGenerator.mark(startingTouchOnBall);
    wrapGenerator.mark(bouncingBall);
    wrapGenerator.mark(throwingBall);
    wrapGenerator.mark(draggingBall);

    var ball = document.getElementById('ball'),
        ballWidth = ball.clientWidth,
        ballHeight = ball.clientHeight,
        pointerIsDown = false,
        touchmoveChan = listen(document, 'touchmove', true),
        pointermoveChan = new Chan(),
        throwChan = new Chan(),
        timeSpaceSamples = [],
        sampleSize = 4,
        throwDistance = 100,
        pointerPositionInBall,
        currentPosition;

    function draggingBall() {
        var evt, x, y;

        return wrapGenerator(function draggingBall$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                $ctx.next = 2;
                return pointermoveChan.get();
            case 2:
                if (!(evt = $ctx.sent)) {
                    $ctx.next = 10;
                    break;
                }

                x = evt.clientX - pointerPositionInBall.x;
                y = evt.clientY - pointerPositionInBall.y;

                timeSpaceSamples.push({ time: Date.now(),
                                        x: x,
                                        y: y });

                while (timeSpaceSamples.length > sampleSize) {
                    timeSpaceSamples.shift();
                }

                placeBall(x, y);
                $ctx.next = 0;
                break;
            case 10:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function throwingBall() {
        var velocity, x, y;

        return wrapGenerator(function throwingBall$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                $ctx.next = 2;
                return throwChan.get();
            case 2:
                if (!(velocity = $ctx.sent)) {
                    $ctx.next = 8;
                    break;
                }

                x = currentPosition.x + velocity.x * throwDistance;
                y = currentPosition.y + velocity.y * throwDistance;
                placeBall(x, y, 900, 'cubic-bezier(0.19, 1, 0.22, 1)');
                $ctx.next = 0;
                break;
            case 8:
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

    function placeBall(x, y, duration, ease) {
        var maxX = document.width - ballWidth,
            maxY = document.height - ballHeight,
            willHitWall = false;

        x = Math.round(x);
        y = Math.round(y);

        if (!willHitWall) {

            ball.style.webkitTransitionDuration = duration || 16;
            ball.style.webkitTransitionTimingFunction = ease || 'ease-out';

            ball.style.webkitTransform =
                'translateX(' + (x) +
                'px) translateY(' + (y) + 'px)';

            currentPosition = { x: x, y: y };
        }

    }

    function startingTouchOnBall() {
        var touchstart, touch, evt, currentX, currentY;

        return wrapGenerator(function startingTouchOnBall$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                touchstart = listen(ball, 'touchstart');
            case 1:
                $ctx.next = 3;
                return touchstart.get();
            case 3:
                if (!(evt = $ctx.sent)) {
                    $ctx.next = 12;
                    break;
                }

                touch = evt.targetTouches[0];
                console.log(touch);
                pointerIsDown = true;
                currentX = (currentPosition && currentPosition.x) || 0;
                currentY = (currentPosition && currentPosition.y) || 0;

                pointerPositionInBall = { x: touch.clientX - currentX,
                                          y: touch.clientY - currentY };

                $ctx.next = 1;
                break;
            case 12:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function touchmoving() {
        var evt, touch;

        return wrapGenerator(function touchmoving$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                $ctx.next = 2;
                return touchmoveChan.get();
            case 2:
                if (!(evt = $ctx.sent)) {
                    $ctx.next = 7;
                    break;
                }

                touch = evt.touches[0];

                if (touch.target === ball) {
                    pointermoveChan.send(touch);
                }

                $ctx.next = 0;
                break;
            case 7:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    function endingTouch() {
        var touchend, velocity, oldestSample, newestSample, duration, xDirection, yDirection, evt;

        return wrapGenerator(function endingTouch$($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                touchend = listen(document, 'touchend');
            case 1:
                $ctx.next = 3;
                return touchend.get();
            case 3:
                if (!(evt = $ctx.sent)) {
                    $ctx.next = 7;
                    break;
                }

                if (pointerIsDown) {
                    pointerIsDown = false;

                    oldestSample = timeSpaceSamples[0];
                    newestSample = timeSpaceSamples[timeSpaceSamples.length - 1];
                    duration = newestSample.time - oldestSample.time;
                    xDirection = (newestSample.x - oldestSample.x) < 0 ? -1 : 1;
                    yDirection = (newestSample.y - oldestSample.y) < 0 ? -1 : 1;

                    velocity = {
                        x: (newestSample.x - oldestSample.x) / (duration/2),
                        y: (newestSample.y - oldestSample.y) / (duration/2),
                        xDirection: xDirection,
                        yDirection: yDirection
                    };

                    throwChan.send(velocity);
                }

                $ctx.next = 1;
                break;
            case 7:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }

    go(draggingBall);
    go(throwingBall);
    go(bouncingBall);
    go(touchmoving);
    go(startingTouchOnBall);
    go(endingTouch);
}


main(Routines.go, Routines.Chan, Routines.listen);
