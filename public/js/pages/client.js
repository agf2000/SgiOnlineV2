'use strict';

$(function () {

    PNotify.prototype.options.styling = "bootstrap3";
    kendo.culture("pt-BR");
    kendo.culture().calendar.firstDay = 1;

    my.clientId = document.location.pathname.split('/')[2]; // my.getQuerystring('codigo', my.getStringParameterByName('codigo'));

    my.userInfo = Cookies.getJSON('SGIUser');

    // my.orderBy = my.getQuerystring('orderby', my.getStringParameterByName('orderby'));
    // my.orderDir = my.getQuerystring('orderdir', my.getStringParameterByName('orderdir'));

    $('#txtBoxBirthDate').daterangepicker({
        autoUpdateInput: false,
        singleDatePicker: true,
        calender_style: "picker_4"
    }, function (start, end, label) {
        console.log(start.toISOString(), end.toISOString(), label);
    });

    $('#select2Regions').select2({
        placeholder: "Regiões",
        width: '100%',
        language: "pt-BR",
        ajax: {
            url: "/api/getRegions",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    filter: params.term || "",
                    pageIndex: params.page || 1,
                    pageSize: 10
                };
            },
            processResults: function (data, params) {

                params.page = params.page || 1;

                var results = [];

                $.each(data, function (i, v) {
                    var o = {};
                    o.id = v.codigo;
                    o.name = v.nome;
                    //o.description = v.Descricao;
                    //o.value = v.codigo;
                    results.push(o);
                });

                return {
                    results: results,
                    pagination: {
                        more: (params.page * 10) < data[0].total_count
                    }
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumInputLength: -1,
        templateResult: function (repo) {
            if (repo.loading) return repo.text;
            var markup = '<option value="' + repo.id + '">' + repo.name + '</option>'
            return markup;
        },
        templateSelection: function (repo) {
            return repo.name || repo.text;
        }
    });

    $('#select2Classes').select2({
        placeholder: "Classes",
        width: '100%',
        language: "pt-BR",
        ajax: {
            url: "/api/getClasses",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    filter: params.term || "",
                    pageIndex: params.page || 1,
                    pageSize: 10
                };
            },
            processResults: function (data, params) {

                params.page = params.page || 1;

                var results = [];

                $.each(data, function (i, v) {
                    var o = {};
                    o.id = v.codigo;
                    o.name = v.nome;
                    //o.description = v.Descricao;
                    //o.value = v.codigo;
                    results.push(o);
                });

                return {
                    results: results,
                    pagination: {
                        more: (params.page * 10) < data[0].total_count
                    }
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumInputLength: -1,
        minimumResultsForSearch: -1,
        templateResult: function (repo) {
            if (repo.loading) return repo.text;
            var markup = '<option value="' + repo.id + '">' + repo.name + '</option>'
            return markup;
        },
        templateSelection: function (repo) {
            return repo.name || repo.text;
        }
    });

    $('#select2Civil').select2({
        placeholder: "Estado Civil",
        width: '100%',
        language: "pt-BR",
        ajax: {
            url: "/api/getJSONData",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    q: params.term
                };
            },
            processResults: function (data, params) {
                return {
                    results: data[0].marital_statuses
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumInputLength: -1,
        minimumResultsForSearch: -1,
        templateResult: function (repo) {
            if (repo.loading) return repo.text;
            var markup = '<option value="' + repo.id + '">' + repo.name + '</option>'
            return markup;
        },
        templateSelection: function (repo) {
            return repo.name || repo.text;
        }
    });

    $('#clientForm')
        .bootstrapValidator({
            message: 'This value is not valid',
            feedbackIcons: {
                valid: 'glyphicon glyphicon-ok',
                invalid: 'glyphicon glyphicon-remove',
                validating: 'glyphicon glyphicon-refresh'
            },
            fields: {
                txtBoxName: {
                    message: 'Nome é obrigatório',
                    validators: {
                        notEmpty: {
                            message: 'Nome é obrigatório'
                        },
                        // stringLength: {
                        //     min: 6,
                        //     max: 30,
                        //     message: 'The username must be more than 6 and less than 30 characters long'
                        // },
                        /*remote: {
                            url: 'remote.php',
                            message: 'The username is not available'
                        },*/
                        // regexp: {
                        //     regexp: /^[a-zA-Z0-9_\.]+$/,
                        //     message: 'The username can only consist of alphabetical, number, dot and underscore'
                        // }
                    }
                },
                personType: {
                    feedbackIcons: 'false',
                    validators: {
                        notEmpty: {
                            message: 'Trata-se de uma pessoa física ou jurídica?'
                        }
                    }
                },
            }
        })
        .on('status.field.bv', function (e, data) {
            var $form = $(e.target),
                validator = data.bv,
                $tabPane = data.element.parents('.tab-pane'),
                tabId = $tabPane.attr('id');

            if (tabId) {
                var $icon = $('a[href="#' + tabId + '"][data-toggle="tab"]').parent().find('i');

                // Add custom class to tab containing the field
                if (data.status == validator.STATUS_INVALID) {
                    $icon.removeClass('fa-check').addClass('fa-times');
                } else if (data.status == validator.STATUS_VALID) {
                    var isValidTab = validator.isValidContainer($tabPane);
                    $icon.removeClass('fa-check fa-times')
                        .addClass(isValidTab ? 'fa-check' : 'fa-times');
                }
            }
        })
        .on('success.form.bv', function (e) {
            e.preventDefault();
            $('#btnSavePerson').html("Um momento...").prop('disabled', true);

            var params = {
                ativo: $('#chkBoxActive').is(':checked'),
                codCepTrabalho: my.workAddressId,
                codCep: my.personAddressId,
                estado_Civil: $('#select2Civil option:selected').attr('value'),
                classe: $('#select2Classes option:selected').attr('value'),
                naturalidade: my.birthPlaceId,
                nome_Naturalidade: $('#txtBoxBirthPlace').val(),
                profissao: my.profId,
                nome_Profissao: $('#txtBoxProf').val(),
                regiao: $('#select2Regions option:selected').attr('value'),
                complemento: $('#txtBoxComplement').val(),
                complemento_Trabalho: $('#txtBoxWorkComplement').val(),
                cpf_Cnpj: $('#txtBoxCpf_Cnpj').val(),
                nascimento: ($('#txtBoxBirthDate').val().length > 0 ? moment($('#txtBoxBirthDate').val()).format() : ''),
                email: $('#txtBoxEmail').val(),
                fantasia: $('#txtBoxDisplayName').val(),
                filiacao: $('#txtBoxParents').val(),
                insc_Municipal: $('#txtBoxInscMun').val(),
                local_Trabalho: $('#txtBoxWorkPlace').val(),
                nacionalidade: $('#txtBoxNationality').val(),
                natureza: $('input[name=personType]:checked').val(),
                nome: $('#txtBoxName').val(),
                numero: $('#txtBoxNumber').val(),
                numero_Trabalho: $('#txtBoxWorkNumber').val(), // ToDo: Complemento do trabalho
                observacao: $('#textAreaComments').val(),
                codigo: my.clientId,
                rg_Insc_Est: $('#txtBoxRg_InscEst').val(),
                sexo: $('input[name=person]:checked').val() ? $('input[name=person]:checked').val() : 'M',
                telefone: $('#txtBoxTelephone').val(),
                contato: $('#txtBoxContact').val(),
                cod_Funcionario: my.userInfo.sgiid
            }

            $.ajax({
                type: (my.clientId > 0 ? 'PUT' : 'POST'),
                url: '/api/saveClient',
                data: params
            }).done(function (data) {
                if (!data.message) {
                    if (my.clientId > 0) {
                        var notice = new PNotify({
                            title: 'Sucesso!',
                            text: 'Cliente ' + my.clientId + ' atualizado.',
                            type: 'success',
                            animation: 'none',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright
                        });
                        notice.get().click(function () {
                            notice.remove();
                        });
                    } else {
                        $('.x_title').html(($('#txtBoxDisplayName').val().length > 0 ? $('#txtBoxDisplayName').val() : $('#txtBoxName').val()) + ' (' + data.codigo + ')').css('text-transform', 'uppercase');
                        if ($('#txtBoxDisplayName').val().length === 0) {
                            $('#txtBoxDisplayName').val($('#txtBoxName').val());
                        }

                        var notice1 = new PNotify({
                            title: 'Sucesso!',
                            text: 'Cliente inserido (' + data.codigo + ').',
                            type: 'success',
                            animation: 'none',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright
                        });
                        notice1.get().click(function () {
                            notice1.remove();
                        });

                        history.replaceState("", document.title, data.codigo);
                        // window.location = document.location + '/' + data.codigo + '/codigo/desc';
                        my.clientId = data.codigo;
                        $('#liTab').css({
                            'display': 'block'
                        });
                        $('#txtBoxTelephone').prop('readonly', true);
                        $('#txtBoxContact').prop('readonly', true);

                        if ($('#txtBoxTelephone').val().length > 0) {
                            var ds = new kendo.data.DataSource({
                                transport: {
                                    read: {
                                        url: '/api/getTelephones/' + data.codigo
                                    }
                                },
                                schema: {
                                    model: {
                                        id: 'codigo',
                                        fields: {
                                            pessoa: {
                                                type: 'number'
                                            },
                                            contato: {
                                                type: 'string'
                                            },
                                            data_Alteracao: {
                                                type: "date",
                                                format: "{0:MM/dd/yyyy}"
                                            },
                                            data_Cadastro: {
                                                type: "date",
                                                format: "{0:MM/dd/yyyy}"
                                            },
                                            email: {
                                                type: 'string'
                                            },
                                            nascimento: {
                                                type: 'date'
                                            },
                                            telefone: {
                                                type: 'string'
                                            },
                                            tipo: {
                                                defaultValue: {
                                                    Nome: "PRINCIPAL",
                                                    Tipo: "1"
                                                }
                                            },
                                            padrao: {
                                                type: 'boolean',
                                                defaultValue: false
                                            }
                                        }
                                    },
                                    total: 'total'
                                }
                            });
                            $('#telephonesGrid').data('kendoGrid').setDataSource(ds);
                            $('#telephonesGrid').data('kendoGrid').dataSource.read();
                        }
                    }
                } else {
                    var notice2 = new PNotify({
                        title: 'Atenção!',
                        text: (data.message ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + data.message,
                        type: 'error',
                        animation: 'none',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright
                    });
                    notice2.get().click(function () {
                        notice2.remove();
                    });
                }
                $('#btnSavePerson').html('Salvar').prop('disabled', false);
            }).fail(function (jqXHR, textStatus) {
                console.log(jqXHR.responseText);
                var notice3 = new PNotify({
                    title: 'Atenção!',
                    text: 'Erro ao tentar executar a ação.',
                    type: 'error',
                    animation: 'none',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright
                });
                notice3.get().click(function () {
                    notice3.remove();
                });
                $('#btnSavePerson').html('Salvar').prop('disabled', false);
            });
        });

    $('#telephonesGrid').kendoGrid({
        dataSource: new kendo.data.DataSource({
            schema: {
                model: {
                    id: 'codigo',
                    fields: {
                        pessoa: {
                            type: 'number'
                        },
                        contato: {
                            type: 'string'
                        },
                        data_Alteracao: {
                            type: "date",
                            format: "{0:MM/dd/yyyy}"
                        },
                        data_Cadastro: {
                            type: "date",
                            format: "{0:MM/dd/yyyy}"
                        },
                        email: {
                            type: 'string'
                        },
                        nascimento: {
                            type: 'date'
                        },
                        telefone: {
                            type: 'string'
                        },
                        tipo: {
                            defaultValue: {
                                Nome: "PRINCIPAL",
                                Tipo: "1"
                            }
                        },
                        padrao: {
                            type: 'boolean',
                            defaultValue: false
                        }
                    }
                }
            }
        }),
        autoBind: false,
        editable: true,
        //batch: true,
        toolbar: ["create"],
        columns: [{
                field: "codigo",
                hidden: true
            },
            {
                field: 'tipo',
                title: "Tipo",
                width: 120,
                template: '#= my.getPhoneType(tipo) #',
                editor: phoneTypeDropDownEditor
            },
            {
                field: "telefone",
                width: 100
            },
            {
                field: "contato",
                width: 100
            },
            {
                field: "nascimento",
                title: "Nascimento",
                width: 100,
                hidden: true
            },
            {
                field: "padrao",
                title: "Padrão",
                width: 50,
                attributes: {
                    class: "text-center"
                },
                template: '<input type="checkbox" #= padrao ? \'checked="checked"\' : "" # class="chkbx" />',
                sortable: false
            },
            {
                command: [{
                        name: 'update',
                        text: '',
                        click: function (e) {
                            e.preventDefault();

                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));

                            if (dataItem) {
                                var params = {
                                    codigo: dataItem.codigo,
                                    pessoa: dataItem.pessoa || my.clientId,
                                    tipo: (!isNaN(dataItem.tipo) ? dataItem.tipo : dataItem.tipo.tipo),
                                    telefone: dataItem.telefone,
                                    contato: dataItem.contato,
                                    padrao: $(e.currentTarget).closest("tr").find('.chkbx').is(':checked')
                                }

                                $.ajax({
                                    type: (dataItem.codigo > 0 ? 'PUT' : 'POST'),
                                    url: '/api/saveTelephone',
                                    data: params
                                }).done(function (response) {
                                    if (!response.message) {

                                        var notice = new PNotify({
                                            title: 'Sucesso!',
                                            text: 'Telefone atualizado.',
                                            type: 'success',
                                            animation: 'none',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright
                                        });
                                        notice.get().click(function () {
                                            notice.remove();
                                        });

                                        dataItem.set('codigo', response.codigo);
                                        // dataItem.set('pessoa', params.pessoa);
                                        // dataItem.set('tipo', params.tipo);
                                        // dataItem.set('telefone', params.telefone);
                                        // dataItem.set('contato', params.contato);
                                        // dataItem.set('padrao', JSON.parse(params.padrao)); // $(e.currentTarget).closest("tr").find('.chkbx').is(':checked'));
                                        // $('#telephonesGrid').data('kendoGrid').refresh();

                                    } else {
                                        var notice1 = new PNotify({
                                            title: 'Atenção!',
                                            text: response.message + '<br /> Mais informações no log do navegador.',
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
                                        text: 'Erro ao tentar executar a ação.',
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
                        }
                    },
                    {
                        name: 'remove',
                        text: '',
                        class: '',
                        imageClass: 'k-icon k-delete',
                        click: function (e) {
                            e.preventDefault();

                            var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
                            if (dataItem) {

                                swal({
                                    title: 'Tem certeza?',
                                    text: "Esta ação não poderá ser revertida!",
                                    type: 'question',
                                    showCancelButton: true,
                                    confirmButtonColor: "#DD6B55",
                                    confirmButtonText: "Sim, quero excluir!",
                                    cancelButtonText: "Não, cancele!"
                                }).then(function (isConfirm) {
                                    if (isConfirm) {

                                        var gridDataSource = $("#telephonesGrid").data("kendoGrid").dataSource;
                                        //records on current view / page   
                                        var recordsOnCurrentView = gridDataSource.view().length;
                                        //total records
                                        var totalRecords = gridDataSource.total();

                                        if (totalRecords > 1 && JSON.parse(dataItem.padrao)) {
                                            swal(
                                                'Erro',
                                                'Não se pode excluir o telefone padrão.',
                                                'warning'
                                            )
                                        } else {

                                            $.ajax({
                                                type: 'DELETE',
                                                url: '/api/removeTelephone/' + dataItem.codigo
                                            }).done(function (data) {
                                                if (!data.message) {
                                                    var notice = new PNotify({
                                                        title: 'Sucesso!',
                                                        text: 'Telefone removido.',
                                                        type: 'success',
                                                        animation: 'none',
                                                        addclass: 'stack-bottomright',
                                                        stack: my.stack_bottomright
                                                    });
                                                    notice.get().click(function () {
                                                        notice.remove();
                                                    });
                                                    $('#telephonesGrid').data('kendoGrid').dataSource.remove(dataItem);

                                                    // $('#telephonesGrid').data('kendoGrid').dataSource.data()[0].set('Padrao', true);
                                                } else {
                                                    var notice2 = new PNotify({
                                                        title: 'Atenção!',
                                                        text: (data.message ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.message),
                                                        type: 'error',
                                                        animation: 'none',
                                                        addclass: 'stack-bottomright',
                                                        stack: my.stack_bottomright
                                                    });
                                                    notice2.get().click(function () {
                                                        notice2.remove();
                                                    });
                                                }
                                            }).fail(function (jqXHR, textStatus) {
                                                console.log(jqXHR.responseText);
                                                var notice3 = new PNotify({
                                                    title: 'Atenção!',
                                                    text: 'Erro ao tentar executar a ação.',
                                                    type: 'error',
                                                    animation: 'none',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright
                                                });
                                                notice3.get().click(function () {
                                                    notice3.remove();
                                                });
                                            });
                                        }
                                    } else {
                                        var notice4 = new PNotify({
                                            title: 'Cancelado!',
                                            text: 'Telefone não excluido.',
                                            type: 'warning',
                                            animation: 'none',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright
                                        });
                                        notice4.get().click(function () {
                                            notice4.remove();
                                        });
                                    }
                                });
                            }
                        }
                    },
                ],
                title: "&nbsp;",
                width: "70px"
            }
        ]
    });

    $('#telephonesGrid').data('kendoGrid').tbody.on("change", ".chkbx", function (e) {

        var initialStage = $(this).is(':checked');
        $('.chkbx').prop('checked', false);

        var $chk = $(this),
            grid = $('#telephonesGrid').data().kendoGrid,
            dataItem = grid.dataItem($(e.target).closest('tr'));

        if (initialStage) dataItem.set('padrao', true);

        // if (dataItem) {
        //     var params = {
        //         codigo: dataItem.codigo,
        //         pessoa: dataItem.pessoa || my.clientId,
        //         tipo: typeof (dataItem.tipo) == 'number' ? dataItem.tipo : dataItem.tipo.tipo,
        //         telefone: dataItem.telefone,
        //         contato: dataItem.contato,
        //         padrao: $chk.is(':checked')
        //     }

        //     $.ajax({
        //         type: 'POST',
        //         url: '/api/saveTelephone',
        //         data: params
        //     }).done(function (response) {
        //         if (response.Result.indexOf("success") !== -1) {

        //             var notice = new PNotify({
        //                 title: 'Sucesso!',
        //                 text: 'Telefone atualizado.',
        //                 type: 'success',
        //                 animation: 'none',
        //                 addclass: 'stack-bottomright',
        //                 stack: my.stack_bottomright
        //             });
        //             notice.get().click(function () {
        //                 notice.remove();
        //             });

        //             //dataItem.set('codigo', response.data.codigo);
        //             //dataItem.set('Pessoa', response.data.Pessoa);
        //             //dataItem.set('Tipo', response.data.Tipo);
        //             //dataItem.set('Telefone', response.data.Telefone);
        //             //dataItem.set('Contato', response.data.Contato);
        //             //dataItem.set('Padrao', $chk.is(':checked'));
        //             //$('#telephonesGrid').data('kendoGrid').dataSource.read();

        //         } else {
        //             var notice1 = new PNotify({
        //                 title: 'Atenção!',
        //                 text: response.Result + '<br /> Mais informações no log do navegador.',
        //                 type: 'error',
        //                 animation: 'none',
        //                 addclass: 'stack-bottomright',
        //                 stack: my.stack_bottomright
        //             });
        //             notice1.get().click(function () {
        //                 notice1.remove();
        //             });
        //         }
        //     }).fail(function (jqXHR, textStatus) {
        //         console.log(jqXHR.responseText);
        //         var notice2 = new PNotify({
        //             title: 'Atenção!',
        //             text: 'Erro ao tentar executar a ação.',
        //             type: 'error',
        //             animation: 'none',
        //             addclass: 'stack-bottomright',
        //             stack: my.stack_bottomright
        //         });
        //         notice2.get().click(function () {
        //             notice2.remove();
        //         });
        //     });
        // }
    });

    $("#telephonesGrid").on("click", ".k-grid-edit", function () {
        $(".k-grid-update").html("<span class='k-icon k-update'></span>").css("min-width", "16px").removeClass("k-button-icontext");
        $(".k-grid-cancel").html("<span class='k-icon k-cancel'></span>").css("min-width", "16px").removeClass("k-button-icontext");
    });

    $('input[name="personType"]').on('change', function (event) {
        if (this.value == 'J') {
            $("label[for='txtBoxName']").text('Razão:');
            $("#txtBoxName").attr({
                'placeholder': 'Razão Social',
                'data-content': 'Insira a razão social'
            });
            $("label[for='txtBoxDisplayName']").text('Fantasia:');
            $("#txtBoxDisplayName").attr('placeholder', 'Fantasia');
            $("label[for='txtBoxCpf_Cnpj']").text('CNPJ:');
            $("#txtBoxCpf_Cnpj").inputmask('99.999.999/9999-99');
            $("label[for='txtBoxBirthDate']").text('Criação:');
            $("#txtBoxBirthDate").attr('placeholder', 'Data de Criação');
            $("label[for='txtBoxRg_InscEst']").text('Insc. Est.:');
            $("#txtBoxRg_InscEst").attr('placeholder', 'Inscrição Estadual');
            $("label[for='txtBoxInscMun']").removeClass('hidden');
            $("#txtBoxInscMun").removeClass('hidden');
            $('.aditionalTab').hide();
        } else {
            $("label[for='txtBoxName']").text('Nome:');
            $("#txtBoxName").attr({
                'placeholder': 'Nome Completo',
                'data-content': 'Insira  nome completo'
            });
            $("label[for='txtBoxDisplayName']").text('Apelido:');
            $("#txtBoxDisplayName").attr('placeholder', 'Apelido');
            $("label[for='txtBoxCpf_Cnpj']").text('CPF:');
            $("#txtBoxCpf_Cnpj").inputmask('999.999.999-99');
            $("label[for='txtBoxBirthDate']").text('Data Nasc.:');
            $("#txtBoxBirthDate").attr('placeholder', 'Data de Nascimento');
            $("label[for='txtBoxRg_InscEst']").text('RG:');
            $("#txtBoxRg_InscEst").attr('placeholder', 'Identidade');
            $("label[for='txtBoxInscMun']").addClass('hidden');
            $("#txtBoxInscMun").addClass('hidden');
            $('.aditionalTab').show();
        }
    });

    $('.btnReturn').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        window.location.href = '/clientes';
    });

    $('.btnCancel').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        //$('.title_left h3').html('Novo Cadastro');
        window.location.href = '/clientes/novo';

        //$(':input').val(null);
    });

    var birthLocales = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace('nome'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '/api/getCities/%QUERY',
            wildcard: '%QUERY'
        }
    });

    $('#txtBoxBirthPlace').typeahead({
        hint: true,
        highlight: true,
        minLength: 2
    }, {
        name: 'birthLocales',
        source: birthLocales,
        limit: 100,
        display: 'nome',
        displayKey: 'codigo',
        templates: {
            empty: '<div class="empty-message"><i> Se a cidade não existe! Uma nova será cadastrada.</i></div>'
        },
        suggestion: function (data) {
            return '<p>' + data.Nome + '</p>';
        }
    });

    $('#txtBoxBirthPlace').bind('typeahead:select', function (ev, suggestion) {
        my.birthPlaceId = suggestion.codigo;
    });

    var professions = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.whitespace('nome'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            url: '/api/getProfessions/%QUERY',
            wildcard: '%QUERY'
        }
    });

    $('#txtBoxProf').typeahead({
        hint: true,
        highlight: true,
        minLength: 2
    }, {
        name: 'professions',
        source: professions,
        limit: 100,
        display: 'nome',
        displayKey: 'codigo',
        templates: {
            empty: '<div class="empty-message"><i> Se a profissão não existe! Uma nova será cadastrada.</i></div>'
        },
        suggestion: function (data) {
            return '<p>' + data.nome + '</p>';
        }
    });

    $('#txtBoxProf').bind('typeahead:select', function (ev, suggestion) {
        my.profId = suggestion.codigo;
    });

    moment.locale('pt-BR');

    $(":input").css({
        'text-transform': 'uppercase'
    }); // .inputmask();

    $('#txtBoxName').focus();

    $('.textArea')
        .on('focus', function () {
            $(this).closest('.textArea')
                .addClass('did-focus')
                .removeClass('is-contracted');
        })

        .on('keyup', function () {
            var lines = this.value.split(/\r?\n/);
            var textarea = $(this);

            if (lines.length >= 5) {
                textarea.addClass('is-taller');
            } else {
                textarea.removeClass('is-taller');
            }
        })

        .on('blur', function () {
            if (!this.value) {
                $(this).closest('.textArea').addClass('is-contracted');
            }
        });

    $.fn.modal.Constructor.prototype.enforceFocus = function () {};

    $("input").keyup(function () {
        $(this).val($(this).val().toUpperCase());
    });

    if (!isNaN(my.clientId)) {
        getClient(my.clientId);
    }

});

function validateCpf_Cnpj(elem) {
    var $this = $(elem.target);

    if (elem.value.replace(/[^\d]+/g, '').length >= 11) {
        if ($('label[for=txtBoxCpf_Cnpj]').text().trim().toLowerCase() == 'cpf:') {
            if (my.validaCPF(elem.value)) {
                $('#txtBoxCpf_Cnpj').parent().find('span').first().addClass('glyphicon-ok');
                $('#txtBoxCpf_Cnpj').parent().find('span').first().removeClass('glyphicon-thumbs-down');
            } else {
                $('#txtBoxCpf_Cnpj').parent().find('span').first().removeClass('glyphicon-ok');
                $('#txtBoxCpf_Cnpj').parent().find('span').first().addClass('glyphicon-thumbs-down');
                var notice = new PNotify({
                    title: 'Atenção!',
                    text: 'O CPF digitado não parece ser válido.',
                    type: 'warning',
                    animation: 'none',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright
                });
                notice.get().click(function () {
                    notice.remove();
                });
            }
        } else {
            if (my.validaCnpj(elem.value)) {
                $('#txtBoxCpf_Cnpj').parent().find('span').first().addClass('glyphicon-ok');
                $('#txtBoxCpf_Cnpj').parent().find('span').first().removeClass('glyphicon-thumbs-down');
            } else {
                $('#txtBoxCpf_Cnpj').parent().find('span').first().removeClass('glyphicon-ok');
                $('#txtBoxCpf_Cnpj').parent().find('span').first().addClass('glyphicon-thumbs-down');
                var notice = new PNotify({
                    title: 'Atenção!',
                    text: 'O CNPJ digitado não parece ser válido.',
                    type: 'warning',
                    animation: 'none',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright
                });
                notice.get().click(function () {
                    notice.remove();
                });
            }
        }
    }
};

var phoneTypes = [{
        'tipo': 9,
        'nome': 'OUTROS'
    },
    {
        'tipo': 10,
        'nome': 'WHATSAPP'
    },
    {
        'tipo': 11,
        'nome': 'CONTATOS'
    },
    {
        'tipo': 1,
        'nome': 'PRINCIPAL'
    },
    {
        'tipo': 2,
        'nome': 'FAX'
    },
    {
        'tipo': 3,
        'nome': 'TRABALHO'
    },
    {
        'tipo': 4,
        'nome': 'COBRANÇA'
    },
    {
        'tipo': 5,
        'nome': 'FAX TRABALHO'
    },
    {
        'tipo': 6,
        'nome': 'FAX COBRANÇA'
    },
    {
        'tipo': 7,
        'nome': 'CELULAR'
    },
    {
        'tipo': 8,
        'nome': 'OUTRO'
    }
]

function phoneTypeDropDownEditor(container, options) {
    $('<input required data-text-field="nome" data-value-field="tipo" data-bind="value:' + options.field + '"/>')
        .appendTo(container)
        .kendoDropDownList({
            dataTextField: "nome",
            dataValueField: "tipo",
            dataSource: phoneTypes
        });
}

function getTypes(type) {
    for (var i = 0, length = phoneTypes.length; i < length; i++) {
        if (phoneTypes[i].Tipo === (type || 1)) {
            return phoneTypes[i].Nome;
        }
    }
}

function getClient(clientId) {

    $.ajax({
        url: '/api/getClient?id=' + clientId // + '&orderBy=' + my.orderBy + '&orderDir=' + my.orderDir
    }).done(function (data) {
        if (data) {
            var client = data[0];
            if (client.natureza === 'F') {
                $('input[name=personType]:eq(0)').attr('checked', 'checked');
                $("label[for='txtBoxName']").text('Nome:');
                $("#txtBoxName").attr({
                    'placeholder': 'Nome Completo',
                    'data-content': 'Insira  nome completo'
                });
                $("label[for='txtBoxDisplayName']").text('Apelido:');
                $("#txtBoxDisplayName").attr('placeholder', 'Apelido');
                $("label[for='txtBoxCpf_Cnpj']").text('CPF:');
                $("#txtBoxCpf_Cnpj").inputmask('999.999.999-99');
                $("label[for='txtBoxBirthDate']").text('Data Nasc.:');
                $("#txtBoxBirthDate").attr('placeholder', 'Data de Nascimento');
                $("label[for='txtBoxRg_InscEst']").text('RG:');
                $("#txtBoxRg_InscEst").attr('placeholder', 'Identidade');
                $("label[for='txtBoxInscMun']").addClass('hidden');
                $("#txtBoxInscMun").addClass('hidden');
            } else {
                $('input[name=personType]:eq(1)').attr('checked', 'checked');
                $("label[for='txtBoxName']").text('Razão:');
                $("#txtBoxName").attr({
                    'placeholder': 'Razão Social',
                    'data-content': 'Insira a razão social'
                });
                $("label[for='txtBoxDisplayName']").text('Fantasia:');
                $("#txtBoxDisplayName").attr('placeholder', 'Fantasia');
                $("label[for='txtBoxCpf_Cnpj']").text('CNPJ:');
                $("#txtBoxCpf_Cnpj").inputmask('99.999.999/9999-99');
                $("label[for='txtBoxBirthDate']").text('Criação:');
                $("#txtBoxBirthDate").attr('placeholder', 'Data de Criação');
                $("label[for='txtBoxRg_InscEst']").text('Insc. Est.:');
                $("#txtBoxRg_InscEst").attr('placeholder', 'Inscrição Estadual');
                $("label[for='txtBoxInscMun']").removeClass('hidden');
                $("#txtBoxInscMun").removeClass('hidden');
            }

            $('.x_title').html(client.fantasia + ' (' + client.codigo + ')').css('text-transform', 'uppercase');

            $('#txtBoxInscMun').val(client.insc_mun);
            $('#txtBoxTelephone').val(client.telefone);
            $('#txtBoxContact').val(client.contato);
            $('#txtBoxTelephone').prop('readonly', true);
            $('#txtBoxContact').prop('readonly', true);
            my.personAddressId = client.cep;
            $('#chkBoxActive').prop('checked', client.ativo);
            $('#txtBoxName').val(client.nome);
            $('#txtBoxDisplayName').val(client.fantasia);
            $('#txtBoxCpf_Cnpj').val(client.cpf_cnpj);
            if ((client.nascimento != null) && (moment(client.nascimento).format() > moment(new Date(1900, 1, 1)).format())) {
                $('#txtBoxBirthDate').data('daterangepicker').setStartDate(new Date(client.nascimento));
            }
            $('#txtBoxRg_InscEst').val(client.rg_insc_est);
            $('#txtBoxNumber').val(client.numero);
            $('#txtBoxComplement').val(client.complemento);
            $('#txtBoxEmail').val(client.email);

            if (client.classe > 0) {
                $('#select2Classes').append($('<option value="' + client.classe + '" selected>' + client.nome_classe + '</option>'));
                $('#select2Classes').trigger("change");
            }

            if (client.regiao > 0) {
                $('#select2Regions').append($('<option value="' + client.regiao + '" selected>' + client.nome_regiao + '</option>'));
                $('#select2Regions').trigger("change");
            }

            $('#textAreaComments').val(client.observacao);

            //$('#telephonesGrid').data('kendoGrid').dataSource.data([]);

            //$('#telephonesGrid').show();

            // JSON.stringify(client.telefones).replace(/"([\w]+)":/g, function ($0, $1) {
            //     return ('"' + $1.toLowerCase() + '":');
            // });
            var telephones = $.parseJSON(JSON.stringify(eval("(" + client.telefones + ")")));

            $.each(telephones, function (i, phone) {
                $('#telephonesGrid').data('kendoGrid').dataSource.add({
                    codigo: phone.codigo,
                    pessoa: phone.pessoa,
                    tipo: parseInt(phone.tipo),
                    telefone: phone.telefone,
                    contato: phone.contato,
                    nascimento: phone.nascimento,
                    padrao: JSON.parse(phone.padrao)
                });
            });

            $('.box-title').html(client.fantasia + ' (' + client.codigo + ')').css('text-transform', 'uppercase');

            $('#txtBoxPersonAddress').val(client.enderecocompleto);
            $('#txtBoxPersonAddress').attr('title', client.enderecocompleto);

            setTimeout(function () {
                if (client.numero_cep > 0) {
                    my.clientZip = client.numero_cep;
                }
            }, 1000);

            if (client.sexo == 'M') {
                $('input[name=person]:eq(0)').prop('checked', true);
            } else {
                $('input[name=person]:eq(1)').prop('checked', true);
            }

            $('#txtBoxWorkAddress').val(client.trabalhoenderecocompleto);
            $('#txtBoxWorkAddress').attr('title', client.trabalhoenderecocompleto);

            setTimeout(function () {
                if (client.cep_trabalho > 0) {
                    my.workAddressZip = client.trabalhonumerocep;
                }
            }, 1000);

            $('#txtBoxNationality').val(client.nacionalidade);
            if (client.naturalidade > 0) {
                $('#txtBoxBirthPlace').val(client.nome_naturalidade);
                my.birthPlaceId = client.naturalidade;
            }
            $('#txtBoxParents').val(client.filiacao);

            if (client.estado_civil) {
                if (client.estado_civil.trim() != '') {
                    $('#select2Civil').append($('<option value="' + client.estado_civil + '" selected>' + $('#select2Civil option[value=' + client.estado_civil + ']').text() + '</option>'));
                    $('#select2Civil').trigger("change");
                }
            }

            if (client.profissao > 0) {
                $('#txtBoxProf').val(client.nome_profissao);
                my.profId = client.profissao;
            }

            $('#txtBoxWorkPlace').val(client.local_trabalho);
            $('#txtBoxWorkNumber').val(client.numero_trabalho);
            $('#txtBoxWorkComplement').val(client.complemento_trabalho);
            //my.birthPlaceId = client.CodNaturalidade;

            // my.vm.nextClient(client.proximo);
            // my.vm.prevClient(client.anterior);

        } else {
            var notice = new PNotify({
                title: 'Atenção!',
                text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                type: 'error',
                animation: 'none',
                addclass: 'stack-bottomright',
                stack: my.stack_bottomright
            });
            notice.get().click(function () {
                notice.remove();
            });
        }

    }).fail(function (jqXHR, textStatus) {
        console.log(jqXHR.responseText);
    });
};

var getNextClient = function () {
    my.clientId = my.vm.nextClient();
    getClient(my.clientId);
    return false;
};

var getPrevClient = function () {
    my.clientId = my.vm.prevClient();
    getClient(my.clientId);
    return false;
};

function getRegions() {
    $('#select2Regions').select2('val', null);
    $('#select2Regions').trigger("change");

    BootstrapDialog.show({
        title: 'Regiões',
        message: $('<div></div>').load('/templates/regionsForm'),
        buttons: [{
            label: 'Fechar',
            cssClass: 'btn-default btn-flat',
            action: function (dialogRef) {
                dialogRef.close();
            }
        }, {
            label: 'Ok',
            cssClass: 'btn-primary',
            action: function (dialogRef) {
                var grid = $('#regionsGrid').data("kendoGrid");
                var dataItem = grid.dataSource.getByUid(my.uId);

                $('#select2Regions').append($('<option value="' + dataItem.codigo + '" selected>' + dataItem.Nome + '</option>'));
                $('#select2Regions').trigger("change");

                dialogRef.close();
            }
        }]
    });
}

function getClasses() {
    $('#select2Classes').select2('val', null);
    $('#select2Classes').trigger("change");

    BootstrapDialog.show({
        title: 'Classes',
        message: $('<div></div>').load('/templates/classesForm'),
        buttons: [{
            label: 'Fechar',
            cssClass: 'btn-default btn-flat',
            action: function (dialogRef) {
                dialogRef.close();
            }
        }, {
            label: 'Ok',
            cssClass: 'btn-primary',
            action: function (dialogRef) {
                var grid = $('#classesGrid').data("kendoGrid");
                var dataItem = grid.dataSource.getByUid(my.uId);

                $('#select2Classes').append($('<option value="' + dataItem.codigo + '" selected>' + dataItem.Nome + '</option>'));
                $('#select2Classes').trigger("change");

                dialogRef.close();
            }
        }]
    });
}

function getAddressForm(e) {
    my.buttonValue = e.value;
    my.txtBox = $(e).parent().parent().find('input');

    BootstrapDialog.show({
        title: 'Endereço Completo',
        message: $('<div></div>').load('/templates/addressForm'),
        closable: false,
        buttons: [{
            label: 'Fechar',
            cssClass: 'btn-default btn-flat',
            action: function (dialogRef) {
                dialogRef.close();
            }
        }, {
            label: 'Salvar',
            cssClass: 'btn-primary',
            id: 'btnSaveAddress'
        }]
    });
}