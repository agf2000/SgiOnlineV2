var db = require("../core/db");
var util = require("util");

exports.getClients = function (req, res, orderBy, orderDir, pageIndex, pageSize, searchFor) {
    try {
        switch (orderBy) {
            case "Telefone":
                orderBy = "(select top 1 telefone from telefone where pessoa = c.codigo and padrao = 1)";
                break;
            case "Contato":
                orderBy = "(select top 1 contato from telefone where padrao = 1 and pessoa = C.[codigo])";
                break;
            default:
                break;
        }

        var sqlInst = "select top(" + pageSize + ") * from (select rowid = row_number() over (order by " + orderBy + " " + orderDir + "), " +
            "c.*, enderecocompleto = (select top 1 upper(dbo.asstring(v.tipo_logradouro) + ': ' + dbo.asstring(v.logradouro) + ', " +
            "nº' + dbo.asstring(c.numero) + ' - bairro: ' + dbo.asstring(v.bairro) + ' - ' + dbo.asstring(v.cidade)) " +
            "from view_endereco_completo v where v.codigo = c.cep), " +
            "telefone = (select top 1 telefone from telefone where pessoa = c.codigo and padrao = 1), " +
            "contato = (select top 1 contato from telefone where padrao = 1 and pessoa = c.codigo), " +
            "totalRows = count(*) over() from cliente c " +
            "where 1 = 1 " + searchFor + ") a where a.rowid > ((" + pageIndex + " - 1) * " + pageSize + ")";

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

exports.getClient = function (req, res, id, orderBy, orderDir) {
    try {
        var sqlInst = "select c.*, vc.*, " +
            "(select '[' + stuff((select ',{''codigo'':' + cast(codigo as varchar(10)) + ','" +
                "'telefone'':''' + cast(telefone as varchar(10)) + ''',''contato'':''' + cast(contato as varchar(50)) + '''}' " +
                "from telefone t1 where pessoa = " + id + " for xml path (''), type).value('.', 'varchar(max)'), 1, 1, '') + ']')" +
                "as telefones, " +
            "(select top 1 codigo from cliente where codigo > c.codigo order by codigo) as anterior, " +
            "(select top 1 codigo from cliente where codigo < c.codigo order by codigo desc) as proximo " +
            "from cliente c inner join view_valida_cliente vc on c.codigo = vc.pessoa where c.codigo = " + id;

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

exports.removeClient = function (req, res, id) {
    try {
        var sqlInst = "delete from pessoas where codigo = " + id;

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
                    res.write("{ result: 'success' }");

                    res.end();
                }
            });
    } catch (ex) {
        res.send(ex);
    }
};

exports.validateUser = function (req, res, reqBody) {
    try {
        var sqlInst = util.format("select u.codigo, u.funcionario, u.adm, p.vendedor, p.email, p.nome, p.fantasia, f.CodDepartamento, " +
            "f.Supervisor, d.nome as departamento, u.ativo_web, (dbo.bloqueios_depto(108, f.coddepartamento)) as bloqueado_desconto_departamento, " +
            "(dbo.bloqueios_depto(105, f.coddepartamento)) as bloqueado_departamento from usuario u " +
            "left outer join funcionario p on u.funcionario = p.Codigo left outer join fisica f on u.funcionario = f.pessoa " +
            "left outer join departamentos d on f.CodDepartamento = d.codigo where u.codigo = '%s' " +
            "and pwdcompare('%s', u.senha, 0) = 1", reqBody.username, reqBody.password);

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

exports.getTelephones = function (req, res, clientId) {
    try {
        var sqlInst = "select * from telefone where pessoa = " + clientId;

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