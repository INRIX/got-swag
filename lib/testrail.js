/**
 * Created by ayang on 2/14/18.
 */
module.exports = new OCSTestRail();
var Testrail = require('testrail-api');
var XDate = require('xdate');


var self;
function OCSTestRail() {
    self = this;
}

OCSTestRail.prototype.projectId_OpenCar = 3;
OCSTestRail.prototype.suiteId_AppSvc = 223;
OCSTestRail.prototype.sectionId_Music = 2274;
OCSTestRail.prototype.sectionId_AuthZ = 2275;
OCSTestRail.prototype.testrail = new Testrail({
    host: 'https://inrix.testrail.com',
    user: 'alex.yang@inrix.com',
    password: '123456'
});

OCSTestRail.prototype.getCasesBySectionTitle = function (title) {
    var session_id = self.getSectionIdByTitle(title);

    return self.testrail.getCases(self.projectId_OpenCar, {suite_id: self.suiteId_AppSvc, section_id: session_id});
};

OCSTestRail.prototype.getCaseByTitle = function (caseTitle, sectionTitle) {
    return new Promise(function (resolve, reject) {
        var oneCase = null;
        self.getCasesBySectionTitle(sectionTitle).then(function (cases) {
            if(cases || cases.length > 0){
                for(var i=0; i<cases.length; i++){
                    if(cases[i].title.toLowerCase() == caseTitle.toLowerCase()){
                        oneCase = cases[i];
                        break;
                    }
                }
            }

            if(oneCase == null){
                self.createCase(caseTitle, sectionTitle).then(function (data) {
                    resolve(data);
                }, function (err) {
                    resolve();
                })
            }else{
                resolve(oneCase);
            }
        }).catch(function (err) {
            resolve(null);
        })
    });
};

OCSTestRail.prototype.getSectionIdByTitle = function (title) {
    if(!title){
        title = '';
    }
    var session_id = self.sectionId_Music;
    title = title.toLowerCase();
    if(title.indexOf('music') >= 0){
        session_id = self.sectionId_Music;
    }else if(title.indexOf('authz') >= 0){
        session_id = self.sectionId_AuthZ;
    }

    return session_id;
};

OCSTestRail.prototype.createCase = function (caseTitle, sectionTitle) {
    return new Promise(function (resolve, reject) {
        var sectionId = self.getSectionIdByTitle(sectionTitle);
        var data = {
            'title': caseTitle
        };
        self.testrail.addCase(sectionId, data).then(function (data) {
            resolve(data);
        }).catch(function (err) {
            reject(err);
        })
    });
};

OCSTestRail.prototype.getTestRailRunByTitle = function (title) {
    return new Promise(function (resolve, reject) {
        self.testrail.getRuns(self.projectId_OpenCar, {suite_id:self.suiteId_AppSvc}, function (err, runs) {
            var run = null;
            if(!err && runs){
                for(var i=0; i<runs.length; i++){
                    if(runs[i].name.toLowerCase() == title.toLowerCase()){
                        run = runs[i];
                        break;
                    }
                }
            }

            resolve(run);
        })
    })
};

OCSTestRail.prototype.addTestRailResult = function (run_id, case_id, result) {
    return new Promise(function (resolve, reject) {
        self.testrail.addResultForCase(run_id, case_id, result).then(function (result) {
            resolve(result);
        }, function (err) {
            reject(err);
        })
    })
};

OCSTestRail.prototype.getSectionTitleFromUrl = function (urls) {
    if(urls && urls.length >0){
        for(var i = 0; i<urls.length; i++){
            var url = urls[i];
            if(url.indexOf('music') >= 0){
                return 'music';
            }else if(url.indexOf('authz') >= 0){
                return 'authz';
            }
        }
    }

    return 'other';
};


/**
 * create test rail run by selecting cases through section title
 * @param title - music or authz, etc
 * @returns {Promise}
 */
OCSTestRail.prototype.createTestRailRun = function (title) {
    return new Promise(function (resolve, reject) {
        var now = new XDate(true);
        var name = "AppSvc_" + title + "_BVT_" + now.toString('MM/dd/yyyy');
        var data = {
            suite_id: self.suiteId_AppSvc,
            name: name,
            include_all: false,
            case_ids: []
        };

        self.getTestRailRunByTitle(name).then(function (run) {
            if(!!run){
                resolve(run);
            }else{
                self.getCasesBySectionTitle(title).then(function (cases) {
                    if(cases && cases.length >0){
                        cases.forEach(function (oneCase) {
                            data.case_ids.push(oneCase.id);
                        });

                        self.testrail.addRun(self.projectId_OpenCar, data).then(function (run) {
                            resolve(run);
                        }, function (err) {
                            reject(err);
                        })
                    }else{
                        reject('no cases');
                    }
                })
            }
        })
    })
};



