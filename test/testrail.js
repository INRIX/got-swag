/**
 * Created by ayang on 2/14/18.
 */
var assert = require( 'assert' );
var parser = require( 'json-schema-ref-parser' );
var exampleVars = require( '../lib/exampleVars' );
var inrixTestRail = require('../lib/testrail');

describe( 'test rail function', function () {

    it( 'get case by title', function (done) {
        var title = '/v2/albums: - get: - Should fail unauthorized';
        var section = 'music';
        inrixTestRail.getCaseByTitle(title, section).then(function (testRailCase) {
            console.log(testRailCase);
        }, function (err) {
            console.log(err);
        });

        setTimeout(function () {
            done();
        }, 3 * 60 * 1000);
    } );

    it( 'get run by title', function (done) {
        var title = 'AppSvc_Music BVT Run';
        inrixTestRail.getTestRailRunByTitle(title).then(function (testRun) {
            console.log(testRun);
        }, function (err) {
            console.log(err);
        });

        setTimeout(function () {
            done();
        }, 3 * 60 * 1000);
    } );

    it( 'create run by section title', function (done) {
        var title = 'music';
        inrixTestRail.createTestRailRun(title).then(function (testRun) {
            console.log(testRun);
        }, function (err) {
            console.log(err);
        });

        setTimeout(function () {
            done();
        }, 3 * 60 * 1000);
    } );

    it( 'add test result', function (done) {
        var run_id = '1276';
        var case_id = '28714';
        var result = {
            status_id: 1
        };
        inrixTestRail.addTestRailResult(run_id, case_id, result).then(function (result) {
            console.log(result);
        }, function (err) {
            console.log(err);
        });

        setTimeout(function () {
            done();
        }, 3 * 60 * 1000);
    } );

} );
