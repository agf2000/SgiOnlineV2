var sqlDb = require("mssql");
var settings = require("../dbConfig");

exports.executeSql = function (sql, params, callback) {
    var conn = new sqlDb.Connection(settings.dbConfig);

    conn.connect().then(function () {

        var req = new sqlDb.Request(conn);

        if (params) {
            for (var propt in params) {
                /*switch (true) {
                    case (params[propt].indexOf('T00') > 1):
                        var theDate = new Date(params[propt]);
                        req.input(propt, sqlDb.DateTime, theDate);
                        break;    
                    case (typeof params[propt] === 'number'):
                        req.input(propt, sqlDb.Int, params[propt]);
                        break;              
                    default:
                        req.input(propt, params[propt]);
                        break;
                }*/
                req.input(propt, params[propt]);
            };
        }

        req.execute(sql).then(function (data) {

            callback(data);

        }).catch(function (err) {
            console.log(err);
            callback(null, err);
        });
    }).catch(function (err) {
        console.log(err);
        callback(null, err);
    });
};

exports.querySql = function (sql, callback) {
    var conn = new sqlDb.Connection(settings.dbConfig);

    conn.connect().then(function () {

        var req = new sqlDb.Request(conn);

        req.query(sql).then(function (data) {

            callback(data);

        }).catch(function (err) {
            console.log(err);
            callback(null, err);
        });
    }).catch(function (err) {
        console.log(err);
        callback(null, err);
    });
};
