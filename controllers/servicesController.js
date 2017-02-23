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

exports.getCities = function (req, res, filter) {
    try {
        var sqlInst = "select * from cidade where nome like '" + filter + "%' ";

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

exports.saveTelephone = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        var phone = reqBody;
        if (phone) {
            var sqlInst = "";
            if (JSON.parse(phone.padrao)) {
                sqlInst += "update telefone set padrao = 0 where pessoa = " + phone.pessoa + "; ";
            }

            sqlInst += "insert into telefone (pessoa, tipo, telefone, padrao, contato, data_cadastro";

            if (phone.nascimento) sqlInst += ", dataNascimento";
            if (phone.email) sqlInst += ", email";

            sqlInst += util.format(") values (%d, %d, '%s', '%s', '%s', getDate()", phone.pessoa, phone.tipo, phone.telefone, phone.padrao, phone.contato);

            sqlInst += ") select scope_identity() as codigo ";

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
        } else {
            throw new Error("Input not valid");
        }
    } catch (ex) {
        res.send(ex);
    }
};

exports.updateTelephone = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        var phone = reqBody;
        if (phone.codigo !== "") {
            var sqlInst = "";
            if (JSON.parse(phone.padrao)) {
                sqlInst += "update telefone set padrao = 'false' where pessoa = " + phone.pessoa + "; ";
            }

            sqlInst += "update telefone set pessoa = " + phone.pessoa + ", tipo = " + phone.tipo + ", ";
            sqlInst += "telefone = '" + phone.telefone + "', padrao = '" + phone.padrao + "', contato = '" + phone.contato + "'";

            if (phone.nascimento) ", datanascimento = '" + phone.nascimento + "'";
            if (phone.email) ", email = '" + phone.email + "'";

            sqlInst += " where codigo = " + phone.codigo;

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

                        res.write('{ "result": "success" }');

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

exports.removeTelephone = function (req, res, id) {
    try {
        var sqlInst = "delete from telefone where codigo = " + id;

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
                    res.write('{ "result": "success" }');

                    res.end();
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};