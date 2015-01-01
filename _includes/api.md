

<!-- Start src/routines.js -->

# Running concurrent code

### go(fn, args)

Run a generator function `fn` as a concurrent routine.

##### Example:
```
var chan = new Routines.Chan();

Routines.go(function* () {
    chan.send(1);
});

Routines.go(function* () {
    while (true) {
        yield Routines.timeout(250).get();
        chan.send(2);
    }
});

Routines.go(function* () {
   while (true) {
       yield Routines.timeout(400).get();
       chan.send(3);
   }
});

Routines.go(function* () {
    var data;
    while (data = yield chan.get()) {
        console.log(data);
    }
});
```

To communicate and synchronize between routines, send data through a `Chan`
using `put` (or `send`) and receive data using `get`.

##### Params:

* **Function** *fn* A generator function to execute as a concurrent routines

* **Array** *args* Parameters to pass to `fn`

---
# Communicating &amp; synchronizing between routines

### Chan

A channel provides a way for two routines to communicate data and synchronize their execution.
One routines can send data into the channel by calling `yield chan.put(data)` or `chan.send(data)`
and another routine can receive data by calling `yield chan.get()`.

Once both a sender routine and a receiver routine are waiting on the channel a rendezvous occurs,
transferring the data in the channel to the receiver and consequently synchronizing the two
waiting routines.

Once synchronized, the two routines continue execution.

##### Example:
```
var chan = new Chan();
```

### Chan.close()

Mark the channel as closed.

### Chan.put(data)

Call `yield chan.put(data)` from a routine (the sender) to put data in the channel.

The put method will then try to rendezvous with a receiver routine, if any.
If there is no receiver waiting for data, the sender will pause until another
routine calls `yield chan.get()`, which will then trigger a rendezvous.

##### Example
```
go(function* () {
    yield chan.put(42);
});
```

##### Params:

* **AnyType** *data* The data to put into the channel.

### Chan.get()

Call `yield chan.get()` from a routine (the receiver) to get data from the channel.

The get method will then try to rendezvous with a sender routine, if any.
If there is no sender waiting for the data it sent to be delivered, the receiver will
pause until another routine calls `yield chan.put(data)`, which will then trigger
a rendezvous.

##### Example:
```
go(function* () {
    var data;
    while (data = yield chan.get()) {
        console.log(data);
    }
});
```

##### Return:

* **AnyType** The data that was received from the channel.

### Chan.send(data)

Like `put`, but non-blocking. Unlike `put`, do not call with `yield`.

##### Example:
```
chan.send(42);
```

##### Params:

* **AnyType** *data* The data to put in the channel.

### EventChan

An EventChan is a channel for delivering event data.

##### Example:

```
var chan = new EventChan(document, &#39;keydown&#39;, function(evt) {
    chan.send(evt);
});
```

Normally you should use the `listen` function to create an EventChan instead.

##### Params:

* **Object** *el* An object, such as an HTMLElement, that exposes an addEventListener method.

* **String** *type* The name of the event, e.g. &#39;keydown&#39;.

* **Function** *handler* The function that is called when the event fires.

### EventChan.close()

Removes the event listener and closes the channel.

---
# Making channels

### timeout(ms)

NOTE: will probably get renamed to `pause`.

Create a channel that receives a value after a specified time. Use `timeout`
to pause a `routine`. Other routines get a chance to execute this routine is paused.

##### Example:

```
go(function* () {
    yield timeout(200).get();
    console.log(&#39;200ms elapsed&#39;);
});
```

##### Params:

* **Number** *ms* The time to wait before a value is placed in the channel

##### Return:

* **Chan** A channel

### listen(el, type, preventDefault)

Create a `Chan` that receives event data.

##### Example:

```
var chan = listen(document, &#39;keydown&#39;);
var keydownEventData = yield chan.get();
console.log(keydownEventData);
```

##### Params:

* **Object** *el* The object, such as an HTMLElement, on which to listen for events

* **String** *type* The name of the event, e.g. &#39;keydown&#39;

* **Boolean** *preventDefault* Whether or not `.preventDefault()` should be called

##### Return:

* **Chan** A channel

### lazyseq(count, fn)

Creates a channel with `count` elements, each produced by executing the function `fn`.

##### Example:

```
var chan = lazyseq(5, function(i) { return i * 10; });

go(function* () {
    var data,
        result = [];

    while (data = yield chan.get()) {
        result.push(data);
    }

    console.log(result);
});
```
Prints `[0, 10, 20, 30, 40]` to console.

##### Params:

* **Number** *count* The number of elements that should be produced

* **Function** *fn* The function that produces each element. It is invoked with

### denode(fn, args)

Creates a `Chan` that will get the data produced by a callback-invoking NodeJS
function.

Useful for converting callback style code into sequential code.

##### Example:

```
go(function* () {
    var filedata = yield denode(fs.readFile, &#39;readme.txt&#39;);
    console.log(filedata);
});
```

##### Params:

* **Function** *fn* A node function that invokes a callback, e.g. fs.readFile

* **Array** *args* The arguments to supply to `fn`

---
## Transforming channels

### unique(chan)

Takes a channel and produces a new chanbel that only receives sequentially unique
values.

##### Example:

```
var chan1 = new Chan(),
    chan2 = unique(chan1);

chan1.send(1);
chan1.send(1);
chan1.send(3);
chan1.send(1);

go(function* () {
    var data,
        result = [];
    while (data = yield chan2.get()) {
        result.push(data);
    }
    console.log(result);
});

```
Prints `[1, 3, 1]` to console.

##### Params:

* **Chan** *chan* The channel from which sequentially unique values must be produced

##### Return:

* **Chan** A channel

### pace(ms, chan)

Produces a new channel that gets data from a source channel at a given pace.

##### Params:

* **Number** *ms* The time to wait before getting the next value from the source channel

* **Chan** *chan* The source channel

##### Return:

* **Chan** A chan

<!-- End src/routines.js -->
