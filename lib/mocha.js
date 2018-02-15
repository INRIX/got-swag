var bundleApis = require('./bundleApis');
var parseTests = require('./parseTests');
var createSandbox = require('./createSandbox');
var runStep = require('./runStep');
var Mocha = require('mocha');
var _ = require('lodash');
var INRIXTestRail = require('./testrail');

module.exports = mocha;

function mocha(urls, options) {

    var sectionTitle = INRIXTestRail.getSectionTitleFromUrl(urls);
    return INRIXTestRail.createTestRailRun(sectionTitle).then(function (run) {

        options = options || {};

        return bundleApis(urls).then(function (api) {

            var mocha = new Mocha(_.omit(options, 'trace'));
            mocha.suite.title = 'Got Swag?';
            var apiSuite = Mocha.Suite.create(options.parent || mocha.suite, api['x-main-url'] + ':');

            var i = 0;
            var sandbox = createSandbox(api, options);
            sandbox.testRailRun = run;

            parseTests(api, options).forEach(function (test) {

                ++i;
                var stepResults = [];

                var testSuite = Mocha.Suite.create(apiSuite,
                    ( test.path ? ( test.method.toUpperCase() + ' ' + test.path + ' ' ) : '' ) +
                    ( test.description || 'Test #' + i ) +
                    ( test.caseDescription ? ( ' -- ' + test.caseDescription ) : '' ) +
                    ':'
                );

                testSuite.beforeAll(function () {
                    sandbox.test = test;
                    sandbox.data = test.data;
                });

                testSuite.afterAll( function () {
                    //check test result
                    var title = test.path + ': - ' + test.method + ': - ' + test.description;
                    var testResult = true;
                    stepResults.forEach(function (eachResult) {
                        if(!eachResult){
                            testResult = false;
                        }
                    });

                    //update test result
                    var run_id = sandbox.testRailRun.id;
                    INRIXTestRail.getCaseByTitle(title, sectionTitle).then(function (testCase) {
                        if(!testCase){
                            return;
                        }
                        var case_id = testCase.id;

                        var data = {
                            status_id: testResult ? 1 : 5  //1 pass, 5 failed
                        }
                        INRIXTestRail.addTestRailResult(run_id, case_id, data);
                    });
                } );

                test.steps.forEach(function (step) {

                    var stepTest = new Mocha.Test(step, function (done) {

                        runStep(step, sandbox).then(function (result) {

                            done(result.ok ? undefined : result.error);
                            return result.output;

                        }).then(function (output) {

                            if (output.length > 0) console.log(output.join('\n'));

                        }).catch(function (err) {
                            console.log(err.message);
                        });

                    });

                    testSuite.addTest(stepTest);
                });

            });

            return mocha;
        });
    });
}
