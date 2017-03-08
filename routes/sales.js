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
        css: ['/vendors/bootstrap-switch/bootstrap-switch.min.css', 'css/pages/sales.css'],
        script: ['/vendors/bootstrap-switch/bootstrap-switch.min.js', '/js/app/utilities.js', '/js/pages/sales.js']
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
            '/js/app/utilities.js',
            '/js/pages/saleViewModel.js',
            '/js/pages/sale.js'
        ]
    });
});

/* GET sale page. */
router.get('/print/:saleId/:sgiId', function (req, res, next) {
    try {
        var sqlInst = "select d.*, c.nome as nomecliente, c.fantasia as fantasiacliente, c.ativo, v.nome as vendedor, ";
        sqlInst += "o.cartao as operadora, e.fantasia as empresa, e.cnpj, isnull(cp.nome, 'dinheiro') as condpagto, cp.acrescimo, c.email, c.cpf_cnpj, ";
        // "o.cartao as operadora, e.fantasia as empresa, e.cnpj, cp.nome + (case when isnull(cp.acrescimo, 0) > 0 then ' (' + cast(cp.acrescimo as varchar) + '%)' end)  as condPagto, c.email, c.cpf_cnpj, " +
        sqlInst += "e.cep as enderecoempresa, c.cep as enderecocliente, ";
        sqlInst += "(select top 1 telefone from telefone where pessoa = c.codigo and padrao = 1) as telefonecliente, ";
        sqlInst += "(select top 1 dbo.asstring(v.tipo_logradouro) + ': ' + dbo.asstring(v.logradouro) + ', nº' + dbo.asstring(e.num) + ' - bairro: ' + dbo.asstring(v.bairro) + ' - ' + dbo.asstring(v.cidade) from view_endereco_completo v) as enderecoempresa, ";
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
        sqlInst += "select di.codproduto, di.quantidade, p.nome, ";
        sqlInst += "convert(varchar(50), CAST(di.valorunitario as money), -1) as valorunitario, ";
        sqlInst += "convert(varchar(50), CAST(di.descontoperc as money), -1) as descontoperc, ";
        sqlInst += "convert(varchar(50), cast((isnull(di.descontoperc, 0) * 100) / di.valorunitario as money), -1) as descontovalue, ";
        sqlInst += "convert(varchar(50), CAST(di.valortotal as money), -1) as valortotal ";
        sqlInst += "from dav_itens di inner join produto p on p.codigo = di.codProduto where di.numdav = " + req.params.saleId;

        db.querySql(sqlInst,
            function (data, err) {
                if (err) {
                    res.writeHead(500, "Internal Server Error", {
                        "Content-Type": "text/html"
                    });
                    res.write("<html><title>500</title><body>500: Internal Server Error. Details: " + err + "</body></html>");
                    res.end();
                } else {

                    data[0][0].saleitems = data[1];

                    var result = data[0][0];

                    // result = JSON.stringify(result).replace(/"([\w]+)":/g, function ($0, $1) {
                    //     return ('"' + $1.toLowerCase() + '":');
                    // });

                    res.render('printSale', {
                        layout: false,
                        title: 'Impressão do DAV',
                        // helpers: require("handlebars-form-helpers"),
                        data: result
                    });
                }
            }, true);
    } catch (ex) {
        res.send(ex);
    };
});

module.exports = router;