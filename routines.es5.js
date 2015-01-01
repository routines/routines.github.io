(function(global) {
if (global.Routines) { return; }
// Routines is free software distributed under the terms of the MIT license reproduced here.
// Routines may be used for any purpose, including commercial purposes, at absolutely no cost.
// No paperwork, no royalties, no GNU-like "copyleft" restrictions, either.
// Just download it and use it.

// Copyright (c) 2013 Joubert Nel

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


var sentinel = '|Ω|';

function isGeneratorFunction(fn) {
    return true;
    // Don't do real checking yet, because it fails
    // in Firefox when using traceur for simulating
    // generators.
    // var fn = Function.isGenerator;
    // return fn && fn.call(x);
}

/**
 * Kick off a routing. A routin runs concurrently with other routines.
 *
 * To communicate and synchronize with another routine, communicate via a
 * Channel.
 */
function go(fn, args) {
    var generator,
        next;

    if (isGeneratorFunction(fn)) {
        generator = fn.apply(fn, args);
        next = function(data) {
            var nextItem = generator.next(data),
                done = nextItem.done,
                value = nextItem.value,
                res;

            if (done) {
                res = null;
            } else {
                res = value ? value(next) : next();
            }

            return res;
        };
        next();
    } else {
        throw new TypeError('function must be a generator function, i.e. function* () {...} ');
    }
}

/**
 * A channel provides a way for two routines to communicate data + synchronize their execution.
 *
 * One routine can send data by calling "yield chan.put(data)" and another routine can
 * receive data by calling "yield chan.get()".
 */
function Chan() {
    this.syncing = false;
    this.inbox = [];
    this.outbox = [];
    this.isOpen = true;
}

Chan.prototype.close = function() {
    this.isOpen = false;
};

/**
 * Call "yield chan.put(data)" from a routine (the sender) to put data in the channel.
 *
 * The put method will then try to rendezvous with a receiver routine, if any.
 * If there is no receiver waiting for data, the sender will pause until another
 * routine calls "yield chan.get()", which will then trigger a rendezvous.
 */
Chan.prototype.put = function(data) {
    var self = this;
    return function(resume) {
        self.inbox.push(data, resume);
        // Try to rendezvous with a receiver
        self._rendezvous();
    };
};

Chan.prototype.waiting = function() {
    return this.outbox.length;
};

/**
 * Call "yield chan.get()" from a routine (the receiver) to get data from the channel.
 *
 * The get method will then try to rendezvous with a sender routine, if any.
 * If there is no sender waiting for the data it sent to be delivered, the receiver will
 * pause until another routine calls "yield chan.put(data)", which will then trigger
 * a rendezvous.
 */
Chan.prototype.get = function() {
    var self = this;
    return function(resume) {
        self.outbox.push(resume);
        // Try to rendezvous with sender
        self._rendezvous();
    };
};

Chan.prototype.send = function(message) {
    this.put(message)();
};


/**
 * A channel is a rendezvous point for two otherwise independently executing routines.
 * Such communication + synchronization on a channel requires a sender and receiver.
 *
 * A routine sends data to a channel using "yield chan.put(data)".
 * Another routine receives data from a channel using "yield chan.get()".
 *
 * Once both a sender routine and a receiver routine are waiting on the channel,
 * the _rendezvous method transfers the data in the channel to the receiver and consequently
 * synchronizes the two waiting routines.
 *
 * Once synchronized, the two routines continue execution.
 */
Chan.prototype._rendezvous = function() {
    var syncing = this.syncing,
        inbox = this.inbox,
        outbox = this.outbox,
        data,
        notify,
        send,
        receipt,
        senderWaiting,
        receiverWaiting;

    if (!syncing) {
        this.syncing = true;

        while ((senderWaiting = inbox.length > 0) &&
               (receiverWaiting = outbox.length > 0)) {

            // Get the data that the sender routine put in the channel
            data = inbox.shift();

            // Get the method to notify the sender once the data has been
            // delivered to the receiver routine
            notify = inbox.shift();

            // Get the method used to send the data to the receiver routine.
            send = outbox.shift();

            // Send the data
            receipt = send(data);

            // Notify the sender that the data has been sent
            if (notify) {
                notify(receipt);
            }
        }

        this.syncing = false;
    }
};


function EventChan(el, type, handler) {
    // super
    Chan.call(this);

    this._el = el;
    this._type = type;
    this._handler = handler;
    el.addEventListener(type, handler);
}

EventChan.prototype = Object.create(Chan.prototype);

EventChan.prototype.close = function() {
    this._el.removeEventListener(this._type, this._handler);
    delete this._el;
    delete this._type;
    delete this._handler;
    // super
    Chan.prototype.close.call(this);
};



///
/// Channel producers
///


function timeout(ms, interruptor) {
    // TODO: model timeout as a process
    var output = new Chan();

    setTimeout(function() {
        go(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    $ctx.next = 2;
                    return output.put(ms);
                case 2:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));
    }, ms);

    return output;
}


function listen(el, type, preventDefault) {
    var handler = function(e) {
        if (preventDefault) {
            e.preventDefault();
        }
        output.send(e);
    };

    var output = new EventChan(el, type, handler);
    return output;
}

function jsonp(url, id) {
    var output = new Chan();
    $.getJSON(url, function(data) {
        go(wrapGenerator.mark(function() {
            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    $ctx.next = 2;

                    return output.put({ data: data,
                                       id: id })
                case 2:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));
    });
    return output;
}


function lazyseq(count, fn) {
    var output = new Chan();
    go(wrapGenerator.mark(function() {
        var data, i;

        return wrapGenerator(function($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                i = 0;
            case 1:
                if (!(0 < count--)) {
                    $ctx.next = 8;
                    break;
                }

                data = fn(i);
                $ctx.next = 5;
                return output.put(data);
            case 5:
                i++;
                $ctx.next = 1;
                break;
            case 8:
                $ctx.next = 10;
                return output.put(sentinel);
            case 10:
                output.close();
            case 11:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }));
    return output;
}

///
/// Channel transformers
///


function unique(chan) {
    var output = new Chan();

    go(wrapGenerator.mark(function() {
        var isFirstData, data, lastData;

        return wrapGenerator(function($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                isFirstData = true;
            case 1:
                if (!chan.isOpen) {
                    $ctx.next = 12;
                    break;
                }

                $ctx.next = 4;
                return chan.get();
            case 4:
                data = $ctx.sent;

                if (!(isFirstData || data !== lastData)) {
                    $ctx.next = 9;
                    break;
                }

                $ctx.next = 8;
                return output.put(data);
            case 8:
                isFirstData = false;
            case 9:
                lastData = data;
                $ctx.next = 1;
                break;
            case 12:
                output.close();
            case 13:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }));

    return output;
}

function pace(ms, chan) {
    var output = new Chan();

    go(wrapGenerator.mark(function() {
        var timeoutId, data, send;

        return wrapGenerator(function($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                send = function(data) { output.send(data); };
            case 1:
                if (!chan.isOpen) {
                    $ctx.next = 9;
                    break;
                }

                $ctx.next = 4;
                return chan.get();
            case 4:
                data = $ctx.sent;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(send.bind(output, data), ms);
                $ctx.next = 1;
                break;
            case 9:
                output.close();
            case 10:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }));

    return output;
}

function delay(chan, ms) {
    var output = new Chan();
    go(wrapGenerator.mark(function() {
        var data;

        return wrapGenerator(function($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                if (!chan.isOpen) {
                    $ctx.next = 9;
                    break;
                }

                $ctx.next = 3;
                return timeout(ms).get();
            case 3:
                $ctx.next = 5;
                return chan.get();
            case 5:
                data = $ctx.sent;
                output.send(data);
                $ctx.next = 0;
                break;
            case 9:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }));

    return output;
}


///
/// Channel coordination
///

function select(cases) {
    // TODO: consider rewriting as a sweetjs macro
    var output = new Chan(),
        done = new Chan(),
        remaining = cases.length;

    cases.forEach(function(item) {
        go(wrapGenerator.mark(function() {
            var chan, response, data;

            return wrapGenerator(function($ctx) {
                while (1) switch ($ctx.next) {
                case 0:
                    chan = item.chan, response = item.response;
                    $ctx.next = 3;
                    return chan.get();
                case 3:
                    data = $ctx.sent;
                    response(data);
                    $ctx.next = 7;
                    return done.put(true);
                case 7:
                case "end":
                    return $ctx.stop();
                }
            }, this);
        }));
    });

    go(wrapGenerator.mark(function() {
        return wrapGenerator(function($ctx) {
            while (1) switch ($ctx.next) {
            case 0:
                if (!(remaining > 0)) {
                    $ctx.next = 6;
                    break;
                }

                $ctx.next = 3;
                return done.get();
            case 3:
                remaining = remaining - 1;
                $ctx.next = 0;
                break;
            case 6:
                $ctx.next = 8;
                return output.put(sentinel);
            case 8:
            case "end":
                return $ctx.stop();
            }
        }, this);
    }));

    return output;
}

function range() {
    // TODO: consider writing as a sweetjs macro
    throw 'Range has not been implemented yet.';
}


global.Routines = {
    go: go,
    Chan: Chan,
    EventChan: EventChan,
    timeout: timeout,
    listen: listen,
    jsonp: jsonp,
    lazyseq: lazyseq,
    unique: unique,
    pace: pace,
    delay: delay,
    sentinel: sentinel,
    select: select,
    range: range
};

})(typeof global !== "undefined" ? global : this);
