'use strict';

describe('With no op config', function() {
    const harness = require('../index')(require('./processors/foo'));
    it('it runs successfully', function() {
        let results = harness.run([{}]);
        expect(results.length).toEqual(1);
        expect(results[0].foo).toEqual('foo');
    });
});


describe('With multiple jobs', function() {
    const harness = require('../index')(require('./processors/foo'));
    it('first job runs', function() {
        let results = harness.run([{}], {field: 'yeee'});
        expect(results.length).toEqual(1);
        expect(results[0].yeee).toEqual('foo');
    });
    it('second job config not influenced by the first', function() {
        let results = harness.run([{}], {});
        expect(results.length).toEqual(1);
        expect(results[0].foo).toEqual('foo');
        expect(results[0].yeee).toBeUndefined();
    });
});


describe('With event callbacks', function() {
    const events = [];
    const harness = require('../index')(require('./processors/events'));
    harness.run([], {cb: (i) => events.push(i) });
    it('it runs successfully', function() {
        expect(events.length).toEqual(1);
        expect(events[0]).toEqual('worker:shutdown');
    });
});
