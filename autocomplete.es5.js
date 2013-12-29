(function(global) {
  'use strict';
  var sentinel = Symbol('Ω');
  if (global.async) {
    return;
  }
  function isGenerator(x) {
    return true;
  }
  function go(routine) {
    for (var args = [],
        $__1 = 1; $__1 < arguments.length; $__1++) args[$__1 - 1] = arguments[$__1];
    var task,
        next;
    if (isGenerator(routine)) {
      task = routine.apply(null, $traceurRuntime.toObject(args));
      next = (function(data) {
        var $__3 = task.next(data),
            done = $__3.done,
            value = $__3.value,
            res;
        if (done) {
          res = null;
        } else {
          res = value ? value(next): next();
        }
        return res;
      });
      next();
    } else {
      throw new TypeError('routine must be a generator');
    }
  }
  var Channel = function() {
    this.synching = false;
    this.inbox = [];
    this.outbox = [];
    this.isOpen = true;
  };
  Channel = ($traceurRuntime.createClass)(Channel, {
    close: function() {
      this.isOpen = false;
    },
    put: function(data) {
      return function(resume) {
        this.inbox.push(data, resume);
        this._rendezvous();
      }.bind(this);
    },
    get: function() {
      return function(resume) {
        this.outbox.push(resume);
        this._rendezvous();
      }.bind(this);
    },
    _rendezvous: function() {
      var $__3 = this,
          synching = $__3.synching,
          inbox = $__3.inbox,
          outbox = $__3.outbox,
          data,
          notify,
          send,
          receipt,
          senderWaiting,
          receiverWaiting;
      if (!synching) {
        this.synching = true;
        while ((senderWaiting = inbox.length > 0) && (receiverWaiting = outbox.length > 0)) {
          data = inbox.shift();
          notify = inbox.shift();
          send = outbox.shift();
          receipt = send(data);
          notify && notify(receipt);
        }
        this.synching = false;
      }
    }
  }, {});
  var EventChannel = function(el, type, handler) {
    el.addEventListener(type, handler);
    $traceurRuntime.superCall(this, $EventChannel.prototype, "constructor", []);
  };
  var $EventChannel = ($traceurRuntime.createClass)(EventChannel, {close: function() {
      el.removeEventListener(type, handler);
      $traceurRuntime.superCall(this, $EventChannel.prototype, "close", []);
    }}, {}, Channel);
  function timeout(ms, interruptor) {
    var output = new Channel();
    setTimeout(function() {
      go(function() {
        var $state = 0;
        var $storedException;
        var $finallyFallThrough;
        var $that = this,
            $arguments = arguments,
            $G = {
              GState: 0,
              current: undefined,
              yieldReturn: undefined,
              innerFunction: function($yieldSent, $yieldAction) {
                while (true) switch ($state) {
                  case 0:
                    this.current = output.put(ms);
                    $state = 1;
                    return true;
                  case 1:
                    if ($yieldAction == 1) {
                      $yieldAction = 0;
                      throw $yieldSent;
                    }
                    $state = 3;
                    break;
                  case 3:
                    $state = -2;
                  case -2:
                    return false;
                  case -3:
                    throw $storedException;
                  default:
                    throw "traceur compiler bug: invalid state in state machine: " + $state;
                }
              },
              moveNext: function($yieldSent, $yieldAction) {
                while (true) try {
                  return this.innerFunction($yieldSent, $yieldAction);
                } catch ($caughtException) {
                  $storedException = $caughtException;
                  switch ($state) {
                    default:
                      this.GState = 3;
                      $state = -2;
                      throw $storedException;
                  }
                }
              }
            };
        return $traceurRuntime.generatorWrap($G);
      });
    }, ms);
    return output;
  }
  function listen(el, type) {
    var handler = (function(e) {
      go(function() {
        var $state = 0;
        var $storedException;
        var $finallyFallThrough;
        var $that = this,
            $arguments = arguments,
            $G = {
              GState: 0,
              current: undefined,
              yieldReturn: undefined,
              innerFunction: function($yieldSent, $yieldAction) {
                while (true) switch ($state) {
                  case 0:
                    this.current = output.put(e);
                    $state = 1;
                    return true;
                  case 1:
                    if ($yieldAction == 1) {
                      $yieldAction = 0;
                      throw $yieldSent;
                    }
                    $state = 3;
                    break;
                  case 3:
                    $state = -2;
                  case -2:
                    return false;
                  case -3:
                    throw $storedException;
                  default:
                    throw "traceur compiler bug: invalid state in state machine: " + $state;
                }
              },
              moveNext: function($yieldSent, $yieldAction) {
                while (true) try {
                  return this.innerFunction($yieldSent, $yieldAction);
                } catch ($caughtException) {
                  $storedException = $caughtException;
                  switch ($state) {
                    default:
                      this.GState = 3;
                      $state = -2;
                      throw $storedException;
                  }
                }
              }
            };
        return $traceurRuntime.generatorWrap($G);
      });
    });
    var output = new EventChannel(el, type, handler);
    return output;
  }
  function jsonp(url) {
    var output = new Channel();
    $.getJSON(url, (function(data) {
      go(function() {
        var $state = 0;
        var $storedException;
        var $finallyFallThrough;
        var $that = this,
            $arguments = arguments,
            $G = {
              GState: 0,
              current: undefined,
              yieldReturn: undefined,
              innerFunction: function($yieldSent, $yieldAction) {
                while (true) switch ($state) {
                  case 0:
                    this.current = output.put(data);
                    $state = 1;
                    return true;
                  case 1:
                    if ($yieldAction == 1) {
                      $yieldAction = 0;
                      throw $yieldSent;
                    }
                    $state = 3;
                    break;
                  case 3:
                    $state = -2;
                  case -2:
                    return false;
                  case -3:
                    throw $storedException;
                  default:
                    throw "traceur compiler bug: invalid state in state machine: " + $state;
                }
              },
              moveNext: function($yieldSent, $yieldAction) {
                while (true) try {
                  return this.innerFunction($yieldSent, $yieldAction);
                } catch ($caughtException) {
                  $storedException = $caughtException;
                  switch ($state) {
                    default:
                      this.GState = 3;
                      $state = -2;
                      throw $storedException;
                  }
                }
              }
            };
        return $traceurRuntime.generatorWrap($G);
      });
    }));
    return output;
  }
  function lazyseq(count, fn) {
    for (var args = [],
        $__2 = 2; $__2 < arguments.length; $__2++) args[$__2 - 2] = arguments[$__2];
    var output = new Channel();
    go(function() {
      var $state = 11;
      var $storedException;
      var $finallyFallThrough;
      var data;
      var i;
      var $that = this,
          $arguments = arguments,
          $G = {
            GState: 0,
            current: undefined,
            yieldReturn: undefined,
            innerFunction: function($yieldSent, $yieldAction) {
              while (true) switch ($state) {
                case 11:
                  i = 0;
                  $state = 12;
                  break;
                case 12:
                  if (0 < count--) {
                    $state = 4;
                    break;
                  } else {
                    $state = 6;
                    break;
                  }
                case 4:
                  data = fn(i, args);
                  $state = 5;
                  break;
                case 5:
                  this.current = output.put(data);
                  $state = 1;
                  return true;
                case 1:
                  if ($yieldAction == 1) {
                    $yieldAction = 0;
                    throw $yieldSent;
                  }
                  $state = 12;
                  break;
                case 6:
                  this.current = output.put(sentinel);
                  $state = 8;
                  return true;
                case 8:
                  if ($yieldAction == 1) {
                    $yieldAction = 0;
                    throw $yieldSent;
                  }
                  $state = 10;
                  break;
                case 10:
                  output.close();
                  $state = 14;
                  break;
                case 14:
                  $state = -2;
                case -2:
                  return false;
                case -3:
                  throw $storedException;
                default:
                  throw "traceur compiler bug: invalid state in state machine: " + $state;
              }
            },
            moveNext: function($yieldSent, $yieldAction) {
              while (true) try {
                return this.innerFunction($yieldSent, $yieldAction);
              } catch ($caughtException) {
                $storedException = $caughtException;
                switch ($state) {
                  default:
                    this.GState = 3;
                    $state = -2;
                    throw $storedException;
                }
              }
            }
          };
      return $traceurRuntime.generatorWrap($G);
    });
    return output;
  }
  function unique(channel) {
    var output = new Channel();
    go(function() {
      var $state = 16;
      var $storedException;
      var $finallyFallThrough;
      var data;
      var isFirstData;
      var lastData;
      var $that = this,
          $arguments = arguments,
          $G = {
            GState: 0,
            current: undefined,
            yieldReturn: undefined,
            innerFunction: function($yieldSent, $yieldAction) {
              while (true) switch ($state) {
                case 16:
                  isFirstData = true;
                  $state = 17;
                  break;
                case 17:
                  if (channel.isOpen) {
                    $state = 0;
                    break;
                  } else {
                    $state = 15;
                    break;
                  }
                case 0:
                  this.current = channel.get();
                  $state = 1;
                  return true;
                case 1:
                  if ($yieldAction == 1) {
                    $yieldAction = 0;
                    throw $yieldSent;
                  }
                  $state = 3;
                  break;
                case 3:
                  data = $yieldSent;
                  $state = 5;
                  break;
                case 5:
                  if (isFirstData || data !== lastData) {
                    $state = 6;
                    break;
                  } else {
                    $state = 11;
                    break;
                  }
                case 6:
                  this.current = output.put(data);
                  $state = 7;
                  return true;
                case 7:
                  if ($yieldAction == 1) {
                    $yieldAction = 0;
                    throw $yieldSent;
                  }
                  $state = 9;
                  break;
                case 9:
                  isFirstData = false;
                  $state = 11;
                  break;
                case 11:
                  lastData = data;
                  $state = 17;
                  break;
                case 15:
                  output.close();
                  $state = 19;
                  break;
                case 19:
                  $state = -2;
                case -2:
                  return false;
                case -3:
                  throw $storedException;
                default:
                  throw "traceur compiler bug: invalid state in state machine: " + $state;
              }
            },
            moveNext: function($yieldSent, $yieldAction) {
              while (true) try {
                return this.innerFunction($yieldSent, $yieldAction);
              } catch ($caughtException) {
                $storedException = $caughtException;
                switch ($state) {
                  default:
                    this.GState = 3;
                    $state = -2;
                    throw $storedException;
                }
              }
            }
          };
      return $traceurRuntime.generatorWrap($G);
    });
    return output;
  }
  function pace(channel, ms) {
    var output = new Channel();
    go(function() {
      var $state = 11;
      var $storedException;
      var $finallyFallThrough;
      var data;
      var timeoutId;
      var $that = this,
          $arguments = arguments,
          $G = {
            GState: 0,
            current: undefined,
            yieldReturn: undefined,
            innerFunction: function($yieldSent, $yieldAction) {
              while (true) switch ($state) {
                case 11:
                  ;
                  $state = 12;
                  break;
                case 12:
                  if (channel.isOpen) {
                    $state = 0;
                    break;
                  } else {
                    $state = 10;
                    break;
                  }
                case 0:
                  this.current = channel.get();
                  $state = 1;
                  return true;
                case 1:
                  if ($yieldAction == 1) {
                    $yieldAction = 0;
                    throw $yieldSent;
                  }
                  $state = 3;
                  break;
                case 3:
                  data = $yieldSent;
                  $state = 5;
                  break;
                case 5:
                  clearTimeout(timeoutId);
                  $state = 7;
                  break;
                case 7:
                  timeoutId = setTimeout((function() {
                    go(function() {
                      var $state = 0;
                      var $storedException;
                      var $finallyFallThrough;
                      var $that = this,
                          $arguments = arguments,
                          $G = {
                            GState: 0,
                            current: undefined,
                            yieldReturn: undefined,
                            innerFunction: function($yieldSent, $yieldAction) {
                              while (true) switch ($state) {
                                case 0:
                                  this.current = output.put(data);
                                  $state = 1;
                                  return true;
                                case 1:
                                  if ($yieldAction == 1) {
                                    $yieldAction = 0;
                                    throw $yieldSent;
                                  }
                                  $state = 3;
                                  break;
                                case 3:
                                  $state = -2;
                                case -2:
                                  return false;
                                case -3:
                                  throw $storedException;
                                default:
                                  throw "traceur compiler bug: invalid state in state machine: " + $state;
                              }
                            },
                            moveNext: function($yieldSent, $yieldAction) {
                              while (true) try {
                                return this.innerFunction($yieldSent, $yieldAction);
                              } catch ($caughtException) {
                                $storedException = $caughtException;
                                switch ($state) {
                                  default:
                                    this.GState = 3;
                                    $state = -2;
                                    throw $storedException;
                                }
                              }
                            }
                          };
                      return $traceurRuntime.generatorWrap($G);
                    });
                  }), ms);
                  $state = 12;
                  break;
                case 10:
                  output.close();
                  $state = 14;
                  break;
                case 14:
                  $state = -2;
                case -2:
                  return false;
                case -3:
                  throw $storedException;
                default:
                  throw "traceur compiler bug: invalid state in state machine: " + $state;
              }
            },
            moveNext: function($yieldSent, $yieldAction) {
              while (true) try {
                return this.innerFunction($yieldSent, $yieldAction);
              } catch ($caughtException) {
                $storedException = $caughtException;
                switch ($state) {
                  default:
                    this.GState = 3;
                    $state = -2;
                    throw $storedException;
                }
              }
            }
          };
      return $traceurRuntime.generatorWrap($G);
    });
    return output;
  }
  function select(cases) {
    var done = new Channel(),
        remaining = cases.length,
        promise;
    promise = new Promise((function(resolve) {
      cases.forEach(function(item) {
        go(function() {
          var $state = 10;
          var $storedException;
          var $finallyFallThrough;
          var channel;
          var data;
          var response;
          var $that = this,
              $arguments = arguments,
              $G = {
                GState: 0,
                current: undefined,
                yieldReturn: undefined,
                innerFunction: function($yieldSent, $yieldAction) {
                  while (true) switch ($state) {
                    case 10:
                      channel = item.channel, response = item.response;
                      $state = 11;
                      break;
                    case 11:
                      this.current = channel.get();
                      $state = 1;
                      return true;
                    case 1:
                      if ($yieldAction == 1) {
                        $yieldAction = 0;
                        throw $yieldSent;
                      }
                      $state = 3;
                      break;
                    case 3:
                      data = $yieldSent;
                      $state = 5;
                      break;
                    case 5:
                      response(data);
                      $state = 13;
                      break;
                    case 13:
                      this.current = done.put(true);
                      $state = 7;
                      return true;
                    case 7:
                      if ($yieldAction == 1) {
                        $yieldAction = 0;
                        throw $yieldSent;
                      }
                      $state = 9;
                      break;
                    case 9:
                      $state = -2;
                    case -2:
                      return false;
                    case -3:
                      throw $storedException;
                    default:
                      throw "traceur compiler bug: invalid state in state machine: " + $state;
                  }
                },
                moveNext: function($yieldSent, $yieldAction) {
                  while (true) try {
                    return this.innerFunction($yieldSent, $yieldAction);
                  } catch ($caughtException) {
                    $storedException = $caughtException;
                    switch ($state) {
                      default:
                        this.GState = 3;
                        $state = -2;
                        throw $storedException;
                    }
                  }
                }
              };
          return $traceurRuntime.generatorWrap($G);
        });
      });
      go(function() {
        var $state = 5;
        var $storedException;
        var $finallyFallThrough;
        var $that = this,
            $arguments = arguments,
            $G = {
              GState: 0,
              current: undefined,
              yieldReturn: undefined,
              innerFunction: function($yieldSent, $yieldAction) {
                while (true) switch ($state) {
                  case 5:
                    if (remaining > 0) {
                      $state = 0;
                      break;
                    } else {
                      $state = 6;
                      break;
                    }
                  case 0:
                    this.current = done.get();
                    $state = 1;
                    return true;
                  case 1:
                    if ($yieldAction == 1) {
                      $yieldAction = 0;
                      throw $yieldSent;
                    }
                    $state = 3;
                    break;
                  case 3:
                    remaining = remaining - 1;
                    $state = 5;
                    break;
                  case 6:
                    resolve(true);
                    $state = 8;
                    break;
                  case 8:
                    $state = -2;
                  case -2:
                    return false;
                  case -3:
                    throw $storedException;
                  default:
                    throw "traceur compiler bug: invalid state in state machine: " + $state;
                }
              },
              moveNext: function($yieldSent, $yieldAction) {
                while (true) try {
                  return this.innerFunction($yieldSent, $yieldAction);
                } catch ($caughtException) {
                  $storedException = $caughtException;
                  switch ($state) {
                    default:
                      this.GState = 3;
                      $state = -2;
                      throw $storedException;
                  }
                }
              }
            };
        return $traceurRuntime.generatorWrap($G);
      });
    }));
    return promise;
  }
  global.$async = {
    go: go,
    Channel: Channel,
    timeout: timeout,
    listen: listen,
    jsonp: jsonp,
    lazyseq: lazyseq,
    unique: unique,
    pace: pace,
    sentinel: sentinel,
    select: select,
    range: null
  };
})(typeof global !== 'undefined' ? global: this);
(function(Channel, go, listen, unique, pace, jsonp) {
  var input = document.getElementById('searchtext'),
      results = document.getElementById('results');
  function clearResults() {
    results.innerHTML = '';
  }
  function showResults(terms) {
    var i,
        len,
        p;
    clearResults();
    for (i = 0, len = terms.length; i < len; i++) {
      p = document.createElement('p');
      p.innerHTML = terms[i];
      results.appendChild(p);
    }
  }
  function searchWikipedia(term) {
    var url = 'http://en.wikipedia.org/w/api.php?action=opensearch&format=json&callback=?&search=' + encodeURIComponent(term);
    return jsonp(url);
  }
  function showError(err) {
    results.innerHTML = '<h1p>Error:</h1>' + err;
  }
  go(function() {
    var $state = 24;
    var $storedException;
    var $finallyFallThrough;
    var data;
    var evt;
    var keyup;
    var minLength;
    var pacedKeyup;
    var previousText;
    var res;
    var text;
    var $that = this,
        $arguments = arguments,
        $G = {
          GState: 0,
          current: undefined,
          yieldReturn: undefined,
          innerFunction: function($yieldSent, $yieldAction) {
            while (true) switch ($state) {
              case 24:
                keyup = listen(input, 'keyup'), pacedKeyup = pace(keyup, 300);
                $state = 25;
                break;
              case 25:
                if (true) {
                  $state = 0;
                  break;
                } else {
                  $state = 23;
                  break;
                }
              case 0:
                this.current = pacedKeyup.get();
                $state = 1;
                return true;
              case 1:
                if ($yieldAction == 1) {
                  $yieldAction = 0;
                  throw $yieldSent;
                }
                $state = 3;
                break;
              case 3:
                evt = $yieldSent;
                $state = 5;
                break;
              case 5:
                text = evt.target.value;
                $state = 18;
                break;
              case 18:
                minLength = text.length > 2;
                $state = 20;
                break;
              case 20:
                if (minLength && text !== previousText) {
                  $state = 6;
                  break;
                } else {
                  $state = 14;
                  break;
                }
              case 6:
                this.current = searchWikipedia(text).get();
                $state = 7;
                return true;
              case 7:
                if ($yieldAction == 1) {
                  $yieldAction = 0;
                  throw $yieldSent;
                }
                $state = 9;
                break;
              case 9:
                data = $yieldSent;
                $state = 11;
                break;
              case 11:
                if (data.error) {
                  showError(JSON.stringify(data.error));
                } else {
                  if (data[0] && data[1]) {
                    showResults(data[1]);
                  }
                }
                $state = 13;
                break;
              case 14:
                if (!minLength) {
                  clearResults();
                }
                $state = 13;
                break;
              case 13:
                previousText = text;
                $state = 25;
                break;
              case 23:
                $state = -2;
              case -2:
                return false;
              case -3:
                throw $storedException;
              default:
                throw "traceur compiler bug: invalid state in state machine: " + $state;
            }
          },
          moveNext: function($yieldSent, $yieldAction) {
            while (true) try {
              return this.innerFunction($yieldSent, $yieldAction);
            } catch ($caughtException) {
              $storedException = $caughtException;
              switch ($state) {
                default:
                  this.GState = 3;
                  $state = -2;
                  throw $storedException;
              }
            }
          }
        };
    return $traceurRuntime.generatorWrap($G);
  });
})($async.Channel, $async.go, $async.listen, $async.unique, $async.pace, $async.jsonp);
