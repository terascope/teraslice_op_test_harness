'use strict';

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter;

// load data
const sampleDataArrayLike = require('./data/sampleDataArrayLike.json');
const sampleDataEsLike = require('./data/sampleDataEsLike.json');

const simpleData = [
    { name: 'Skippy', age: 20 },
    { name: 'Flippy', age: 21 },
    { name: 'Hippy', age: 22 },
    { name: 'Dippy', age: 23 },
];

const fakeLogger = {
    logger: {
        fatal() {},
        error() {},
        warn() {},
        info() {},
        debug() {},
        trace() {},
    }
};

function runProcessorSpecs(processor) {
    // TODO: I'd like to refactor this out into a stand-alone spec file in a
    // subdirectory, but this will do for now.
    describe('test harness', () => {
        it('has a schema and newProcessor method', () => {
            expect(processor).toBeDefined();
            expect(processor.newProcessor).toBeDefined();
            expect(processor.schema).toBeDefined();
            expect(typeof processor.newProcessor).toEqual('function');
            expect(typeof processor.schema).toEqual('function');
        });
    });
}

module.exports = (processor) => {
    /* A minimal context object */
    const events = new EventEmitter();
    const context = {
        logger: fakeLogger.logger,
        foundation: {
            getEventEmitter: () => events
        },
        sysconfig:
            {
                teraslice: {
                    ops_directory: ''
                }
            },
        apis: {
            registerAPI() {},
        }
    };

    const jobSchema = require('teraslice/lib/config/schemas/job').jobSchema(context);

    /**
     * jobSpec returns a simple jobConfig object consisting of two operations,
     * the first one `noop` and the second one the op being tested.
     * @param  {Object} opConfig an optional partial opConfig
     * @return {Object}          a jobConfig object
     */

    function jobSpec(opConfig) {
        return {
            operations: [
                {
                    _op: 'noop'
                },
                opConfig
            ],
        };
    }

    const validator = require('teraslice/lib/config/validators/config')();

    function run(data, extraOpConfig, extraContext) {
        let results = process(getProcessor(extraOpConfig, extraContext), data);
        events.emit('worker:shutdown');
        return results;
    }

    function runAsync(data, extraOpConfig, extraContext) {
        return Promise.resolve(getProcessor(extraOpConfig, extraContext))
            .then(proc => process(proc, data));
    }

    function getProcessor(opConfig, extraContext) {
        if (opConfig == null) {
            opConfig = {};
        }
        // run the jobConfig and opConfig through the validator to get
        // complete and convict validated configs
        const jobConfig = validator.validateConfig(jobSchema, jobSpec(opConfig));

        return processor.newProcessor(
            _.merge({}, context, extraContext),
            validator.validateConfig(processor.schema(), opConfig),
            jobConfig);
    }

    function process(myProcessor, data) {
        return myProcessor(data, fakeLogger.logger);
    }

    return {
        /* Setup mock contexts for processor, each processor takes:
         *   context - global teraslice/terafoundation context object
         *   opConfig - configuration of the specific operation being executed (the processor)
         *   jobConfig - details on this jobs configuration
         *   sliceLogger - a logger instance for each slice
         */
        context,

        /** Fake logger object with empty method definitions.  Suitable for use as
         *  the general teraslice logger or as the sliceLogger.  Implements the
         *  following log levels:
         *    - fatal
         *    - error
         *    - warn
         *    - info
         *    - debug
         *    - trace
         *  Which are derived from bunyan's default levels:
         *    https://github.com/trentm/node-bunyan#levels
         */
        fakeLogger,

        /** Standard test data objects: arrayLike and esLike */
        data: {
            /**
             * A very simple and small array of JSON objects
             */
            simple: simpleData,
            /**
             * Sample data in the form of an array of JSON documents , like would
             *   come from the elasticsearch_data_generator
             */
            arrayLike: sampleDataArrayLike,
            /**
             * Sample data in the form of an array of Elasticsearch query response.
             *   documents
             */
            esLike: sampleDataEsLike
        },
        _jobSpec: jobSpec,
        runProcessorSpecs,
        run,
        runAsync,
        getProcessor,
        process
    };
};
