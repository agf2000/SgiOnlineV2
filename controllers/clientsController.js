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
        sqlInst += "select count(*) as recordstotal from cliente where 1 = 1 " + searchFor;

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

                    var result = {
                        "recordsTotal": data[1][0].recordstotal,
                        "data": data[0]
                    };

                    res.write(JSON.stringify(result));

                    res.end();
                }
            }, true);
    } catch (ex) {
        res.send(ex);
    }
};

exports.getClient = function (req, res, id, orderBy, orderDir) {
    try {
        var sqlInst = "select c.*, vc.*, " +
            "(select '[' + stuff((select ',{''codigo'':' + cast(codigo as varchar(10)) + '," +
            "''tipo'':''' + cast(tipo as varchar(2)) + '''," +
            "''padrao'':''' + cast(padrao as varchar(10)) + '''," +
            "''telefone'':''' + cast(telefone as varchar(20)) + '''," +
            "''contato'':''' + cast(isnull(contato, '') as varchar(50)) + '''}' " +
            "from telefone t1 where pessoa = " + id + " for xml path (''), type).value('.', 'varchar(max)'), 1, 1, '') + ']')" +
            "as telefones, " +
            "(select top 1 codigo from cliente where codigo > c.codigo order by codigo) as anterior, " +
            "(select top 1 codigo from cliente where codigo < c.codigo order by codigo desc) as proximo " +
            "from cliente c inner join view_valida_cliente vc on c.codigo = vc.pessoa where c.codigo = " + id + "; ";
        // sqlInst += "select * from telefone where pessoa = " + id;

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

                    // data[0].telfones = data[1];
                    // var result = '{ "data": ' + data + '}';

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

exports.addClient = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        var client = reqBody;
        if (client) {
            var sqlInst = "declare @codigo int insert into pessoas (nome, fantasia, natureza, numero, complemento, email, ";
            sqlInst += "ativo, cpf_cnpj, rg_insc_est, observacao, insc_municipal, cod_funcionario, tipo, data_Cadastro, tipoCli";

            if (client.classe) sqlInst += ", classe";
            if (client.codCep) sqlInst += ", codcep";
            if (client.regiao) sqlInst += ", regiao";
            if (client.nascimento) sqlInst += ", nascimento";

            sqlInst += util.format(") values ('%s', '%s', '%s', '%s', '%s', " +
                "'%s', '%s', '%s', '%s', '%s', '%s', %d, '1', getdate(), 'C'",
                client.nome, (client.fantasia === '' ? client.nome : client.fantasia), client.natureza,
                client.numero, client.complemento, client.email, client.ativo, client.cpf_Cnpj, client.rg_Insc_Est,
                client.observacao, client.insc_Municipal, client.cod_Funcionario);

            if (client.classe) sqlInst += ", " + client.classe;
            if (client.codCep) sqlInst += ", " + client.codCep;
            if (client.regiao) sqlInst += ", " + client.regiao;
            if (client.nascimento !== '') sqlInst += ", " + client.nascimento;

            sqlInst += ") set @codigo = scope_identity() ";
            sqlInst += "insert into fisica (pessoa, sexo, nacionalidade, estado_civil, ";
            sqlInst += "local_Trabalho, numero_Trabalho, complemento_trabalho, filiacao, data_Cadastro";

            if (client.naturalidade) sqlInst += ", naturalidade";
            if (client.codCepTrabalho) sqlInst += ", codceptrabalho";
            if (client.profissao) sqlInst += ", profissao";

            sqlInst += util.format(") values (@codigo, '%s', '%s', '%s', '%s', '%s', '%s', '%s', getdate()",
                client.sexo, client.nacionalidade, client.estado_Civil, client.local_Trabalho,
                client.numero_Trabalho, client.complemento_Trabalho, client.filiacao);

            if (client.naturalidade) sqlInst += ", " + client.naturalidade;
            if (client.codCepTrabalho) sqlInst += ", " + client.codCepTrabalho;
            if (client.profissao) sqlInst += ", " + client.profissao;

            if (client.telefone !== '') {
                sqlInst += ") insert into telefone (pessoa, tipo, telefone, contato, padrao, email) values ";
                sqlInst += util.format("(@codigo, '1', '%s', '%s', 1, '%s') ", client.telefone, client.contato, client.email);
            } else {
                sqlInst += ") ";
            }
            sqlInst += "select @codigo as codigo";

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

                        res.write('{ "codigo": ' + data[0].codigo + ' }');

                        res.end();
                    }
                });
        }
    } catch (ex) {
        res.send(ex);
    }
};

exports.updateClient = function (req, res, reqBody) {
    try {
        if (!reqBody) throw new Error("Input not valid");
        var client = reqBody;
        if (client) {
            var sqlInst = "update pessoas set nome = '" + client.nome + "', fantasia = '" + client.fantasia + "'";
            sqlInst += ", natureza = '" + client.natureza + "', numero = '" + client.numero + "', complemento = '" + client.complemento + "'";
            sqlInst += ", email = '" + client.email + "', ativo = '" + client.ativo + "', cpf_cnpj = '" + client.cpf_Cnpj + "'";
            sqlInst += ", rg_insc_est = '" + client.rg_Insc_Est + "', insc_municipal = '" + client.insc_Municipal + "'";
            sqlInst += ", observacao = '" + client.observacao + "'";

            if (client.classe) sqlInst += ", classe = " + client.classe;
            if (client.codCep) sqlInst += ", cep = " + client.codCep;
            if (client.regiao) sqlInst += ", regiao = " + client.regiao;
            if (client.nascimento) sqlInst += ", nascimento = " + client.nascimento;

            sqlInst += " where codigo = " + client.codigo;
            sqlInst += " update fisica set sexo = '" + client.sexo + "', nacionalidade = '" + client.nacionalidade + "'";
            sqlInst += ", estado_civil = '" + client.estado_Civil + "', local_Trabalho = '" + client.local_Trabalho + "'";
            sqlInst += ", numero_Trabalho = '" + client.numero_Trabalho + "', complemento_trabalho = '" + client.complemento_Trabalho + "'";
            sqlInst += ", filiacao = '" + client.filiacao + "'";

            if (client.naturalidade) sqlInst += ", naturalidade = " + client.naturalidade;
            if (client.codCepTrabalho) sqlInst += ", cep_trabalho = " + client.codCepTrabalho;
            if (client.profissao) sqlInst += ", profissao = " + client.profissao;

            sqlInst += " where pessoa = " + client.codigo;

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
        }
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
                    res.write('{ "result": "success" }');

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