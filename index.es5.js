(function(global) {
  'use strict';
  var sentinel = Symbol('Ω');
  if (global.async) {
    return;
  }
  function isGenerator(x) {
    return true;
  }
  function job(routine) {
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
  var Pipe = function() {
    this.synching = false;
    this.inbox = [];
    this.outbox = [];
    this.isOpen = true;
  };
  Pipe = ($traceurRuntime.createClass)(Pipe, {
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
  var EventPipe = function(el, type, handler) {
    el.addEventListener(type, handler);
    $traceurRuntime.superCall(this, $EventPipe.prototype, "constructor", []);
  };
  var $EventPipe = ($traceurRuntime.createClass)(EventPipe, {close: function() {
      el.removeEventListener(type, handler);
      $traceurRuntime.superCall(this, $EventPipe.prototype, "close", []);
    }}, {}, Pipe);
  function timeout(ms, interruptor) {
    var output = new Pipe();
    setTimeout(function() {
      job(function() {
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
      job(function() {
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
    var output = new EventPipe(el, type, handler);
    return output;
  }
  function jsonp(url) {
    var output = new Pipe();
    $.getJSON(url, (function(data) {
      job(function() {
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
    var output = new Pipe();
    job(function() {
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
    var output = new Pipe();
    job(function() {
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
    var output = new Pipe();
    job(function() {
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
                    job(function() {
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
    var done = new Pipe(),
        remaining = cases.length,
        promise;
    promise = new Promise((function(resolve) {
      cases.forEach(function(item) {
        job(function() {
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
      job(function() {
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
    job: job,
    Pipe: Pipe,
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
(function(Pipe, job, timeout) {
  function render(q) {
    return q.map((function(p) {
      return '<div class="proc-' + p + '">Process ' + p + '</div>';
    })).join('');
  }
  function peekn(array, n) {
    var len = array.length,
        res = len > n ? array.slice(len - n): array;
    return res;
  }
  (function() {
    var pipe = new Pipe(),
        out = document.getElementById('eg1out');
    job(function() {
      var $state = 7;
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
                case 7:
                  if (true) {
                    $state = 0;
                    break;
                  } else {
                    $state = 8;
                    break;
                  }
                case 0:
                  this.current = timeout(250).get();
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
                  this.current = pipe.put(1);
                  $state = 5;
                  return true;
                case 5:
                  if ($yieldAction == 1) {
                    $yieldAction = 0;
                    throw $yieldSent;
                  }
                  $state = 7;
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
    job(function() {
      var $state = 7;
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
                case 7:
                  if (true) {
                    $state = 0;
                    break;
                  } else {
                    $state = 8;
                    break;
                  }
                case 0:
                  this.current = timeout(1000).get();
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
                  this.current = pipe.put(2);
                  $state = 5;
                  return true;
                case 5:
                  if ($yieldAction == 1) {
                    $yieldAction = 0;
                    throw $yieldSent;
                  }
                  $state = 7;
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
    job(function() {
      var $state = 7;
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
                case 7:
                  if (true) {
                    $state = 0;
                    break;
                  } else {
                    $state = 8;
                    break;
                  }
                case 0:
                  this.current = timeout(1500).get();
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
                  this.current = pipe.put(3);
                  $state = 5;
                  return true;
                case 5:
                  if ($yieldAction == 1) {
                    $yieldAction = 0;
                    throw $yieldSent;
                  }
                  $state = 7;
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
    job(function() {
      var $state = 13;
      var $storedException;
      var $finallyFallThrough;
      var data;
      var newItem;
      var $that = this,
          $arguments = arguments,
          $G = {
            GState: 0,
            current: undefined,
            yieldReturn: undefined,
            innerFunction: function($yieldSent, $yieldAction) {
              while (true) switch ($state) {
                case 13:
                  data = [];
                  $state = 14;
                  break;
                case 14:
                  if (true) {
                    $state = 6;
                    break;
                  } else {
                    $state = 12;
                    break;
                  }
                case 6:
                  out.innerHTML = render(data);
                  $state = 7;
                  break;
                case 7:
                  this.current = pipe.get();
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
                  newItem = $yieldSent;
                  $state = 5;
                  break;
                case 5:
                  data.push(newItem);
                  $state = 9;
                  break;
                case 9:
                  data = peekn(data, 10);
                  $state = 14;
                  break;
                case 12:
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
  })();
})($async.Pipe, $async.job, $async.timeout);
