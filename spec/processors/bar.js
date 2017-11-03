'use strict';

// Respond to `bar` events with "baz".

function newProcessor(context, opConfig) {
    const events = context.foundation.getEventEmitter();
    events.on('bar', () => {
        opConfig.cb('baz');
    })
    return function process(data) {
        return [];
    };
}

function schema() {
    return {
        cb: {
            doc: 'Callback function'
        }
    };
}

module.exports = { newProcessor, schema };
