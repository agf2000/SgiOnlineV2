var express = require('express');
var db = require("../core/db");

var router = express.Router();

/*router.use(function (req, res, next) {
	if (req.user.adm) {
		next();
		return;
	}
	res.redirect("/login");
});*/

/* GET sales page. */
router.get('/', function (req, res, next) {
    res.render('sales', {
        title: 'DAVs',
        css: [
            // '/vendors/bootstrap-select/dist/css/bootstrap-select.min.css',
            '/vendors/bootstrap-switch/bootstrap-switch.min.css',
            'css/pages/sales.css'
        ],
        script: [
            // '/vendors/bootstrap-select/dist/js/bootstrap-select.js',
            '/vendors/amplify/amplify.min.js',
            '/vendors/bootstrap-switch/bootstrap-switch.min.js',
            '/js/app/utilities.js',
            '/js/pages/sales.js'
        ]
    });
});

/* GET sale page. */
router.get('/novo', function (req, res, next) {
    res.render('sale', {
        title: 'DAV',
        css: [
            '/vendors/select2/dist/css/select2.min.css',
            '/vendors/bootstrap-daterangepicker/daterangepicker.css',
            '/vendors/bootstrap-dialog/css/bootstrap-dialog.min.css',
            '/vendors/bootstrap-validator/dist/css/bootstrapValidator.min.css',
            '/vendors/sweetAlert2/css/sweetalert2.min.css',
            '/css/pages/sales.css'
        ],
        script: [
            '/vendors/amplify/amplify.min.js',
            '/vendors/schrollTo/jquery.scrollTo.min.js',
            '/vendors/knockout/knockout-3.4.0.js',
            '/vendors/select2/dist/js/select2.min.js',
            '/vendors/select2/dist/js/i18n/pt-BR.js',
            '/vendors/bootstrap-daterangepicker/daterangepicker.js',
            '/vendors/typeahead/typeahead.bundle.min.js',
            '/vendors/bootstrap-dialog/js/bootstrap-dialog.min.js',
            '/vendors/jquery.inputmask/dist/min/jquery.inputmask.bundle.min.js',
            '/vendors/bootstrap-validator/dist/js/bootstrapValidator.min.js',
            '/vendors/bootstrap-validator/dist/js/language/pt_BR.js',
            '/vendors/sweetAlert2/js/sweetalert2.min.js',
            '/js/app/utilities.js',
            '/js/pages/saleViewModel.js',
            '/js/pages/sale.js'
        ]
    });
});

/* GET sale page. */
router.get('/:saleId/:sgiId', function (req, res, next) {
    try {
        var sqlInst = "select d.*, c.nome as nomecliente, c.fantasia as fantasiacliente, c.ativo, v.nome as vendedor, ";
        sqlInst += "o.cartao as operadora, e.fantasia as empresa, e.cnpj, cp.acrescimo, c.email, isnull(c.cpf_cnpj, (case when c.cpf_cnpj <> '' and c.natureza = 'F' then '1' else '2' end)) as cpf_cnpj, ";
        sqlInst += "(select top 1 telefone from telefone where pessoa = c.codigo and padrao = 1) as telefonecliente, ";
        sqlInst += "(select top 1 dbo.asstring(v.tipo_logradouro) + ': ' + dbo.asstring(v.logradouro) + ', nº' + dbo.asstring(e.num) + ' - Bairro: ' + dbo.asstring(v.bairro) + ' - ' + dbo.asstring(v.cidade) from view_endereco_completo v) as enderecoempresa, ";
        sqlInst += "dbo.fc_endereco(c.codigo, c.tipo) as enderecocliente, e.fone as telefoneempresa, ";
        sqlInst += "(convert(varchar, d.datavenda, 103)) + ' ' + (convert(varchar(5), d.datavenda, 108)) as dtvenda, ";
        sqlInst += "e.e_mail as emailEmpresa from dav_cab d cross join empresa e ";
        sqlInst += "left outer join cliente c on d.codcliente = c.codigo ";
        sqlInst += "left outer join funcionario v on v.codigo = d.codvendedor ";
        sqlInst += "left outer join CondicaoPagto cp on cp.codigo = d.codCondPagto ";
        sqlInst += "left outer join operadora o on o.codigo = d.CodOperadora ";
        sqlInst += "left outer join fisica f on f.pessoa = " + req.params.sgiId;
        sqlInst += " where d.numdav = " + req.params.saleId;
        sqlInst += " and (isnull(d.cod_funcionario, 0) = 0 or ((select top 1 1 from Usuario where adm = 1 and funcionario = " + req.params.sgiId + ") = 1 or ";
        sqlInst += "(f.supervisor = 1 and f.coddepartamento = (select top 1 coddepartamento from fisica where pessoa = d.cod_funcionario))) ";
        sqlInst += "or d.cod_funcionario = " + req.params.sgiId + "); ";
        sqlInst += "select di.codproduto, di.quantidade, p.nome, di.valorunitario, di.descontoperc, di.valortotal, ";
        sqlInst += "convert(varchar(50), cast(di.valorunitario - ((di.valorunitario * di.descontoperc) / 100) as money), -1) as valorliq ";
        sqlInst += "from dav_itens di inner join produto p on p.codigo = di.codProduto where di.numdav = " + req.params.saleId;

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    res.render('500', {
                        title: 'Erro Interno'
                    });
                } else {

                    data[0][0].saleitems = data[1];

                    var result = data[0][0];

                    result = JSON.stringify(result).replace(/"([\w]+)":/g, function ($0, $1) {
                        return ('"' + $1.toLowerCase() + '":');
                    });

                    res.render('sale', {
                        title: 'DAV ' + data[0][0].sequenciadav,
                        css: [
                            '/vendors/select2/dist/css/select2.min.css',
                            '/vendors/bootstrap-daterangepicker/daterangepicker.css',
                            '/vendors/bootstrap-dialog/css/bootstrap-dialog.min.css',
                            '/vendors/bootstrap-validator/dist/css/bootstrapValidator.min.css',
                            '/vendors/sweetAlert2/css/sweetalert2.min.css',
                            '/css/pages/sales.css'
                        ],
                        script: [
                            '/vendors/amplify/amplify.min.js',
                            '/vendors/schrollTo/jquery.scrollTo.min.js',
                            '/vendors/knockout/knockout-3.4.0.js',
                            '/vendors/select2/dist/js/select2.min.js',
                            '/vendors/select2/dist/js/i18n/pt-BR.js',
                            '/vendors/bootstrap-daterangepicker/daterangepicker.js',
                            '/vendors/typeahead/typeahead.bundle.min.js',
                            '/vendors/bootstrap-dialog/js/bootstrap-dialog.min.js',
                            '/vendors/jquery.inputmask/dist/min/jquery.inputmask.bundle.min.js',
                            '/vendors/bootstrap-validator/dist/js/bootstrapValidator.min.js',
                            '/vendors/bootstrap-validator/dist/js/language/pt_BR.js',
                            '/vendors/sweetAlert2/js/sweetalert2.min.js',
                            '/js/app/utilities.js',
                            '/js/pages/saleViewModel.js',
                            '/js/pages/sale.js'
                        ],
                        // helpers: require("handlebars-form-helpers"),
                        // helpers: {
                        //     currency: function (value) {
                        //         return "R$ " + value.toFixed(2);
                        //     },
                        //     percent: function (value) {
                        //         return "% " + value.toFixed(2);
                        //     },
                        //     decimals: function (value) {
                        //         var result = 0;
                        //         if (isNaN(value)) result = value.toFixed(2);
                        //         return result.toFixed(2);
                        //     }
                        // },
                        data: JSON.parse(result)
                    });
                }
            }, true);
    } catch (ex) {
        res.send(ex);
    };
});

/* GET sale page. */
router.get('/print/:saleId/:sgiId/:pagamentos', function (req, res, next) {
    try {
        var sqlInst = "select d.*, c.nome as nomecliente, c.fantasia as fantasiacliente, c.ativo, v.nome as vendedor, ";
        sqlInst += "o.cartao as operadora, e.fantasia as empresa, e.cnpj, cp.acrescimo, c.email, isnull(c.cpf_cnpj, (case when c.cpf_cnpj <> '' and c.natureza = 'F' then '1' else '2' end)) as cpf_cnpj, ";
        sqlInst += "('Formas de pagamento: ' + (case when " + req.params.pagamentos + " = 0 then null else ( case when valordinheiro > 0 then 'Dinheiro: R$ ' + dbo.asstring(d.valordinheiro) else '' end + ' ' + case when valorcartao > 0 then 'Cartão: R$ ' + dbo.asstring(d.valorcartao) + ' - ' + (select cartao from operadora where codigo in (select operadora from cartao where numdoc = d.numdoc))  else '' end + ' ' + case when valorcrediario > 0 then (case when d.cheque = 1 then 'Cheque: R$ ' when d.convenio = 1 then 'Convênio: R$ ' else 'Crediário: R$ ' end) + dbo.asstring(d.valorcrediario) + ' em ' + (select nome from condicaopagto where codigo = d.codcondpagto) else '' end ) end)) as pagamentos, ";
        // "o.cartao as operadora, e.fantasia as empresa, e.cnpj, cp.nome + (case when isnull(cp.acrescimo, 0) > 0 then ' (' + cast(cp.acrescimo as varchar) + '%)' end)  as condPagto, " +
        // sqlInst += "e.cep as enderecoempresa, c.cep as enderecocliente, ";
        sqlInst += "(select top 1 telefone from telefone where pessoa = c.codigo and padrao = 1) as telefonecliente, ";
        sqlInst += "(select top 1 dbo.asstring(v.tipo_logradouro) + ': ' + dbo.asstring(v.logradouro) + ', nº' + dbo.asstring(e.num) + ' - Bairro: ' + dbo.asstring(v.bairro) + ' - ' + dbo.asstring(v.cidade) from view_endereco_completo v) as enderecoempresa, ";
        sqlInst += "dbo.fc_endereco(c.codigo, c.tipo) as enderecocliente, e.fone as telefoneempresa, ";
        sqlInst += "(convert(varchar, d.datavenda, 103)) + ' ' + (convert(varchar(5), d.datavenda, 108)) as dtvenda, ";
        sqlInst += "e.e_mail as emailEmpresa from dav_cab d cross join empresa e ";
        sqlInst += "left outer join cliente c on d.codcliente = c.codigo ";
        sqlInst += "left outer join funcionario v on v.codigo = d.codvendedor ";
        sqlInst += "left outer join CondicaoPagto cp on cp.codigo = d.codCondPagto ";
        sqlInst += "left outer join operadora o on o.codigo = d.CodOperadora ";
        sqlInst += "left outer join fisica f on f.pessoa = " + req.params.sgiId;
        sqlInst += " where d.numdav = " + req.params.saleId;
        sqlInst += " and (isnull(d.cod_funcionario, 0) = 0 or ((select top 1 1 from Usuario where adm = 1 and funcionario = " + req.params.sgiId + ") = 1 or ";
        sqlInst += "(f.supervisor = 1 and f.coddepartamento = (select top 1 coddepartamento from fisica where pessoa = d.cod_funcionario))) ";
        sqlInst += "or d.cod_funcionario = " + req.params.sgiId + "); ";
        sqlInst += "select di.codproduto, di.quantidade, p.nome, di.valorunitario, di.descontoperc, di.valortotal, ";
        // sqlInst += "convert(varchar(50), CAST(di.valorunitario as money), -1) as valorunitario, ";
        // sqlInst += "convert(varchar(50), CAST(di.descontoperc as money), -1) as descontoperc, ";
        sqlInst += "convert(varchar(50), cast(di.valorunitario - ((di.valorunitario * di.descontoperc) / 100) as money), -1) as valorliq ";
        // sqlInst += "convert(varchar(50), CAST(di.valortotal as money), -1) as valortotal ";
        sqlInst += "from dav_itens di inner join produto p on p.codigo = di.codProduto where di.numdav = " + req.params.saleId;

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    res.render('500', {
                        title: '500 Erro Interno'
                    });
                } else {

                    data[0][0].saleitems = data[1];

                    var result = data[0][0];

                    result = JSON.stringify(result).replace(/"([\w]+)":/g, function ($0, $1) {
                        return ('"' + $1.toLowerCase() + '":');
                    });

                    res.render('printSale', {
                        layout: false,
                        title: 'Impressão do DAV',
                        // helpers: require("handlebars-form-helpers"),
                        // helpers: {
                        //     currency: function (value) {
                        //         return "R$ " + value.toFixed(2);
                        //     },
                        //     percent: function (value) {
                        //         return "% " + value.toFixed(2);
                        //     },
                        //     decimals: function (value) {
                        //         var result = 0;
                        //         if (isNaN(value)) result = value.toFixed(2);
                        //         return result.toFixed(2);
                        //     }
                        // },
                        data: JSON.parse(result)
                    });
                }
            }, true);
    } catch (ex) {
        res.send(ex);
    };
});

module.exports = router;