var db = require("../core/db");
var util = require("util");

exports.getSales = function (req, res, orderBy, orderDir, pageIndex, pageSize, sgiId, searchFor) {
    try {
        switch (orderBy) {
            case "nomecliente":
                orderBy = "(select nome from cliente c where c.codigo = d.codcliente)";
                break;
            case "fantasiacliente":
                orderBy = "(select fantasia from cliente c where c.codigo = d.codcliente)";
                break;
            case "Vendedor":
                orderBy = "(select nome from funcionario c where c.codigo = d.codcliente)";
                break;
            default:
                break;
        }

        // if (searchFor.indexOf("nomecliente", StringComparison.Ordinal) > 0) {
        //     searchFor = searchFor.replace("nomecliente", "(select nome from cliente c where c.codigo = d.codcliente)");
        // }

        var sqlInst = "select top(" + pageSize + ") * from (select rowid = row_number() over (order by " + orderBy + " " + orderDir + "), d.* " +
            ", nomecliente = (select nome from cliente c where c.codigo = d.codcliente) " +
            ", fantasiaCliente = (select fantasia from cliente c where c.codigo = d.codcliente) " +
            ", vendedor = (select nome from funcionario c where c.codigo = d.codcliente) " +
            ", totalrows = count(*) over() " +
            "from dav_cab d " +
            "left outer join fisica f on f.pessoa = " + sgiId +
            "where 1 = 1 " + // searchFor +
            " and (isnull(d.cod_funcionario, 0) = 0 or ((select top 1 1 from usuario where adm = 1 and funcionario = " + sgiId + ") = 1 or " +
            "(f.supervisor = 1 and f.coddepartamento = (select top 1 coddepartamento from fisica where pessoa = d.cod_funcionario))) " +
            "or d.cod_funcionario = " + sgiId + ") " +
            ") a where a.rowid > ((" + pageIndex + " - 1) * " + pageSize + "); ";
        sqlInst += "select count(*) as recordstotal from dav_cab d left outer join fisica f on f.pessoa = " + sgiId + " where 1 = 1 and ";
        sqlInst += "(isnull(d.cod_funcionario, 0) = 0 or ((select top 1 1 from usuario where adm = 1 and funcionario = " + sgiId + ") = 1 or ";
        sqlInst += "(f.supervisor = 1 and f.coddepartamento = (select top 1 coddepartamento from fisica where pessoa = d.cod_funcionario))) ";
        sqlInst += "or d.cod_funcionario = " + sgiId + ") "; // + searchFor;

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

                    res.write(JSON.stringify(result).replace(/"([\w]+)":/g, function ($0, $1) {
                        return ('"' + $1.toLowerCase() + '":');
                    }));

                    res.end();
                }
            }, true);
    } catch (ex) {
        res.send(ex);
    }
};

exports.getSaleItems = function (req, res, id) {
    try {
        var sqlInst = "select di.*, p.nome, p.estoque from dav_itens di left outer join produto p on p.codigo = di.codproduto where di.numdav = " + id

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

exports.getSale = function (req, res, saleId, sgiId) {
    try {
        var sqlInst = "select d.*, c.nome as nomecliente, c.fantasia as fantasiacliente, c.ativo, v.nome as vendedor, " +
            "o.cartao as operadora, e.fantasia as empresa, e.cnpj, cp.nome as condPagto, cp.acrescimo, c.email, c.cpf_cnpj, " +
            // "o.cartao as operadora, e.fantasia as empresa, e.cnpj, cp.nome + (case when isnull(cp.acrescimo, 0) > 0 then ' (' + cast(cp.acrescimo as varchar) + '%)' end)  as condPagto, c.email, c.cpf_cnpj, " +
            "e.cep as enderecoempresa, c.cep as enderecocliente, " +
            "(select top 1 telefone from telefone where pessoa = c.codigo and padrao = 1) as telefonecliente, " +
            "(select top 1 dbo.asstring(v.tipo_logradouro) + ': ' + dbo.asstring(v.logradouro) + ', nº' + dbo.asstring(e.num) + ' - bairro: ' + dbo.asstring(v.bairro) + ' - ' + dbo.asstring(v.cidade) from view_endereco_completo v) as enderecoempresa, " +
            "dbo.fc_endereco(c.codigo, c.tipo) as enderecocliente, e.fone as telefoneempresa, " +
            "e.e_mail as emailEmpresa from dav_cab d cross join empresa e " +
            "left outer join cliente c on d.codcliente = c.codigo " +
            "left outer join funcionario v on v.codigo = d.codvendedor " +
            "left outer join CondicaoPagto cp on cp.codigo = d.codCondPagto " +
            "left outer join operadora o on o.codigo = d.CodOperadora " +
            "left outer join fisica f on f.pessoa = " + sgiId +
            " where d.numdav = " + saleId +
            " and (isnull(d.cod_funcionario, 0) = 0 or ((select top 1 1 from Usuario where adm = 1 and funcionario = " + sgiId + ") = 1 or " +
            "(f.supervisor = 1 and f.coddepartamento = (select top 1 coddepartamento from fisica where pessoa = d.cod_funcionario))) " +
            "or d.cod_funcionario = " + sgiId + ")";

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

exports.addSale = function (req, res, reqBody) {
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

exports.updateSale = function (req, res, reqBody) {
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

exports.removeSale = function (req, res, id) {
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