'use strict';

$(function () {

    $('[data-toggle="tooltip"]').tooltip();
    PNotify.prototype.options.styling = "bootstrap3";
    kendo.culture("pt-BR");
    kendo.culture().calendar.firstDay = 1;
    var todayDate = new Date();

    /*function rotation() {
        $('.logo-mini').transform({ rotateY: '0' });
        $('.logo-mini').animate({ rotateY: '360deg' }, 3000, 'linear', function () {
            rotation();
        });
    }
    rotation();*/

    if (my.userInfo === undefined) {
        my.userInfo = $.parseJSON(Cookies.getJSON('SGIUser').replace('j:', ''))
        /*$.get('/api/getUserInfo', function (user) {
            if (user) {
                my.userInfo = user;  

                QuickTips();              
            }
        });*/
    }

    $(".x_content").LoadingOverlay("show");

    $('#kddlConditions').kendoDropDownList();

    var orderDir = 'desc';
    var orderBy = 'Codigo';

    // Products transport
    var productsTransport = {
        read: {
            url: '/api/getProducts'
        },
        parameterMap: function (data, type) {
            var strSearch = $('.tbSearchFor input:first').val().length > 0 ? ' and ' +
                $('.selectSearchFor select:first option:selected').val() + ' ' +
                $('.selectConditions select:first option:selected').val() + " '" +
                ($('.selectConditions select:first option:selected').val() == 'like' ?
                    "%" + $('.tbSearchFor input:first').val() + "%'" :
                    $('.tbSearchFor input:first').val() + "'") : '';
            if ($('.tbSearchFor input:first').val().length > 0 && $('.tbSearchFor2 input:first').val().length > 0) {
                strSearch = ' and ' + $('.selectSearchFor select:first option:selected').val() + ' ' +
                                      $('.selectConditions select:first option:selected').val() + " '" +
                                      $('.tbSearchFor input:first').val() + "' and '" + $('.tbSearchFor2 input:first').val() + "'";
            }
            if ($('.selectSearchFor select.cloned').length > 0) {
                $.each($('.tbSearchFor input.cloned'), function (i, item) {
                    if ($('.tbSearchFor input.cloned')[i].value.length > 0 && $('.tbSearchFor2 input.cloned')[i].value.length > 0) {
                        strSearch += ($('input[type=checkbox].cloned').eq(i).is(':checked') ? ' and ' : ' or ') +
                                     $('.selectSearchFor select.cloned option:selected')[i].value + ' ' +
                                     $('.selectConditions select.cloned option:selected')[i].value + ' ' + "'" +
                                     $('.tbSearchFor input.cloned')[i].value + "' and '" + $('.tbSearchFor2 input.cloned')[i].value + "'";
                    } else if ($('.tbSearchFor input')[i].value.length > 0) {
                        strSearch += ($('input[type=checkbox].cloned').eq(i).is(':checked') ? ' and ' : ' or ') +
                                      $('.selectSearchFor select.cloned option:selected')[i].value + ' ' +
                                      $('.selectConditions select.cloned option:selected')[i].value + ' ' + "'" +
                                      ($('.selectConditions select.cloned option:selected')[i].value == 'like' ? "%" +
                                      $('.tbSearchFor input.cloned')[i].value + "%'" : $('.tbSearchFor input.cloned')[i].value + "'");
                    }
                });
            }
            orderDir = data.sort[0] ? data.sort[0].dir : 'DESC';
            orderBy = data.sort[0] ? data.sort[0].field : 'Codigo';
            switch (orderBy.toLowerCase()) {
                case 'data_cadastro':
                    orderBy = 'd.data_cadastro';
                    break;
                case 'nomecliente':
                    orderBy = 'c.nome';
                    break;
                default:

            }
            return {
                searchFor: strSearch,
                pageIndex: data.page,
                pageSize: data.pageSize,
                orderBy: orderBy,
                orderDir: orderDir
            };
        }
    };

    // Products datasource
    var productsDataSource = new kendo.data.DataSource({
        transport: productsTransport,
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
        sort: { field: "Codigo", dir: "DESC" },
        schema: {
            model: {
                id: 'Codigo',
                fields: {
                    Codigo: {
                        editable: false, nullable: false
                    },
                    DATA_ALTERACAO: {
                        type: "date", format: "{0:MM/dd/yyyy}"
                    },
                    DATA_CADASTRO: {
                        type: "date", format: "{0:dd/MM/yyyy}"
                    }
                }
            },
            total: 'total'
        }
    });

    var productsGrid = $('#productsGrid').kendoGrid({
        //autoBind: false,
        dataSource: productsDataSource,
        //height: 380,
        selectable: "row",
        change: function (e) {
            var row = this.select();
            var id = row.data("uid");
            my.uId = id;
            var dataItem = this.dataItem(row);
            if (dataItem) {
                //$('#btnEditSelected').attr({ 'disabled': false });
                //$('#btnDeleteSelected').attr({ 'disabled': false });

                //$('#tbCodigo').val(dataItem.Codigo);
                //$('#tbModulo').val(dataItem.Modulo);
                //$('#tbCliente').val(dataItem.Cliente);
                //$('#tbVersaoResolvido').val(my.formatVersion(dataItem.VersaoResolvido));
                //my.vm.programaHora(dataItem.ProgramaHora);
            }

            //if (my.admin) {
            //    $('#btnDeleteSelected').show();
            //} else {
            //    $('#btnDeleteSelected').hide();
            //}
        },
        //toolbar: kendo.template($("#tmplToolbar").html()),
        navigatable: true,
        columns: [
            {
                field: "codigo", title: "Código", width: 75, template: '#= my.padLeft(codigo, 6) #', attributes: { 'tag': "1" }
            },
            {
                field: "nome", title: "Descrição", width: 350, template: '<a href="/produtos/#= codigo #/' + orderBy + '/' + orderDir + '" target="_blank">#= nome #</a>', attributes: { 'tag': "1" }
            },
            {
                field: "nomeUnidade", title: "Unidade", width: 90, sortable: false, attributes: { 'tag': "0" }
            },
            {
                field: "referencia", title: "Ref.", width: 80, attributes: { 'tag': "1" }
            },
            {
                field: "cod_Barras", title: "Cód. Barras", width: 120, attributes: { 'tag': "1" }
            },
            {
                field: "preco", title: "Preço", format: "{0:C}", width: 100, attributes: { class: "text-right", 'tag': "1" }
            },
            {
                field: "precoAtacado", title: "Preço Atac.", format: "{0:C}", width: 110, attributes: { class: "text-right", 'tag': "1" }
            },
            {
                field: "estoque", title: "Est. Disp.", format: "{0:N3}", width: 100, attributes: { class: "text-right", 'tag': "0" }
            },
            {
                field: "estoquereservado", title: "Est. Reser.", format: "{0:N3}", width: 100, attributes: { class: "text-right", 'tag': "0" }, sortable: false
            },
            {
                field: "estoqueTotal", title: "Est. Total", template: "#: kendo.toString(estoque + estoquereservado, 'n3') #", width: 100, attributes: { class: "text-right", 'tag': "0" }, sortable: false
            }
        ],
        sortable: {
            allowUnsort: true
        },
        reorderable: true,
        resizable: true,
        //navigatable: true,
        //scrollable: true,
        //pdf: {
        //    fileName: 'Tarefas_Grid.pdf',
        //    allPages: true
        //},
        pageable: {
            pageSizes: [10, 40, 70, 100],
            refresh: true,
            numeric: false,
            input: true,
            messages: {
                display: "{0} - {1} de {2} produtos",
                empty: "Sem Registro.",
                page: "Página",
                of: "de {0}",
                itemsPerPage: "Produtos por vez",
                first: "Ir para primeira página",
                previous: "Ir para página anterior",
                next: "Ir para próxima página",
                last: "Ir para última página",
                refresh: "Recarregar"
            }
        },
        dataBound: function () {
            var grid = this;
            grid.element.find('tbody tr:first').addClass('k-state-selected');
            var selectedItem = grid.dataItem(grid.select());

            //if (selectedItem) {
            //    var row = this.select();
            //    var id = row.data("uid");
            //    my.uId = id;
            //    //$('#tbCodigo').val(selectedItem.Codigo);
            //    //$('#tbModulo').val(selectedItem.Modulo);
            //    //$('#tbCliente').val(selectedItem.Cliente);
            //    //$('#tbVersaoResolvido').val(selectedItem.versao);
            //    //$('#btnEditSelected').attr({ 'disabled': false });
            //    //my.vm.programaHora(selectedItem.ProgramaHora);

            //    //if (my.admin) {
            //    //    $('#btnEditSelected').attr({ 'disabled': false });
            //    //    $('#btnDeleteSelected').attr({ 'disabled': false });
            //    //}
            //}

            $.each(grid.dataSource.data(), function (i, item) {
                var rowSelector = ">tr:nth-child(" + (i + 1) + ")";
                var row = grid.tbody.find(rowSelector);

                if (item.Estoque < 0) {
                    row.addClass('noStock');
                }
            });

            $('#spanDateDisplay').html(moment(todayDate).format('DD/MM/YYYY'));
            $(".x_content").LoadingOverlay("hide", true);
        },
        columnMenu: {
            messages: {
                sortAscending: "Ordenar A-Z",
                sortDescending: "Ordenar Z-A",
                filter: "Filtro",
                columns: "Colunas"
            }
        }
        //editable: true
    }).data('kendoGrid');

    $(document.body).keydown(function (e) {
        if (e.altKey && e.keyCode == 71) {
            $("#productsGrid").data("kendoGrid").table.focus();
        }
    });

    var arrows = [37, 38, 39, 40];
    productsGrid.table.on("keydown", function (e) {
        if (arrows.indexOf(e.keyCode) >= 0) {
            if (e.keyCode == 38) {
                setTimeout(function () {
                    productsGrid.select($('#productsGrid').data('kendoGrid').select().prev());
                }, 1);
            }
            if (e.keyCode == 40) {
                setTimeout(function () {
                    productsGrid.select($('#productsGrid').data('kendoGrid').select().next());
                }, 1);
            }
        }
    });

    $('#divSql').kendoWindow({
        title: 'Instrução SQL',
        modal: true,
        //width: '50%',
        //height: '40%',
        visible: false
    });

    $('#btnSql').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('#divSql').data("kendoWindow").center().open();
    });

    $('#btnSendSql').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('#divSql').data("kendoWindow").close();

        productsGrid.dataSource.read();
    });

    $('#btnDoSearch').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        productsGrid.dataSource.read();
    });

    $('#btnAddFilter').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('.selectSearchFor select:first').clone().addClass('cloned').appendTo('.selectSearchFor');
        $('.selectConditions select:first').clone().addClass('cloned').appendTo('.selectConditions');
        $('.tbSearchFor input:first').clone().addClass('cloned').appendTo('.tbSearchFor').parent().find("input:last").val('');
        $('.tbSearchFor2 input:first').clone().addClass('cloned').appendTo('.tbSearchFor2').parent().find("input:last").val('');
        $('.condition input:first').clone().addClass('cloned').appendTo('.filterButtons .form-group');
        $('.filterButtons input.cloned').bootstrapSwitch();
        $('.filterButtons .bootstrap-switch-small:last').css({ 'margin-bottom': '10px' });
        $('.filterButtons .bootstrap-switch-small:last').addClass('cloned');
        $('#btnRemoveFilter').removeClass('hidden');

    });

    $('#btnRemoveFilter').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('.selectSearchFor select:last').remove();
        $('.selectConditions select:last').remove();
        $('.tbSearchFor input:last').remove();
        $('.tbSearchFor2 input:last').remove();
        $('.bootstrap-switch.cloned:last').remove();

        if ($('.selectSearchFor select').length == 1) {
            $('#btnRemoveFilter').addClass('hidden');
        }
    });

    $('#btnRemoveFilters').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('.tbSearchFor input, .tbSearchFor2 input').val('');
        $('.selectSearchFor select.cloned').remove();
        $('.selectConditions select.cloned').remove();
        $('.tbSearchFor input.cloned').remove();
        $('.tbSearchFor2 input.cloned').remove();
        $('.bootstrap-switch.cloned').remove();
        productsGrid.dataSource.read();
    });

    $.each(productsGrid.columns, function (key, value) {
        if (value.attributes.tag == '1') {
            $('.selectSearchFor select')
                .append($("<option></option>")
                .attr("value", value.field)
                .text(value.title));
        }
    });

    $('.selectSearchFor select')
        .append($("<option></option>")
        .attr("value", 'dbo.removehora(p.data_cadastro)')
        .text('Data Cadastrado'));

    //QuickTips();

    moment.locale("pt-br");
});

/*function QuickTips() {
    window.setTimeout(function () {
        if (amplify.store.sessionStorage(document.location.host + "_user_tips_" + window.location.pathname) === undefined) {
            if (amplify.store(document.location.host + "_user_tips_" + window.location.pathname) != my.userInfo.UserId) {
                $.get('/dnn/desktopmodules/sgi/api/services/GetTips', function (message) {
                    var before = message[0].Anterior;
                    var after = message[0].Proximo;
                    var notice = new PNotify({
                        title: 'Você sabia?',
                        text: message[0].Historico + '<br /><span class="text-error">Clique em desativar abaixo para não mais mostrar dicas.</span>',
                        //icon: 'glyphicon glyphicon-question-sign',
                        //hide: false,
                        confirm: {
                            confirm: true,
                            buttons: [{
                                text: '',
                                addClass: 'btn btn-link fa fa-chevron-left',
                                click: function (notice) {
                                    $.get('/dnn/desktopmodules/sgi/api/services/GetTip?cod=' + before, function (msg) {
                                        if (msg) {
                                            notice.update({
                                                text: msg.Historico
                                            });
                                            before = msg.Anterior;
                                            after = msg.Proximo;
                                        } else {
                                            notice.update({
                                                text: 'Não há mais dica'
                                            });
                                        }
                                    });
                                }
                            },
                            {
                                text: '',
                                addClass: 'btn btn-link fa fa-chevron-right',
                                click: function (notice) {
                                    $.get('/dnn/desktopmodules/sgi/api/services/GetTip?cod=' + after, function (msg) {
                                        if (msg) {
                                            notice.update({
                                                text: msg.Historico
                                            });
                                            before = msg.Anterior;
                                            after = msg.Proximo;
                                        } else {
                                            notice.update({
                                                text: 'Não há mais dica'
                                            });
                                        }
                                    });
                                }
                            },
                            {
                                text: 'Fechar',
                                addClass: 'btn btn-default btn-sm',
                                click: function (notice) {
                                    notice.remove();
                                }
                            },
                            {
                                text: 'Desativar',
                                addClass: 'btn btn-sm',
                                click: function (notice) {
                                    swal({
                                        title: 'Tem certeza?',
                                        text: 'Deseja realmente não ver mais dicas nessa tela?',
                                        type: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: 'Sim',
                                        cancelButtonText: 'Não',
                                        closeOnConfirm: true,
                                        closeOnCancel: true
                                    }).then(function (isConfirm) {
                                        if (isConfirm) {

                                            amplify.store(document.location.host + "_user_tips_" + window.location.pathname, my.userInfo.UserId);
                                            notice.remove();

                                        } else {
                                            var notice = new PNotify({
                                                title: 'Atenção!',
                                                text: 'Nada foi alterado.',
                                                type: 'warning',
                                                animation: 'none',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright
                                            });
                                            notice.get().click(function () {
                                                notice.remove();
                                            });
                                        }
                                    });
                                }
                            },
                            null]
                        },
                        buttons: {
                            closer: true,
                            sticker: false
                        },
                        history: {
                            history: false
                        },
                        hide: false,
                        type: 'info',
                        delay: 15000,
                        addclass: 'stack-topright',
                        stack: my.stack_topright
                    });
                    //notice.get().click(function () {
                    //    notice.remove();
                    //});
                });
            }

            amplify.store.sessionStorage(document.location.host + "_user_tips_" + window.location.pathname, true);
        }
    }, 3000);
}

function keepSessionAlive() {
    $.get('/dnn/desktopmodules/sgi/api/services/UserAuthenticated', function (auth) {
        if (auth) {
            console.log('renewing session with the server...');
        } else {
            $('.user-panel a').html('<i class="fa fa-circle text-danger"></i> Offline');
            $('.user-menu a span').text('OFFLINE');
            amplify.store.sessionStorage(document.location.host + "user", null);
            amplify.store.sessionStorage(document.location.host + "user_loggedin", null);
            var notice = new PNotify({
                title: 'Atenção!',
                text: 'Você não está logado no sistema.',
                type: 'error',
                animation: 'none',
                addclass: 'stack-bottomright',
                stack: my.stack_bottomright
            });
            notice.get().click(function () {
                window.location.href = 'login.html?next=' + document.location.pathname + document.location.search;
            });
            console.log('No one is logged in to the server...');
        }
    });
};*/

var getNextDay = function () {
    $(document).ajaxStart(function () { Pace.restart(); });
    todayDate.setDate(todayDate.getDate() + 1);
    $('.selectSearchFor option[value="dbo.removehora(p.data_cadastro)"]').attr('selected', 'selected');
    $('.selectConditions option[value="between"]').attr('selected', 'selected');
    $('.tbSearchFor input').val(moment(todayDate).format('DD/MM/YYYY'));
    $('.tbSearchFor2 input').val(moment(todayDate).format('DD/MM/YYYY'));
    $('#productsGrid').data('kendoGrid').dataSource.read();
    return false;
};

var getPrevDay = function () {
    $(document).ajaxStart(function () { Pace.restart(); });
    todayDate.setDate(todayDate.getDate() - 1);
    $('.selectSearchFor option[value="dbo.removehora(p.data_cadastro)"]').attr('selected', 'selected');
    $('.selectConditions option[value="between"]').attr('selected', 'selected');
    $('.tbSearchFor input').val(moment(todayDate).format('DD/MM/YYYY'));
    $('.tbSearchFor2 input').val(moment(todayDate).format('DD/MM/YYYY'));
    $('#productsGrid').data('kendoGrid').dataSource.read();
    return false;
};
