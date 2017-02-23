'use strict';

$(function () {

    $('[data-toggle="tooltip"]').tooltip();
    PNotify.prototype.options.styling = "bootstrap3";
    kendo.culture("pt-BR");
    kendo.culture().calendar.firstDay = 1;
    my.today = new Date();

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

    $('#kddlConditions').kendoDropDownList();

    var orderDir = 'desc';
    var orderBy = 'codigo';

    // Clients transport
    var clientsTransport = {
        read: {
            url: '/api/getClients'
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
            return {
                searchFor: strSearch,
                pageIndex: data.page,
                pageSize: data.pageSize,
                orderBy: data.sort[0] ? data.sort[0].field : 'codigo',
                orderDir: data.sort[0] ? data.sort[0].dir : 'desc'
            };
        }
    };

    // clients datasource
    var clientsDataSource = new kendo.data.DataSource({
        transport: clientsTransport,
        pageSize: 10,
        serverPaging: true,
        serverSorting: true,
        serverFiltering: true,
        sort: {
            field: "codigo",
            dir: "desc"
        },
        schema: {
            model: {
                id: 'codigo',
                fields: {
                    codigo: {
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
            total: 'recordsTotal'
        }
    });

    var clientsGrid = $('#clientsGrid').kendoGrid({
        //autoBind: false,
        dataSource: clientsDataSource,
        //height: 380,
        selectable: "row",
        change: function (e) {
            var row = this.select();
            var id = row.data("uid");
            my.uId = id;
            var dataItem = this.dataItem(row);
            if (dataItem) {
                $('#btnEditSelected').attr({
                    'disabled': false
                });
                $('#btnDeleteSelected').attr({
                    'disabled': false
                });
            }

            if (my.admin || (dataItem.Cod_Funcionario == 0 || dataItem.Cod_Funcionario == my.userInfo.sgiid)) {
                $('#btnDeleteSelected').attr({
                    'disabled': false
                });
            } else {
                $('#btnDeleteSelected').attr({
                    'disabled': true
                });
            }
        },
        toolbar: kendo.template($("#tollbarTmpl").html()),
        navigatable: true,
        columns: [{
                field: "codigo",
                title: "Cód.",
                width: 75,
                template: '#= my.padLeft(codigo, 6) #'
            },
            {
                field: "fantasia",
                title: "Fantasia",
                width: 200
            },
            {
                field: "telefone",
                title: "Tel. Principal",
                width: 120
            },
            {
                field: "contato",
                title: "Contato",
                width: 100
            },
            {
                field: "cpf_cnpj",
                title: "CPF/CNPJ",
                width: 130
            },
            {
                field: "nome",
                title: "Razão Social",
                width: 200
            },
            {
                field: "enderecocompleto",
                title: "Endereço",
                width: 450,
                sortable: false
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
                display: "{0} - {1} de {2} clientes",
                empty: "Sem Registro.",
                page: "Página",
                of: "de {0}",
                itemsPerPage: "Clientes por vez",
                first: "Ir para primeira página",
                previous: "Ir para página anterior",
                next: "Ir para próxima página",
                last: "Ir para última página",
                refresh: "Recarregar"
            }
        },
        dataBound: function () {
            $('#btnEditSelected').attr({
                'disabled': true
            });
            $('#btnDeleteSelected').attr({
                'disabled': true
            });

            var grid = this;
            grid.element.find('tbody tr:first').addClass('k-state-selected');
            var selectedItem = grid.dataItem(grid.select());

            if (selectedItem) {
                var row = this.select();
                var id = row.data("uid");
                my.uId = id;

                if (my.admin || (selectedItem.Cod_Funcionario == 0 || selectedItem.Cod_Funcionario == my.userInfo.sgiid)) {
                    $('#btnEditSelected').attr({
                        'disabled': false
                    });
                    $('#btnDeleteSelected').attr({
                        'disabled': false
                    });
                }
            }

            /*$.each(grid.dataSource.data(), function (i, item) {
                var rowSelector = ">tr:nth-child(" + (i + 1) + ")";
                var row = grid.tbody.find(rowSelector);

                if (item.Cod_Funcionario > 0 && item.Cod_Funcionario != my.userInfo.sgiid) {
                    row.css({ 'display': 'none' });
                }
            });*/

            $('#spanDateDisplay').html(moment(my.today).format('DD/MM/YYYY'));
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
            $("#clientsGrid").data("kendoGrid").table.focus();
        }
    });

    var arrows = [37, 38, 39, 40];
    clientsGrid.table.on("keydown", function (e) {
        if (arrows.indexOf(e.keyCode) >= 0) {
            if (e.keyCode == 38) {
                setTimeout(function () {
                    clientsGrid.select($('#clientsGrid').data('kendoGrid').select().prev());
                }, 1);
            }
            if (e.keyCode == 40) {
                setTimeout(function () {
                    clientsGrid.select($('#clientsGrid').data('kendoGrid').select().next());
                }, 1);
            }
        }
    });

    $('#btnEditSelected').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        var grid = $('#clientsGrid').data("kendoGrid");
        var dataItem = grid.dataSource.getByUid(my.uId);

        window.location.href = '/clientes/' + dataItem.codigo; // + '/' + orderBy + '/' + orderDir;
    });

    $('#btnAdd').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        window.location.href = '/clientes/novo';
    });

    $("#clientsGrid").delegate("tbody > tr", "dblclick", function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('#btnEditSelected').click();
    });

    $('#tbSearchFor').keyup(function (e) {
        if (e.keyCode === 13) {
            $('#btnRecarregar').click();
        }
    });

    //$('.kddlSearchFor input').kendoDropDownList({
    //    dataSource: clientsGrid.columns,
    //    dataTextField: 'title',
    //    dataValueField: 'field',
    //    select: function (e) {
    //        $('#tbPorcurarPor').focus();
    //    },
    //    dataBound: function () {
    //        var dropDown = this;

    //        $.each(dropDown.dataSource.data(), function (i, column) {
    //            if (column) {
    //                var itemToRemove = 0;
    //                if (column.field !== undefined) {
    //                    switch (true) {
    //                        case (column.field.toLowerCase().indexOf('clientecodigo') !== -1):
    //                            dropDown.dataSource.at(i).set('title', 'Código');
    //                            break;
    //                        default:

    //                    }
    //                }
    //            }
    //        });
    //    }
    //});

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

        clientsGrid.dataSource.read();
    });

    $('#btnDoSearch').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        clientsGrid.dataSource.read();
    });

    $('#btnDeleteSelected').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        var grid = $('#clientsGrid').data("kendoGrid");
        var dataItem = grid.dataSource.getByUid(my.uId);

        if (my.userInfo.adm || dataItem.Cod_Funcionario == my.userInfo.userid) {
            swal({
                title: 'Tem certeza?',
                text: "Esta ação não poderá ser revertida!",
                type: 'question',
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Sim, quero excluir!",
                cancelButtonText: "Não, cancele!",
                closeOnConfirm: true,
                closeOnCancel: true
            }).then(function (isConfirm) {
                if (isConfirm) {
                    $.ajax({
                        type: 'DELETE',
                        url: '/api/removeClient/' + dataItem.codigo
                    }).done(function (data) {
                        if (data.Result.indexOf('success') !== -1) {
                            grid.dataSource.remove(dataItem);
                            var notice = new PNotify({
                                title: 'Sucesso!',
                                text: 'Cliente removido.',
                                type: 'success',
                                animation: 'none',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright
                            });
                            notice.get().click(function () {
                                notice.remove();
                            });
                        } else {
                            var notice1 = new PNotify({
                                title: 'Atenção!',
                                text: (data.Msg.indexOf('conflitou') > 0 ? 'O registro não pode ser excluido. Isto causaria inconsistência no baco de dados.' : 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.') + '<br /><br />' + (data.Msg || data.Result),
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
                        var notice1 = new PNotify({
                            title: 'Atenção!',
                            text: 'Erro ao tentar executar a ação.',
                            type: 'error',
                            animation: 'none',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright
                        });
                        notice1.get().click(function () {
                            notice1.remove();
                        });
                    });
                } else {
                    var notice2 = new PNotify({
                        title: 'Cancelado!',
                        text: 'Nada foi alterado.',
                        type: 'warning',
                        animation: 'none',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright
                    });
                    notice2.get().click(function () {
                        notice2.remove();
                    });
                }
            });
        } else {
            BootstrapDialog.show({
                title: 'Autorização',
                message: $('<div></div>').load('/partials/validationForm.html'),
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
                            url: '/api/validateUser',
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

                                    swal({
                                        title: 'Tem certeza?',
                                        text: "Esta ação não poderá ser revertida!",
                                        type: 'question',
                                        showCancelButton: true,
                                        confirmButtonColor: "#DD6B55",
                                        confirmButtonText: "Sim, quero excluir!",
                                        cancelButtonText: "Não, cancele!",
                                        closeOnConfirm: true,
                                        closeOnCancel: true
                                    }).then(function (isConfirm) {
                                        if (isConfirm) {
                                            $.ajax({
                                                type: 'DELETE',
                                                url: '/api/removeClient/' + dataItem.codigo
                                            }).done(function (data) {
                                                if (data.Result.indexOf('success') !== -1) {
                                                    grid.dataSource.remove(dataItem);
                                                    var notice4 = new PNotify({
                                                        title: 'Sucesso!',
                                                        text: 'Cliente removido.',
                                                        type: 'success',
                                                        animation: 'none',
                                                        addclass: 'stack-bottomright',
                                                        stack: my.stack_bottomright
                                                    });
                                                    notice4.get().click(function () {
                                                        notice4.remove();
                                                    });
                                                } else {
                                                    var notice5 = new PNotify({
                                                        title: 'Atenção!',
                                                        text: (data.Msg.indexOf('conflitou') > 0 ? 'O registro não pode ser excluido. Isto causaria inconsistência no baco de dados.' : 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.') + '<br /><br />' + (data.Msg || data.Result),
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
                                                    text: 'Erro ao tentar executar a ação.',
                                                    type: 'error',
                                                    animation: 'none',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright
                                                });
                                                notice6.get().click(function () {
                                                    notice6.remove();
                                                });
                                            });
                                        } else {
                                            var notice7 = new PNotify({
                                                title: 'Cancelado!',
                                                text: 'Nada foi alterado.',
                                                type: 'warning',
                                                animation: 'none',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright
                                            });
                                            notice7.get().click(function () {
                                                notice7.remove();
                                            });
                                        }
                                    });
                                } else {
                                    var notice8 = new PNotify({
                                        title: 'Erro!',
                                        text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                        type: 'warning',
                                        animation: 'none',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright
                                    });
                                    notice8.get().click(function () {
                                        notice8.remove();
                                    });
                                }
                            } else {
                                var notice9 = new PNotify({
                                    title: 'Erro!',
                                    text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                    type: 'error',
                                    animation: 'none',
                                    addclass: 'stack-bottomright',
                                    stack: my.stack_bottomright
                                });
                                notice9.get().click(function () {
                                    notice9.remove();
                                });
                            }

                        }).fail(function (jqXHR, textStatus) {
                            console.log(jqXHR.responseText);
                            var notice10 = new PNotify({
                                title: 'Atenção!',
                                text: 'Erro ao tentar completar a ação.',
                                type: 'error',
                                animation: 'none',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright
                            });
                            notice10.get().click(function () {
                                notice10.remove();
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
    });

    $('#myTab').on('show.bs.tab', function (e) {
        //if ($(e.target).attr("href") == '#phoneTab') {
        //    $.ajax({
        //        url: '/dnn/desktopmodules/sgi/api/people/GetSGITelephones?personId=' + my.vm.personId()
        //    }).done(function (data) {
        //        if (data) {

        //            var ds = $('#telephonesGrid').data('kendoGrid').dataSource;
        //            $.each(data, function (i, item) {
        //                ds.insert(item);
        //            });

        //        } else {
        //            var notice = new PNotify({
        //                title: 'Atenção!',
        //                text: 'Não foi possível atualizar a lista de telefones.',
        //                type: 'error',
        //                addclass: 'stack-bottomright',
        //                stack: my.stack_bottomright
        //            });
        //            notice.get().click(function () {
        //                notice.remove();
        //            });
        //        }
        //    }).fail(function (jqXHR, textStatus) {
        //        console.log(jqXHR.responseText);
        //        var notice = new PNotify({
        //            title: 'Atenção!',
        //            text: 'Não foi possível atualizar a lista de telefones.',
        //            type: 'error',
        //            addclass: 'stack-bottomright',
        //            stack: my.stack_bottomright
        //        });
        //        notice.get().click(function () {
        //            notice.remove();
        //        });
        //    });
        //}
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
        $('.filterButtons .bootstrap-switch-small:last').css({
            'margin-bottom': '10px'
        });
        $('.filterButtons .bootstrap-switch-small:last').addClass('cloned');
        $('#btnRemoveFilter').removeClass('hidden');

        //$('.selectConditions select.cloned').on('change', function (e) {
        //    if (this.value == 'between') {
        //        $('.tbSearchFor2').removeClass('invisible');
        //        $('.tbSearchFor2 label:first').removeClass('invisible');
        //        $('.selectConditions .cloned').closest('input').eq(1).removeClass('invisible');
        //    } else {
        //        $('.selectConditions .cloned').closest('input').eq(1).addClass('invisible');
        //        if ($('.selectConditions select.cloned').length == 0) {
        //            $('.tbSearchFor2').addClass('invisible');
        //            $('.tbSearchFor2 label:first').addClass('invisible');
        //        }
        //    }
        //});
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
        clientsGrid.dataSource.read();
    });

    $.each(clientsGrid.columns, function (key, value) {
        if (value.field == 'codigo') {
            value.title = 'Código';
        }
        if (value.field.toLowerCase() == 'data_cadastro') {
            value.field = 'dbo.removehora(c.data_cadastro)';
        }
        if (value.field.toLowerCase() == 'cpf_cnpj') {
            value.field = 'dbo.removeformato(cpf_cnpj)';
        }
        $('.selectSearchFor select')
            .append($("<option></option>")
                .attr("value", value.field)
                .text(value.title));
    });

    $('.selectSearchFor select')
        .append($("<option></option>")
            .attr("value", 'dbo.removehora(c.data_cadastro)')
            .text('Data Cadastrado'));

    // QuickTips();
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
}*/

/*function keepSessionAlive() {
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
};
*/
var getNextDay = function () {
    $(document).ajaxStart(function () {
        Pace.restart();
    });
    my.today.setDate(my.today.getDate() + 1);
    $('.selectSearchFor option[value="dbo.removehora(c.data_cadastro)"]').attr('selected', 'selected');
    $('.selectConditions option[value="between"]').attr('selected', 'selected');
    $('.tbSearchFor input').val(moment(my.today).format('DD/MM/YYYY'));
    $('.tbSearchFor2 input').val(moment(my.today).format('DD/MM/YYYY'));
    $('#clientsGrid').data('kendoGrid').dataSource.read();
    return false;
};

var getPrevDay = function () {
    $(document).ajaxStart(function () {
        Pace.restart();
    });
    my.today.setDate(my.today.getDate() - 1);
    $('.selectSearchFor option[value="dbo.removehora(c.data_cadastro)"]').attr('selected', 'selected');
    $('.selectConditions option[value="between"]').attr('selected', 'selected');
    $('.tbSearchFor input').val(moment(my.today).format('DD/MM/YYYY'));
    $('.tbSearchFor2 input').val(moment(my.today).format('DD/MM/YYYY'));
    $('#clientsGrid').data('kendoGrid').dataSource.read();
    return false;
};