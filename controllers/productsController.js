var db = require("../core/db");

exports.getProducts = function (req, res, orderBy, orderDir, pageIndex, pageSize, searchFor) {

    switch (orderBy) {
        case 'Referencia':
            orderBy = "(select top (1) referencia from produtofornecedor where (produto = p.codigo) and (principal = 1))";
            break;
        case 'NomeUnidade':
            orderBy = "(select top (1) nome from unidade where codigo = p.unidade)";
            break;
        case 'PrecoAtacado':
            orderBy = "cast(dbo.isnegative(cast(isnull([preco] - (select top (1) descontoporquant from dbo.parametros_produto as pp " +
                "where (codproduto = p.codigo)) * dbo.fc_divisao_por_zero(preco) / 100, 0) as decimal(18, 6)), 0) as decimal(18, 6))";
            break;
        case 'EstoqueReservado':
            orderBy = "isnull((select top (1) sum(er.reservado) from dbo.estoquereservado er where (er.codproduto = p.codigo)), 0)";
            break;
        case 'EstoqueTotal':
            orderBy = "(p.estoque - isnull((select top (1) sum(er.reservado) from dbo.estoquereservado er where (er.codproduto = p.codigo)), 0))";
            break;
        default:
            break;
    };

    var sqlInst = "select top (" + pageSize + ") * from (select rowid = row_number() over (order by " + orderBy + " " + orderDir + "), " +
        "p.codigo, p.nome, p.cod_barras, p.estoque, p.tipo, p.preco, p.unidadedivisora, p.descrevenda, p.estoquereservado, p.precoatacado, " +
        "p.referência as referencia, p.promocaoAtivo, p.promocaoQtdeRestante, " +
        "totalrows = count(*) over() from view_produto p where 1 = 1 " + searchFor +
        ") a where a.rowid > ((" + pageIndex + " - 1) * " + pageSize + ")";

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
                res.write(JSON.stringify(data));

                res.end();
            }
        });
};

exports.getProduct = function (req, res, id, orderBy, orderDir) {

    if (orderBy == "referencia")
    {
        orderBy = "p.referência";
    }

    var sqlInst = "select p.codigo, p.nome, p.cod_barras, p.estoque, p.tipo, p.preco, p.desc_compl, p.estoquereservado, p.precoatacado, p.descrevenda, " +
        "cast(dbo.isnegative(cast(isnull(preco - (select descontoporquant from dbo.parametros_produto as pp where (codproduto = p.codigo)) * dbo.fc_divisao_por_zero(preco) / 100, 0) as decimal(18, 6)), 0) as decimal(18, 6)) as precoatacado, " +
        "isnull((select sum(er.reservado) from dbo.estoquereservado er where (er.codproduto = p.codigo)), 0) as estoquereservado, p.promocaoativo, " +
        "(select top (1) nome from unidade where codigo = p.unidade) as nomeunidade, p.referência as referencia, p.promocaoqtderestante, " +
        "(select top 1 codigo from Produto where " + orderBy + " " + (orderDir == "asc" ? "<" : ">") + " p." + orderBy + " order by " + orderBy + (orderDir == "desc" ? "" : " desc") + ") as anterior, " +
        "(select top 1 codigo from Produto where " + orderBy + " " + (orderDir == "asc" ? ">" : "<") + " p." + orderBy + " order by " + orderBy + (orderDir == "desc" ? " desc" : "") + ") as proximo " +
        "from view_produto p where codigo = " + id;

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
                res.write(JSON.stringify(data));

                res.end();
            }
        });
};