function Event() {
    this.queue = {};
}

var api = Event.prototype;

api.emit = function(event) {
    var _this = this;
    var args = [].slice.call(arguments, 1);
    var events = _this.queue[event];

    if (!events || !events.length) return false;

    for (var i = 0, l = events.length; i < l; i++) { 
        var event = events[i];
        // 如果某一个 handle 返回了 true
        // 那么事件将不会继续传播
        if (typeof event === 'function' && event.apply(null, args) === true) {
            break;
        }
    }
};

api.on = function(event, handle) {
    var _this = this;

    if (!(event in _this.queue)) _this.queue[event] = [];

    _this.queue[event].push(handle);
};

api.once = function(event, handle) {
    var _this = this;
    var callBack = handle;

    handle = function() {
        var args = [].slice.call(arguments);
        
        callBack.apply(null, args);
        _this.un(event, handle);
    };

    _this.on(event, handle);
};

api.un = function(event) {
    var _this = this;
    var args = [].slice.call(arguments, 1);
    
    // if not specify handle invoke 
    // the event queue will be all unload 
    if (args.length === 0) {
        this.queue[event] = [];
        return;
    }

    var events = _this.queue[event];
    
    if (events && events.length) {
        events.forEach(function(handle, index) {
            if (args.indexOf(handle) != -1) {
                events.splice(index, 1);
            }
        });
    }
};

module.exports = Event;

function test() {
    var event = new Event();

    event.on('biu', function(message) {
        console.log('first', message);
    });

    function secondHandle(message) {
        console.log('second', message);
        return true;
    }

    event.on('biu', secondHandle);

    event.once('biu', function(message) {
        console.log('once', message);
    });

    var count = 5;

    while(count--) {
        event.emit("biu", "biu");
        
        if (count == 4) {
            event.un('biu', secondHandle);
        }

        if (count == 2) {
            event.un('biu', true);
        }
    };
}
