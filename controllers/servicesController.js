var db = require("../core/db");
var util = require("util");

exports.getAddress = function (req, res, postalCode) {
    try {
        var sqlInst = "select top 1 * from view_endereco_completo where cep = " + postalCode;

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    res.writeHead(500, "Internal Server Error", {
                        "Content-Type": "text/html"
                    });
                    res.write("<html><title>500</title><body>500: Internal Server Error. Details: " + err + "</body></html>");

                    res.end();
                } else {
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.write(JSON.stringify(data).replace(/"([\w]+)":/g, function ($0, $1) {
                        return ('"' + $1.toLowerCase() + '":');
                    }));

                    res.end();
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};

exports.getCountries = function (req, res, filter) {
    try {
        var sqlInst = "select * from cadpais where nomepais like '" + filter + "%'";

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    res.writeHead(500, "Internal Server Error", {
                        "Content-Type": "text/html"
                    });
                    res.write("<html><title>500</title><body>500: Internal Server Error. Details: " + err + "</body></html>");

                    res.end();
                } else {
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.write(JSON.stringify(data).replace(/"([\w]+)":/g, function ($0, $1) {
                        return ('"' + $1.toLowerCase() + '":');
                    }));

                    res.end();
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};

exports.getClasses = function (req, res, filter, pageIndex, pageSize) {
    try {
        var sqlInst = "select top(" + pageSize + ") * from (select rowid = row_number() over (order by c.nome), c.*, ";
        sqlInst += "total_count = count(*) over() from classes c where ('" + filter + "' = '' or c.nome like '" + filter + "%') ";
        sqlInst += ") a where a.rowid > ((" + pageIndex + " - 1) * " + pageSize + ")";

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    res.writeHead(500, "Internal Server Error", {
                        "Content-Type": "text/html"
                    });
                    res.write("<html><title>500</title><body>500: Internal Server Error. Details: " + err + "</body></html>");

                    res.end();
                } else {
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    // data.push({ 'total': data[0].total_count });
                    res.write(JSON.stringify(data).replace(/"([\w]+)":/g, function ($0, $1) {
                        return ('"' + $1.toLowerCase() + '":');
                    }));

                    res.end();
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};

exports.getRegions = function (req, res, filter, pageIndex, pageSize) {
    try {
        var sqlInst = "select top(" + pageSize + ") * from (select rowid = row_number() over (order by c.nome), c.*, ";
        sqlInst += "total_count = count(*) over() from regioes c where ('" + filter + "' = '' or c.nome like '" + filter + "%') ";
        sqlInst += ") a where a.rowid > ((" + pageIndex + " - 1) * " + pageSize + ")";

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    res.writeHead(500, "Internal Server Error", {
                        "Content-Type": "text/html"
                    });
                    res.write("<html><title>500</title><body>500: Internal Server Error. Details: " + err + "</body></html>");

                    res.end();
                } else {
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.write(JSON.stringify(data).replace(/"([\w]+)":/g, function ($0, $1) {
                        return ('"' + $1.toLowerCase() + '":');
                    }));

                    res.end();
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};

exports.getProfessions = function (req, res, filter) {
    try {
        var sqlInst = "select * from profissoes where nome like '" + filter + "%' ";

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    res.writeHead(500, "Internal Server Error", {
                        "Content-Type": "text/html"
                    });
                    res.write("<html><title>500</title><body>500: Internal Server Error. Details: " + err + "</body></html>");

                    res.end();
                } else {
                    res.writeHead(200, {
                        "Content-Type": "application/json"
                    });
                    res.write(JSON.stringify(data).replace(/"([\w]+)":/g, function ($0, $1) {
                        return ('"' + $1.toLowerCase() + '":');
                    }));

                    res.end();
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};

exports.saveAddress = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        var address = reqBody;
        if (address) {
            db.executeSql("sp_insere_endereco", address,
                function (data, err) {
                    if (err) {
                        res.writeHead(500, "Internal Server Error", {
                            "Content-Type": "text/html"
                        });
                        res.write("<html><title>500</title><body>500: Internal Server Error. Details: " + err + "</body></html>");

                        res.end();
                    } else {
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });
                        res.write(JSON.stringify(data).replace(/"([\w]+)":/g, function ($0, $1) {
                            return ('"' + $1.toLowerCase() + '":');
                        }));

                        res.end();
                    }
                });
        } else {
            throw new Error("Input not valid");
        }
    } catch (ex) {
        res.send(ex);
    }
};