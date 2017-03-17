'use strict';

$(function () {

    $(".x_content").LoadingOverlay("show");

    $('[data-toggle="tooltip"]').tooltip();
    PNotify.prototype.options.styling = "bootstrap3";
    kendo.culture('pt-BR');
    kendo.culture().calendar.firstDay = 1;
    my.today = new Date();

    // var register = my.getQuerystring('novo', my.getStringParameterByName('cadastro'));
    // my.saleId = my.getQuerystring('numDav', my.getStringParameterByName('numDav'));

    my.userInfo = Cookies.getJSON('SGIUser');

    $('.condition input').bootstrapSwitch();

    $('#tbSearchFor').keyup(function (e) {
        if (e.keyCode === 13) {
            $('#btnRecarregar').click();
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

        //clientsGrid.dataSource.read();
    });

    $('#btnDoSearch').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        salesGrid.dataSource.read();
    });

    function detailInit(e) {
        var detailRow = e.detailRow;

        //detailRow.find(".tabstrip").kendoTabStrip({
        //    animation: {
        //        open: { effects: "fadeIn" }
        //    }
        //});

        detailRow.find(".saleItemsGrid").kendoGrid({
            dataSource: {
                transport: {
                    read: {
                        url: "/api/GetSaleItems"
                    },
                    parameterMap: function (data, type) {
                        return {
                            saleId: e.data.numdav
                        };
                    }
                }
            },
            pageable: false,
            columns: [{
                    field: "codproduto",
                    title: "Cód.",
                    width: 70,
                    template: '#= my.padLeft((codproduto || "0"), 6) #'
                },
                {
                    field: "nome",
                    title: "Produto"
                },
                {
                    field: "quantidade",
                    title: "Qtde",
                    width: 70
                },
                {
                    field: "valorunitario",
                    title: "Valor Unit.",
                    width: 90,
                    format: '{0:C}'
                },
                {
                    field: "descontoperc",
                    title: "Desc.:",
                    width: 90,
                    format: '{0:P2}'
                },
                {
                    field: "valortotal",
                    title: "Valor Total",
                    width: 90,
                    format: '{0:C}'
                }
            ]
        });

        $(".saleItemsGrid th").css("font-weight", "bold");
    }

    // Sales transport
    var salesTransport = {
        read: {
            url: '/api/getSales'
        },
        parameterMap: function (data, type) {
            var strSearch = $('.tbSearchFor input:first').val().length > 0 ? ' and ' +
                $('.selectSearchFor select:first option:selected').val() + ' ' +
                $('.selectConditions select:first option:selected').val() + " '" +
                ($('.selectConditions select:first option:selected').val() == 'like' ?
                    "%" + $('.tbSearchFor input:first').val() + "%'" :
                    $('.tbSearchFor input:first').val() + "'") : " and convert(varchar, d.data_cadastro, 103) = '" + moment(my.today).format('DD/MM/YYYY') + "' ";
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

            // var retyd = /(today|yesterday|\d{1,2}\/\d{1,2}\/\d{4})/g;
            // var aDate = strSearch.match(retyd)[0];
            // var bDate = strSearch.match(retyd)[1];

            // if (aDate) {
            //     var theDate1 = new Date(aDate).toLocaleDateString("en-US");
            //     if (theDate1.getMonth) {
            //         aDate = "'" + aDate + "'";
            //         strSearch = strSearch.replace(aDate, "convert(varchar, cast(" + moment(aDate).format('MM/DD/YYYY') + " as datetime), 103) ");
            //         if ($('.tbSearchFor input').val().length) $('.tbSearchFor input').val(moment(my.today).format('DD/MM/YYYY'));
            //     }
            // }

            // if (bDate) {
            //     var theDate2 = new Date(bDate).toLocaleDateString("en-US");
            //     if (theDate2.getMonth) {
            //         bDate = "'" + bDate + "'";
            //         strSearch = strSearch.replace(bDate, "convert(varchar, cast(" + moment(bDate).format('MM/DD/YYYY') + " as datetime), 103) ");
            //         if ($('.tbSearchFor input').val().length) $('.tbSearchFor input').val(moment(my.today).format('DD/MM/YYYY'));
            //     }
            // }

            var orderBy = data.sort[0] ? data.sort[0].field : 'NumDav';
            if (orderBy.toLowerCase() === 'data_cadastro') {
                orderBy = 'd.data_cadastro';
            }

            return {
                sgiId: my.userInfo.sgiid,
                searchFor: strSearch,
                pageIndex: data.page,
                pageSize: data.pageSize,
                orderBy: orderBy,
                orderDir: data.sort[0] ? data.sort[0].dir : 'DESC'
            };
        }
    };

    // Sales datasource
    var salesDataSource = new kendo.data.DataSource({
        transport: salesTransport,
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
        sort: {
            field: "numdav",
            dir: "desc"
        },
        schema: {
            model: {
                id: 'numdav',
                fields: {
                    numdav: {
                        editable: false,
                        nullable: false
                    },
                    data_alteracao: {
                        type: "date",
                        format: "{0:MM/dd/yyyy}"
                    },
                    data_cadastro: {
                        type: "date",
                        format: "{0:dd/MM/yyyy}"
                    }
                }
            },
            data: 'data',
            total: 'recordstotal'
        }
    });

    var salesGrid = $('#salesGrid').kendoGrid({
        // autoBind: false,
        dataSource: salesDataSource,
        //height: 380,
        toolbar: kendo.template($("#tollbarTmpl").html()),
        detailTemplate: kendo.template($("#tmplSaleDetail").html()),
        detailInit: detailInit,
        selectable: "row",
        change: function (e) {
            var row = this;
            var selected = row.select();
            var id = selected.data("uid");
            my.uId = id;
            var dataItem = this.dataItem(selected);
            if (dataItem) {
                $('#btnEditSelected').removeProp('disabled');
                //$('#btnDeleteSelected').removeProp('disabled');
                $('#btnConvertSelected').removeProp('disabled');
                $('#btnPrintSelected').removeProp('disabled');
                $('#btnCancelSelected').removeProp('disabled');
            }

            if (dataItem.Status == 1 || dataItem.Status == 3) {
                //$('#btnDeleteSelected').attr({ 'disabled': false });
                $('#btnCancelSelected').attr({
                    'disabled': false
                });
            } else {
                //$('#btnDeleteSelected').attr({ 'disabled': true });
                $('#btnCancelSelected').attr({
                    'disabled': true
                });
            }
        },
        navigatable: true,
        columns: [{
                field: "sequenciadav",
                title: "DAV",
                width: 50,
                template: '#= my.padLeft((sequenciadav || "0"), 6) #',
                attributes: {
                    'tag': "1"
                }
            },
            {
                field: "numdoc",
                title: "Venda",
                width: 55,
                template: '#= numdoc > 0 ? my.padLeft((numdoc || "0"), 6) : "" #',
                attributes: {
                    'tag': "1"
                }
            },
            {
                field: "codcliente",
                title: "Cliente (Código)",
                width: 220,
                hidden: true,
                attributes: {
                    'tag': "1"
                }
            },
            {
                field: "nomecliente",
                title: "Cliente (Razão Social)",
                width: 220,
                attributes: {
                    'tag': "1"
                }
            },
            {
                field: "valortotal",
                title: "Valor Total",
                width: 65,
                template: '#= "R$ " + valortotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) #',
                attributes: {
                    'tag': "1",
                    class: "text-right"
                },
                headerAttributes: {
                    style: "text-align:right"
                }
            },
            {
                field: "data_cadastro",
                title: "Dt. Cadastro",
                width: 75,
                format: '{0:dd/MM/yyyy HH:mm}',
                attributes: {
                    'tag': "1"
                }
            },
            {
                field: "nomestatus",
                title: "Status",
                width: 100,
                attributes: {
                    'tag': "1"
                },
                template: '<span> #= (nomestatus || "EM ANDAMENTO") # </span>'
            },
            {
                field: "tipo_dav",
                title: "Tipo",
                width: 85,
                attributes: {
                    'tag': "1"
                }
            }
        ],
        sortable: {
            allowUnsort: true
        },
        reorderable: true,
        resizable: true,
        pageable: {
            pageSizes: [10, 40, 70, 100],
            refresh: true,
            numeric: false,
            input: true,
            messages: {
                display: "{0} - {1} de {2} DAVs",
                empty: "Sem Registro.",
                page: "Página",
                of: "de {0}",
                itemsPerPage: "DAVs por vez",
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

            if (selectedItem) {
                var row = this.select();
                var id = row.data("uid");
                my.uId = id;

                //if (my.admin || (selectedItem.Cod_Funcionario == 0 || selectedItem.Cod_Funcionario == my.userInfo.SGIID)) {
                //    $('#btnEditSelected').attr({ 'disabled': false });
                //    $('#btnDeleteSelected').attr({ 'disabled': false });
                //}

                if (selectedItem.Status === 4 || selectedItem.Status === 7) {
                    $('#btnConvertSelected').attr({
                        'disabled': true
                    });
                    $('#btnPrintSelected').attr({
                        'disabled': true
                    });
                    $('#btnCancelSelected').attr({
                        'disabled': true
                    });
                    row.addClass('noStock');
                } else {
                    $('#btnConvertSelected').attr({
                        'disabled': false
                    });
                    $('#btnPrintSelected').attr({
                        'disabled': false
                    });
                    $('#btnCancelSelected').attr({
                        'disabled': false
                    });
                }
            }

            $.each(grid.dataSource.data(), function (i, item) {
                var rowSelector = ">tr:nth-child(" + (i + 1) + ")";
                var row = grid.tbody.find(rowSelector);

                if (item.Status === 4 || item.Status === 7) {
                    //$('#btnConvertSelected').attr({ 'disabled': true });
                    //$('#btnPrintSelected').attr({ 'disabled': true });
                    $('#btnCancelSelected').attr({
                        'disabled': true
                    });
                    row.addClass('noStock');
                } else {
                    //$('#btnConvertSelected').attr({ 'disabled': false });
                    //$('#btnPrintSelected').attr({ 'disabled': false });
                    $('#btnCancelSelected').attr({
                        'disabled': false
                    });
                }
            });

            $('#spanDateDisplay').html(moment(my.today).format('DD/MM/YYYY'));
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
    }).data('kendoGrid');

    $(document.body).keydown(function (e) {
        if (e.altKey && e.keyCode == 71) {
            $("#salesGrid").data("kendoGrid").table.focus();
        }
    });

    var arrows = [37, 38, 39, 40];
    salesGrid.table.on("keydown", function (e) {
        if (arrows.indexOf(e.keyCode) >= 0) {
            if (e.keyCode == 38) {
                window.setTimeout(function () {
                    salesGrid.select($('#salesGrid').data('kendoGrid').select().prev());
                }, 1);
            }
            if (e.keyCode == 40) {
                window.setTimeout(function () {
                    salesGrid.select($('#salesGrid').data('kendoGrid').select().next());
                }, 1);
            }
        }
    });

    $("#salesGrid").delegate("tbody > tr", "dblclick", function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('#btnEditSelected').click();
    });

    $('#btnPrintSelected').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        var grid = $('#salesGrid').data("kendoGrid");
        var dataItem = grid.dataSource.getByUid(my.uId);

        window.open('/davs/print/' + dataItem.numdav + '/' + (dataItem.cod_funcionario ? dataItem.cod_funcionario : '0') + '/1');
    });

    $('#btnConvertSelected').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        var $this = $(this);
        $this.prop('disabled', true);

        var grid = $('#salesGrid').data("kendoGrid");
        var dataItem = grid.dataSource.getByUid(my.uId);

        $.getJSON('/dnn/desktopmodules/sgi/api/sales/ConvertSaleSGIValidation?saleId=' + dataItem.NumDav, function (result) {
            if (result) {
                if (result === 1 && (my.userInfo.Adm && amplify.store.sessionStorage(document.location.host + document.location.pathname + document.location.search) !== undefined)) {
                    convertSale();
                } else {
                    var notice = new PNotify({
                        title: 'Atenção!',
                        text: 'Somente o administrador pode converter DAV em venda.',
                        type: 'error',
                        animation: 'none',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright
                    });
                    notice.get().click(function () {
                        notice.remove();
                    });

                    BootstrapDialog.show({
                        title: 'Autorização',
                        message: $('<div></div>').load('/templates/validationForm.html'),
                        onshown: function () {
                            $('#txtPassword').keyup(function (e) {
                                if (e.keyCode === 13) {
                                    $('.bootstrap-dialog').find('.btn-primary').click();
                                }
                            });
                        },
                        buttons: [{
                            label: 'Fechar',
                            cssClass: 'btn-default btn-flat',
                            action: function (dialogRef) {
                                dialogRef.close();
                            }
                        }, {
                            label: 'Prosseguir',
                            cssClass: 'btn-primary btn-flat',
                            action: function (dialog) {

                                var $button = this;
                                $button.disable();
                                $button.spin();
                                dialog.setClosable(false);

                                var params = {
                                    PortalId: 0,
                                    Username: $('#txtLogin').val(),
                                    Password: $('#txtPassword').val()
                                };

                                $.ajax({
                                    type: 'POST',
                                    url: '/dnn/desktopmodules/sgi/api/services/ValidateSGIUser',
                                    data: params
                                }).done(function (data) {
                                    if (data.Result.indexOf("success") !== -1) {
                                        if (data.User.Adm) {
                                            var notice2 = new PNotify({
                                                title: 'Sucesso!',
                                                text: 'Permissão concedida',
                                                type: 'success',
                                                animation: 'none',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright
                                            });
                                            notice2.get().click(function () {
                                                notice2.remove();
                                            });

                                            $('.bootstrap-dialog').modal('hide');

                                            if ($('#lg_once').is(':checked')) {
                                                amplify.store.sessionStorage(document.location.host + document.location.pathname + document.location.search, true);
                                            }

                                            convertSale();
                                        } else {
                                            var notice3 = new PNotify({
                                                title: 'Erro!',
                                                text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                type: 'warning',
                                                animation: 'none',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright
                                            });
                                            notice3.get().click(function () {
                                                notice3.remove();
                                            });
                                        }
                                    } else {
                                        var notice4 = new PNotify({
                                            title: 'Erro!',
                                            text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                            type: 'error',
                                            animation: 'none',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright
                                        });
                                        notice4.get().click(function () {
                                            notice4.remove();
                                        });
                                    }

                                }).fail(function (jqXHR, textStatus) {
                                    console.log(jqXHR.responseText);
                                    var notice5 = new PNotify({
                                        title: 'Atenção!',
                                        text: 'Erro ao tentar completar a ação.',
                                        type: 'error',
                                        animation: 'none',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright
                                    });
                                    notice5.get().click(function () {
                                        notice5.remove();
                                    });
                                }).always(function () {
                                    $button.enable();
                                    $button.stopSpin();
                                    dialog.setClosable(true);
                                });
                            }
                        }]
                    });
                }
            } else {
                var notice6 = new PNotify({
                    title: 'Conversão cancelada!',
                    text: 'Não foi possível converter o DAV.<br />' + (result.Msg !== undefined ? result.Msg : ''),
                    type: 'error',
                    animation: 'none',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright
                });
                notice6.get().click(function () {
                    notice6.remove();
                });
            }
            $this.prop('disabled', false);
        });
    });

    $('#btnCancelSelected').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        var grid = $('#salesGrid').data("kendoGrid");
        var dataItem = grid.dataSource.getByUid(my.uId);

        if (dataItem.status == 1 || dataItem.status == 3) {
            if (dataItem.cod_funcionario === my.userInfo.sgiid) {
                $.getJSON('/dnn/desktopmodules/sgi/api/sales/CancelSGISaleValidation?saleId=' + dataItem.numdav, function (result) {
                    if (result) {
                        if (result) {
                            cancelSale();
                        } else {
                            var notice = new PNotify({
                                title: 'Atenção!',
                                text: 'Não foi possível cancelar o DAV.',
                                type: 'error',
                                animation: 'none',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright
                            });
                            notice.get().click(function () {
                                notice.remove();
                            });
                        }
                    } else {
                        var notice1 = new PNotify({
                            title: 'Atenção!',
                            text: 'Não foi possível cancelar o DAV.',
                            type: 'error',
                            animation: 'none',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright
                        });
                        notice1.get().click(function () {
                            notice1.remove();
                        });
                    }
                });
            } else {
                if (!my.userInfo.adm) {
                    var notice2 = new PNotify({
                        title: 'Atenção!',
                        text: 'Somente o administrador pode cancelar este DAV.',
                        type: 'error',
                        animation: 'none',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright
                    });
                    notice2.get().click(function () {
                        notice2.remove();
                    });

                    BootstrapDialog.show({
                        title: 'Autorização',
                        message: $('<div></div>').load('/templates/validationForm.html'),
                        onshown: function () {
                            $('#txtPassword').keyup(function (e) {
                                if (e.keyCode === 13) {
                                    $('.bootstrap-dialog').find('.btn-primary').click();
                                }
                            });
                        },
                        buttons: [{
                            label: 'Fechar',
                            cssClass: 'btn-default btn-flat',
                            action: function (dialogRef) {
                                dialogRef.close();
                            }
                        }, {
                            label: 'Prosseguir',
                            cssClass: 'btn-primary btn-flat',
                            action: function (dialog) {

                                var $button = this;
                                $button.disable();
                                $button.spin();
                                dialog.setClosable(false);

                                var params = {
                                    PortalId: 0,
                                    Username: $('#txtLogin').val(),
                                    Password: $('#txtPassword').val()
                                };

                                $.ajax({
                                    type: 'POST',
                                    url: '/dnn/desktopmodules/sgi/api/services/ValidateSGIUser',
                                    data: params
                                }).done(function (data) {
                                    if (data.Result.indexOf("success") !== -1) {
                                        if (data.User.Adm) {
                                            var notice3 = new PNotify({
                                                title: 'Sucesso!',
                                                text: 'Permissão concedida',
                                                type: 'success',
                                                animation: 'none',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright
                                            });
                                            notice3.get().click(function () {
                                                notice3.remove();
                                            });

                                            $('.bootstrap-dialog').modal('hide');

                                            if ($('#lg_once').is(':checked')) {
                                                amplify.store.sessionStorage(document.location.host + document.location.pathname + document.location.search, true);
                                            }

                                            cancelSale();
                                        } else {
                                            var notice4 = new PNotify({
                                                title: 'Erro!',
                                                text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                type: 'warning',
                                                animation: 'none',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright
                                            });
                                            notice4.get().click(function () {
                                                notice4.remove();
                                            });
                                        }
                                    } else {
                                        var notice5 = new PNotify({
                                            title: 'Erro!',
                                            text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                            type: 'error',
                                            animation: 'none',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright
                                        });
                                        notice5.get().click(function () {
                                            notice5.remove();
                                        });
                                    }

                                }).fail(function (jqXHR, textStatus) {
                                    console.log(jqXHR.responseText);
                                    var notice6 = new PNotify({
                                        title: 'Atenção!',
                                        text: 'Erro ao tentar completar a ação.',
                                        type: 'error',
                                        animation: 'none',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright
                                    });
                                    notice6.get().click(function () {
                                        notice6.remove();
                                    });
                                }).always(function () {
                                    $button.enable();
                                    $button.stopSpin();
                                    dialog.setClosable(true);
                                });
                            }
                        }]
                    });
                }
            }
        } else {
            var notice = new PNotify({
                title: 'Atenção!',
                text: 'Este DAV não pode ser cancelado.',
                type: 'error',
                animation: 'none',
                addclass: 'stack-bottomright',
                stack: my.stack_bottomright
            });
            notice.get().click(function () {
                notice.remove();
            });
        }
    });

    $('#kddlConditions').kendoDropDownList();

    $('#btnAdd').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        window.location.href = '/venda.html';
    });

    $('#btnEditSelected').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        var grid = $('#salesGrid').data("kendoGrid");
        var dataItem = grid.dataSource.getByUid(my.uId);

        window.location.href = '/davs/' + dataItem.numdav + '/' + (dataItem.cod_funcionario || 0);
    });

    $('#btnAddFilter').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('.selectSearchFor select:first').clone().addClass('cloned').appendTo('.selectSearchFor');
        // $('.selectSearchFor').clone().find('.bootstrap-select:first').replaceWith(function () {
        //     return $('select', this);
        // }).appendTo('.selectSearchFor');
        $('.selectConditions select:first').clone().addClass('cloned').appendTo('.selectConditions');
        // $('.selectConditions').clone().find('.bootstrap-select:first').replaceWith(function () {
        //     return $('select', this);
        // }).appendTo('.selectConditions');
        $('.tbSearchFor input:first').clone().addClass('cloned').appendTo('.tbSearchFor').parent().find("input:last").val('');
        $('.tbSearchFor2 input:first').clone().addClass('cloned').appendTo('.tbSearchFor2').parent().find("input:last").val('');
        $('.condition input:first').clone().addClass('cloned').appendTo('.filterButtons .form-group');
        $('.filterButtons input.cloned').bootstrapSwitch();
        $('.filterButtons .bootstrap-switch-small:last').css({
            'margin-bottom': '10px'
        });
        $('.filterButtons .bootstrap-switch-small:last').addClass('cloned');
        $('#btnRemoveFilter').removeClass('hidden');
    });

    $('#btnRemoveFilter').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('.selectSearchFor select:last').remove();
        // $('.selectSearchFor').find('.bootstrap-select:last').remove();
        $('.selectConditions select:last').remove();
        // $('.selectConditions').find('.bootstrap-select:last').remove();
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
        salesGrid.dataSource.read();
    });

    $.each(salesGrid.columns, function (key, value) {
        if (value.attributes.tag == '1') {
            if (value.field.toLowerCase() == 'data_cadastro') {
                value.field = 'convert(varchar, d.data_cadastro, 103)';
                value.title = 'Data Cadastrado';
            }
            $('.selectSearchFor select')
                .append($("<option></option>")
                    .attr("value", value.field)
                    .text(value.title));
        }
    });

    $('.btnReturn').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        my.vm.selectedProducts.removeAll();
        history.pushState("", document.title, window.location.pathname); //  + window.location.search);
        salesDataSource.read();
        $('#divSales').show();
        $('#divSaleForm').fadeOut();
    });

    moment.locale("pt-br");
});

function convertSale() {

    var grid = $('#salesGrid').data("kendoGrid");
    var dataItem = grid.dataSource.getByUid(my.uId);

    $.ajax({
        type: 'POST',
        url: '/dnn/desktopmodules/sgi/api/sales/ConvertSGISale?saleId=' + dataItem.NumDav
    }).done(function (data) {
        if (data.Result.indexOf("success") !== -1) {
            var notice = new PNotify({
                title: 'Sucesso!',
                text: 'DAV convertido em venda (' + data.NumDoc + ').',
                type: 'success',
                animation: 'none',
                addclass: 'stack-bottomright',
                stack: my.stack_bottomright
            });
            notice.get().click(function () {
                notice.remove();
            });

            dataItem.set('NumDoc', data.NumDoc);
            dataItem.set('Status', 5);
            dataItem.set('NomeStatus', 'AGUARDANDO EMISSÃO');
        } else {
            var notice1 = new PNotify({
                title: 'Erro!',
                text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                type: 'error',
                animation: 'none',
                addclass: 'stack-bottomright',
                stack: my.stack_bottomright
            });
            notice1.get().click(function () {
                notice1.remove();
            });
        }
    }).fail(function (jqXHR, textStatus) {
        console.log(jqXHR.responseText);
        var notice2 = new PNotify({
            title: 'Atenção!',
            text: 'Erro ao tentar completar a ação.',
            type: 'error',
            animation: 'none',
            addclass: 'stack-bottomright',
            stack: my.stack_bottomright
        });
        notice2.get().click(function () {
            notice2.remove();
        });
    });
}

function cancelSale() {

    var grid = $('#salesGrid').data("kendoGrid");
    var dataItem = grid.dataSource.getByUid(my.uId);

    swal({
        title: 'Tem certeza?',
        text: 'Deseja realmente cancelar o DAV?',
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        closeOnConfirm: true,
        closeOnCancel: true
    }).then(function (isConfirm) {
        if (isConfirm) {
            $.ajax({
                type: 'POST',
                url: '/dnn/desktopmodules/sgi/api/sales/CancelSGISale?saleId=' + dataItem.NumDav
            }).done(function (data) {
                if (data.Result.indexOf("success") !== -1) {
                    var notice = new PNotify({
                        title: 'Sucesso!',
                        text: 'DAV cancelado.',
                        type: 'success',
                        animation: 'none',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright
                    });
                    notice.get().click(function () {
                        notice.remove();
                    });

                    dataItem.set('Status', 7);
                    dataItem.set('NomeStatus', 'Cancelado Manual');

                } else {
                    $('#btnAddProduct').prop('disabled', true);
                    var notice1 = new PNotify({
                        title: 'Erro!',
                        text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                        type: 'error',
                        animation: 'none',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright
                    });
                    notice1.get().click(function () {
                        notice1.remove();
                    });
                }

            }).fail(function (jqXHR, textStatus) {
                console.log(jqXHR.responseText);
                var notice2 = new PNotify({
                    title: 'Atenção!',
                    text: 'Erro ao tentar completar a ação.',
                    type: 'error',
                    animation: 'none',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright
                });
                notice2.get().click(function () {
                    notice2.remove();
                });
                //}).always(function () {
            });
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

var getNextDay = function () {
    $(document).ajaxStart(function () {
        Pace.restart();
    });
    my.today.setDate(my.today.getDate() + 1);
    $('.selectSearchFor option[value="convert(varchar, d.data_cadastro, 103)"]').attr('selected', true).change();
    // $('.selectSearchFor').selectpicker('refresh');
    $('.selectConditions option[value="between"]').attr('selected', true).change();
    // $('.selectConditions').selectpicker('refresh');
    // $('.selectConditions').selectpicker('val', 'between');
    $('.tbSearchFor input').val(moment(my.today).format('DD/MM/YYYY'));
    $('.tbSearchFor2 input').val(moment(my.today).format('DD/MM/YYYY'));
    $('#salesGrid').data('kendoGrid').dataSource.read();
    return false;
};

var getPrevDay = function () {
    $(document).ajaxStart(function () {
        Pace.restart();
    });
    my.today.setDate(my.today.getDate() - 1);
    $('.selectSearchFor option[value="convert(varchar, d.data_cadastro, 103)"]').attr('selected', true).change();
    // $('.selectSearchFor').selectpicker('refresh');
    $('.selectConditions option[value="between"]').attr('selected', true).change();
    // $('.selectConditions').selectpicker('refresh');
    // $('.selectConditions').selectpicker('val', 'between');
    $('.tbSearchFor input').val(moment(my.today).format('DD/MM/YYYY'));
    $('.tbSearchFor2 input').val(moment(my.today).format('DD/MM/YYYY'));
    $('#salesGrid').data('kendoGrid').dataSource.read();
    return false;
};

function toggleFullScreen(e) {
    if ((document.fullScreenElement && document.fullScreenElement !== null) ||
        (!document.mozFullScreen && !document.webkitIsFullScreen)) {
        if (document.documentElement.requestFullScreen) {
            document.documentElement.requestFullScreen();
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
        $(e.target).removeClass('glyphicon-fullscreen');
        $(e.target).addClass('glyphicon-fullscreen');
    } else {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        }
    }
}