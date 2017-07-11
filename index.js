// load data
var sampleDataArrayLike = require('./data/sampleDataArrayLike.json');
var sampleDataEsLike = require('./data/sampleDataEsLike.json');

var simpleData = [
    {'name': 'Skippy', 'age': 20},
    {'name': 'Flippy', 'age': 21},
    {'name': 'Hippy', 'age': 22},
    {'name': 'Dippy', 'age': 23},
];

var fakeLogger = {
    logger: {
        fatal: function() {},
        error: function() {},
        warn: function() {},
        info: function() {},
        debug: function() {},
        trace: function() {},
    }
};

function runProcessorSpecs(processor) {
    // TODO: I'd like to refactor this out into a stand-alone spec file in a
    // subdirectory, but this will do for now.
    describe('The dupedoc processor', function() {
        it('has a schema and newProcessor method', function() {
            expect(processor).toBeDefined();
            expect(processor.newProcessor).toBeDefined();
            expect(processor.schema).toBeDefined();
            expect(typeof processor.newProcessor).toEqual('function');
            expect(typeof processor.schema).toEqual('function');
        });
    });
}

/**
 * Teraslice Processor Test Framework
 * @module teraslice_processor_test_framework
 */
module.exports = (op) => {
    /* A minimal context object */
    var context = {
        sysconfig:
            {
                teraslice: {
                    ops_directory: '/Users/godber/Workspace/terascope/gitlab/godber/example_processors/dupedoc_asset/dupedoc'
                }
            }
    };

    var jobValidator = require('teraslice/lib/config/validators/job')(context);

    function jobSpec(op) {
        return {
            'operations': [
                {
                    '_op': 'noop'
                },
                {
                    '_op': op
                },
            ],
        };
    }

    var jobConfig = jobValidator.validate(jobSpec(op));

    // console.log(jobConfig);
    // console.log(jobConfig.operations[1]);

    return {
        /* Setup mock contexts for processor, each processor takes:
         *   context - global teraslice/terafoundation context object
         *   opConfig - configuration of the specific operation being executed (the processor)
         *   jobConfig - details on this jobs configuration
         *   sliceLogger - a logger instance for each slice
         */
        context: context,
        opConfig: jobConfig.operations[1], // 1 is the current op, the 0th operation is a noop

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
        fakeLogger: fakeLogger,

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
        runProcessorSpecs: runProcessorSpecs,
        run: function(processor, data) {
            var myProcessor = processor.newProcessor(
                context, // context
                this.opConfig, // opConfig
                this.jobConfig); // jobConfig
            return myProcessor(data, fakeLogger.logger);
        },
    };
};
