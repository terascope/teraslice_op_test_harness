'use strict';

// Call cb(event) for each worker event.

function newProcessor(context, opConfig) {
    const events = context.foundation.getEventEmitter();
    events.on('worker:shutdown', () => {
        opConfig.cb('worker:shutdown');
    })
    return function process(data) {
        return [];
    };
}

function schema() {
    return {
        cb: {
            doc: 'Callback function for events.'
        }
    };
}

module.exports = { newProcessor, schema };
