'use strict';

$(function () {

    PNotify.prototype.options.styling = "bootstrap3";

    my.saleId = document.location.pathname.split('/')[2];
    my.today = new Date();
    my.edidting = false;

    if (amplify.store.sessionStorage(document.location.host + "_user_loggedin") > 0) {
        my.userInfo = JSON.parse(amplify.store.sessionStorage(document.location.host + "_user"));

        my.viewModel();

        if (my.saleId > 0) {
            my.edidting = true;

            getSale();
        } else {
            if (my.userInfo.storeRules.condpagtopadrao != '') {
                $('#select2PayConditions').append($('<option value="' + parseInt(my.userInfo.storeRules.condpagtopadrao.split(',')[0]) + '" fee="' + parseInt(my.userInfo.storeRules.condpagtopadrao.split(',')[3]) + '" default="true" selected>' + my.userInfo.storeRules.condpagtopadrao.split(',')[1] + '</option>'));
                $('#select2PayConditions').attr({
                    'fee': my.userInfo.storeRules.condpagtopadrao.split(',')[3],
                    'default': true
                });
                $('#select2PayConditions').trigger('change');
            }

            if (my.userInfo.storeRules.operadorapadrao != '') {
                $('#select2CardProviders').append($('<option value="' + parseInt(my.userInfo.storeRules.operadorapadrao.split(',')[0]) + '" selected>' + my.userInfo.storeRules.operadorapadrao.split(',')[1] + '</option>'));
                $('#select2CardProviders').trigger('change');
            }

            $('#select2Salesmen').val(null);
            $('#select2Salesmen').append($('<option value="' + parseInt(my.userInfo.sgiid) + '" selected>' + my.userInfo.displayname + '</option>'));
            $('#select2Salesmen').trigger("change");

            my.vm.totalPercDiscount(0.00);

            $('input:radio[name=saleType]').focus();
        }
    }

    $('#select2Clients').select2({
        placeholder: "Informe o código, nome, fantasia ou cpf/cnpj",
        width: '100%',
        language: "pt-BR",
        // allowClear: true,
        ajax: {
            url: "/api/getPeople",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                var query = {
                    searchFor: params.term ? " and fantasia like '" + params.term + "%'" : '',
                    pageIndex: params.page || 1,
                    pageSize: 30,
                    type: 1,
                    orderBy: 'fantasia',
                    orderDir: 'ASC'
                };

                return query;
            },
            processResults: function (data, params) {

                params.page = params.page || 1;

                var results = [];

                $.each(data.data, function (i, v) {
                    var o = {};
                    o.id = v.codigo;
                    o.name = v.fantasia;
                    results.push(o);
                });

                return {
                    results: results,
                    pagination: {
                        more: (params.page * 30) < data.recordsTotal
                    }
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        // minimumInputLength: -1,
        // minimumResultsForSearch: -1,
        templateResult: function (repo) {
            if (repo.loading) return repo.text;
            var markup = '<option value="' + repo.id + '">' + repo.name + '</option>'
            return markup;
        },
        templateSelection: function (repo) {
            return repo.name || repo.text;
        }
    });

    $('#select2Clients').on("select2:select", function (e) {
        var $radios = $('input:radio[name=saleType]');
        if ($('#select2Clients').val() !== null) {
            PNotify.removeAll();
            $radios.prop('disabled', true);

            $("#selectCCC option").attr('disabled', false);
            $('#select2Products').prop('disabled', false);

            ValidateCliente($('#select2Clients').select2('data')[0].id);
        } else {
            $radios.prop('disabled', false);
        }
    });

    $('#btnResetClient').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        $('#select2Clients').val(null).trigger("change");
    });

    $('#select2Clients').on("select2:unselect", function (e) {
        $('input:radio[name=saleType]').prop('disabled', false);
    });

    $('#select2Salesmen').select2({
        placeholder: "Informe o código, nome do vendedor",
        width: '100%',
        language: "pt-BR",
        // allowClear: true,
        ajax: {
            url: "/api/getPeople",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                var query = {
                    searchFor: params.term ? " and fantasia like '" + params.term + "%' and ind_vendedor = 1" : ' and ind_vendedor = 1',
                    pageIndex: params.page || 1,
                    pageSize: 30,
                    type: 3,
                    orderBy: 'fantasia',
                    orderDir: 'ASC'
                };

                return query;
            },
            processResults: function (data, params) {

                params.page = params.page || 1;

                var results = [];

                $.each(data.data, function (i, v) {
                    var o = {};
                    o.id = v.codigo;
                    o.name = v.fantasia;
                    results.push(o);
                });

                return {
                    results: results,
                    pagination: {
                        more: (params.page * 30) < data.recordsTotal
                    }
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        // minimumInputLength: -1,
        // minimumResultsForSearch: -1,
        templateResult: function (repo) {
            if (repo.loading) return repo.text;
            var markup = '<option value="' + repo.id + '">' + repo.name + '</option>'
            return markup;
        },
        templateSelection: function (repo) {
            return repo.name || repo.text;
        }
    });

    $('#select2Products').select2({
        placeholder: "Informe o código do produto, nome, referência ou cód. barras",
        width: '100%',
        language: "pt-BR",
        ajax: {
            url: "/dnn/desktopmodules/sgi/api/products/GetSGIProducts",
            dataType: 'json',
            delay: 250,
            data: function (params) {
                var filter = " and p.codigo like '" + params.term + "%' " +
                    "or p.nome like '" + params.term + "%' or p.cod_barras like '" + params.term + "%' or " +
                    " (select top (1) referencia from dbo.produtofornecedor where (produto = p.codigo) and (principal = 1)) like '" + params.term + "%'";

                var query = {
                    searchFor: filter,
                    pageIndex: params.page,
                    pageSize: 10,
                    all: true
                };

                return query;
            },
            processResults: function (data, params) {

                params.page = params.page || 1;

                var results = [];

                $.each(data.data, function (i, v) {
                    var o = {};
                    o.id = v.Codigo;
                    o.name = v.Nome;
                    o.barcode = v.Cod_Barras;
                    o.ref = v.Referencia;
                    o.type = v.Tipo;
                    //o.sizes = v.Grade;
                    o.unit = v.Nome_Unidade;
                    o.stock = v.Estoque - v.EstoqueReservado;
                    o.price = v.Preco;
                    //o.discount = v.Desconto;
                    //o.comisson = v.Comissao;
                    //o.weight = v.Peso;
                    //o.taxes = v.Icsm;
                    //o.onSpecial = v.PromocaoAtivo;
                    //o.onSpecialQty = v.PromocaoQtdeRestante;
                    //o.cost = v.Custo_Final;
                    //o.bulkPrice = v.PrecoAtacado;
                    //o.discountOnBulk = v.QuantDesconto;
                    //o.bulkDiscountQty = v.DescontoPorQuant;
                    //o.discountOnResale = v.DescRevenda;
                    //o.discountPrice = v.PrecoDesconto;
                    results.push(o);
                });

                return {
                    results: results,
                    pagination: {
                        more: (params.page * 10) < data.total
                    }
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumInputLength: 1,
        templateResult: function (repo) {
            if (repo.loading) {
                return repo.text;
            }

            var markup = "<div class='dropDownHeight table-striped'>" +
                "<div class='row'>" +
                "<div class='col-xs-3 col-md-2'>" +
                "<img class='img-responsive img-thumbnail' src='/img/no-image.png' alt='' />" +
                "</div>" +
                "<div class='col-xs-9 col-md-10 select2-products-result'>" +
                "<div>" + repo.name + "</div>";

            if (repo.barcode != repo.id) {
                markup += "<div>Cód.: " + repo.id + " Cód. Barra: " + repo.barcode + "</div>";
            } else {
                markup += "<div>Cód.: " + repo.id + " Referência: " + repo.ref + "</div>";
            }

            markup += "<div>Estoque: " + repo.stock + "</div>" +
                "<div>Preço: R$ " + repo.price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) || 0 + "</div>" +
                "</div>" +
                "</div>" +
                "</div>";

            return markup;
        },
        templateSelection: function (repo) {
            return (repo.name != undefined) ? '(' + repo.id + ') ' + repo.name : repo.text;
        }
    });

    $('#select2Products').on("select2:select", function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if ($('#select2Products').val() !== null) {
            $('#btnAddProduct').prop('disabled', false);

            ValidateProduct($('#select2Products').select2('data')[0].id);
        }
    });

    $('#productQty').keypress(function (e) {
        if (e.which == 13) {
            $('#btnAddProduct').click();
        }
    });

    $('#select2CardProviders').select2({
        placeholder: "Selecione a operadora",
        width: '100%',
        language: "pt-BR",
        ajax: {
            url: "/dnn/desktopmodules/sgi/api/services/GetSGICardProviders",
            dataType: 'json',
            delay: 250,
            processResults: function (data, params) {

                var results = [];

                $.each(data.data, function (i, v) {
                    var o = {};
                    o.id = v.Codigo;
                    o.name = v.Cartao;
                    o.default = v.Padrao;
                    results.push(o);
                });

                return {
                    results: results
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumResultsForSearch: Infinity,
        templateResult: function (repo) {
            if (repo.loading) {
                return repo.text;
            }
            var markup = '<option value="' + repo.id + '">' + repo.name + '</option>';
            return markup;
        },
        templateSelection: function (repo) {
            return repo.name || repo.text;
        }
    });

    $('#select2PayConditions').select2({
        placeholder: "Selecione a condição",
        width: '100%',
        language: "pt-BR",
        ajax: {
            url: "/dnn/desktopmodules/sgi/api/services/GetSGIPayConditions",
            dataType: 'json',
            delay: 250,
            processResults: function (data, params) {

                var results = [];

                $.each(data.data, function (i, v) {
                    var o = {};
                    o.id = v.Codigo;
                    o.name = v.Nome;
                    o.default = v.Padrao;
                    results.push(o);
                });

                return {
                    results: results
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        },
        minimumResultsForSearch: Infinity,
        templateResult: function (repo) {
            if (repo.loading) {
                return repo.text;
            }
            var markup = '<option value="' + repo.id + '" default="' + repo.default+'" fee="' + repo.fee + '">' + repo.name + '</option>';
            return markup;
        },
        templateSelection: function (repo) {
            return repo.name || repo.text;
        }
    });

    $('#select2PayConditions').on("select2:select", function (e) {
        if ($('#select2PayConditions').val() !== null) {
            var data = $('#select2PayConditions').select2('data')[0];
            $.get('/dnn/desktopmodules/sgi/api/services/GetSGIPayCondition?condId=' + data.id, function (response) {
                if (response) {
                    if (response.Acrescimo > 0) {
                        my.vm.feePerc(parseFloat(response.Acrescimo));
                        my.vm.feeValue((parseFloat(response.Acrescimo) * my.vm.totalCred()) / 100);
                        my.vm.totalCred(my.vm.totalCred() + my.vm.feeValue());
                        if (my.vm.feeValue()) {
                            $('#lblBoxTotal').text('R$' + (my.vm.feeValue() + my.vm.totalAmount()).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })).parent().removeClass('hidden');
                        }
                    } else {
                        my.vm.feePerc(0);
                        my.vm.totalCred(my.vm.totalCred() - my.vm.feeValue());
                        my.vm.feeValue(0);
                        if (!$('#lblBoxTotal').parent().hasClass('hidden')) {
                            $('#lblBoxTotal').text(0).parent().addClass('hidden');
                        }
                    }
                } else {
                    var notice = new PNotify({
                        title: 'Atenção!',
                        text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                        type: 'error',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright,
                        history: {
                            menu: true,
                            labels: {
                                redisplay: "Mostrar",
                                all: "Todos",
                                last: "Último"
                            }
                        }
                    });
                    notice.get().click(function () {
                        notice.remove();
                    });
                }
            });
            //amplify.store.sessionStorage(document.location.host + "_selectedCondition", data);

        } else {
            my.vm.feePerc(0);
            my.vm.feeValue(0);
            my.vm.totalCred(0);
        }
    });

    $('#selectCCC').on('change', function (e) {
        if ($('#selectCCC').val() !== null) {
            var data = $('#selectCCC option:selected');
            amplify.store.sessionStorage(document.location.host + "_otherPays", data);
        }
    });

    $('#btnAddProduct').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        if ($('#select2Products').val() !== null) {

            var client = amplify.store.sessionStorage(document.location.host + "_client");
            var dataItem = my.product;

            var match = ko.utils.arrayFirst(my.vm.selectedProducts(), function (item) {
                return dataItem.Codigo == item.productId();
            });

            $('#productQty').val($('#productQty').val().replace(',', '.'));

            if (match) {
                match.qTy(parseFloat(match.qTy()) + parseFloat($('#productQty').val()));
                match.totalValue((match.price() * match.qTy()) - ((match.price() * match.qTy()) * match.discount() / 100));
            } else {

                if (client.Revenda && dataItem.DescRevenda) {
                    dataItem.Preco = dataItem.PrecoDesconto;
                }

                if (dataItem.DescontoPorQuant >= parseFloat($('#productQty').val()) && (dataItem.DescRevenda)) {
                    dataItem.Preco = dataItem.PrecoAtacado;
                }

                if ((dataItem.PromocaoAtivo) && (dataItem.PromocaoQtdeRestante > 0 && parseFloat($('#productQty').val()) > dataItem.PromocaoQtdeRestante)) {
                    BootstrapDialog.show({
                        title: 'Quantidade em promoção insuficiente',
                        message: $('<div></div>').load('/templates/validationForm.html'),
                        onshown: function () {
                            $('#txtPassword').keyup(function (e) {
                                if (e.keyCode === 13) {
                                    $('.bootstrap-dialog').find('.btn-primary').click();
                                }
                            });

                            var notice = new PNotify({
                                title: 'Info!',
                                text: 'Este produto se encontra em promoção. Porém a quantidade requisitada ultrapassa a quantidade restante em ' +
                                    'promoção ' + '(' + parseFloat(dataItem.PromocaoQtdeRestante) + ').',
                                type: 'error',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright,
                                history: {
                                    menu: true,
                                    labels: {
                                        redisplay: "Mostrar",
                                        all: "Todos",
                                        last: "Último"
                                    }
                                }
                            });
                            notice.get().click(function () {
                                notice.remove();
                            });

                            var myQty = parseFloat($('#productQty').val());
                            var onSpecialQty = parseFloat(dataItem.PromocaoQtdeRestante);
                            $('#productQty').val(onSpecialQty);
                        },
                        buttons: [{
                            label: 'Fechar',
                            cssClass: 'btn-default btn-flat',
                            action: function (dialogRef) {
                                dialogRef.close();
                            }
                        }, {
                            id: 'btnAuthenticate',
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
                                            var notice1 = new PNotify({
                                                title: 'Sucesso!',
                                                text: 'Permissão concedida',
                                                type: 'success',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright
                                            });
                                            notice1.get().click(function () {
                                                notice1.remove();
                                            });

                                            $('.bootstrap-dialog').modal('hide');

                                            if ($('#lg_once').is(':checked')) {
                                                my.vm.adminPassword(false);
                                            }

                                            $('#productQty').val(myQty);
                                        } else {
                                            var notice1 = new PNotify({
                                                title: 'Erro!',
                                                text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                type: 'warning',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright,
                                                history: {
                                                    menu: true,
                                                    labels: {
                                                        redisplay: "Mostrar",
                                                        all: "Todos",
                                                        last: "Último"
                                                    }
                                                }
                                            });
                                            notice1.get().click(function () {
                                                notice1.remove();
                                            });
                                        }
                                    } else {
                                        var notice2 = new PNotify({
                                            title: 'Erro!',
                                            text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                            type: 'error',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright,
                                            history: {
                                                menu: true,
                                                labels: {
                                                    redisplay: "Mostrar",
                                                    all: "Todos",
                                                    last: "Último"
                                                }
                                            }
                                        });
                                        notice2.get().click(function () {
                                            notice2.remove();
                                        });
                                    }

                                }).fail(function (jqXHR, textStatus) {
                                    console.log(jqXHR.responseText);
                                    var notice3 = new PNotify({
                                        title: 'Atenção!',
                                        text: 'Erro ao tentar completar a ação.',
                                        type: 'error',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: {
                                                redisplay: "Mostrar",
                                                all: "Todos",
                                                last: "Último"
                                            }
                                        }
                                    });
                                    notice3.get().click(function () {
                                        notice3.remove();
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

                // push the new selected item to the view model selectedProducts
                my.vm.selectedProducts.unshift(new my.Product()
                    .productId(dataItem.Codigo)
                    .itemType(dataItem.Tipo)
                    .onSpecial(dataItem.PromocaoAtivo)
                    .onSpecialQty(dataItem.PromocaoQtdeRestante)
                    .discountOnResale(dataItem.DescRevenda)
                    .discountPrice(parseFloat(dataItem.PrecoDesconto))
                    .bulkPrice(dataItem.PrecoAtacado)
                    .bulkDiscountQty(dataItem.DescontoPorQuant)
                    .discount(parseFloat(dataItem.Desconto).toFixed(2))
                    .productName(dataItem.Nome)
                    .price(parseFloat(dataItem.Preco))
                    .qTy(parseFloat($('#productQty').val()).toFixed(2))
                    .qTyStock(dataItem.Estoque - dataItem.EstoqueReservado)
                    .cost(dataItem.Custo_Final)
                    .totalValue((parseFloat(dataItem.Preco * parseFloat($('#productQty').val()))) - (parseFloat(dataItem.Preco * parseFloat($('#productQty').val())) * parseFloat(dataItem.Desconto) / 100)));

                my.vm.saleItems.push(new my.Product().productId(dataItem.Codigo));

                my.vm.totalDiscount((my.vm.totalPercDiscount() * my.vm.extendedPrice()) / 100);

                if (my.vm.feeValue() > 0) {
                    $('#lblBoxTotal').text('R$ ' + (my.vm.totalAmount() + my.vm.feeValue()).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })).parent().removeClass('hidden');
                }

            }

            // check for browser storage availability
            //if (my.storage) {

            //    // convert view model selectedProducts to string and add to storage via amplify
            //    amplify.store.sessionStorage(document.location.host + '_products', ko.toJSON(my.vm.selectedProducts()));

            //    // convert view model saleItems to string and add to storage via amplify
            //    amplify.store.sessionStorage(document.location.host + '_items', ko.toJSON(my.vm.saleItems()));
            //}

            //$.pnotify({
            //    title: 'Sucesso!',
            //    text: $('#NumericTextBox_Qty_' + dataItem.ProductId).data('kendoNumericTextBox').value() + ' do item <strong>' + dataItem.ProductName + '</strong> foi inserido no or&#231;amento.',
            //    type: 'success',
            //    icon: 'fa fa-check fa-lg',
            //    addclass: "stack-bottomright",
            //    stack: my.stack_bottomright
            //});

            $('#select2Products').val(null).trigger('change');
            $('#productQty').val(1);
            //$('#select2Products').select2('open').select2('close');
        }
    });

    $('input:radio[name=saleType]').on('change', function (event) {
        //amplify.store.sessionStorage(document.location.host + "_saleType", this.value);
        my.selectedSale = $(this).parent().find('label').text().trim();
    });

    $('#btnFinalize').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        var client = amplify.store.sessionStorage(document.location.host + "_client");

        // verificar se cliente e vendedor foram escolhidos
        if ($('#select2Clients').val() != null && $('#select2Salesmen').val() != null) {

            // verifica se há produtos selecionados
            if (my.vm.selectedProducts().length) {

                // verifica se há meio de pagamento selecionado
                if (parseFloat(my.vm.totalCred().toFixed(2)) || parseFloat(my.vm.totalCard().toFixed(2)) || parseFloat(my.vm.totalCash().toFixed(2))) {

                    // verifica se o meio de pagamento que não seja dinheiro ou cartão foi preenchido
                    if ((parseFloat(my.vm.totalCred().toFixed(2)) + parseFloat(my.vm.totalCard().toFixed(2)) + parseFloat(my.vm.totalCash().toFixed(2))) !== (parseFloat(my.vm.totalAmount().toFixed(2)) + parseFloat(my.vm.feeValue().toFixed(2)))) {
                        var notice = new PNotify({
                            title: 'Atenção!',
                            text: 'Total de meios de pagamento não bate com total da venda.',
                            type: 'error',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright,
                            history: {
                                menu: true,
                                labels: {
                                    redisplay: "Mostrar",
                                    all: "Todos",
                                    last: "Último"
                                }
                            }
                        });
                        notice.get().click(function () {
                            notice.remove();
                        });

                        return false;
                    }

                    // verifica se o meio de pagamento que não seja dinheiro ou cartão foi preenchido
                    if (parseFloat(my.vm.totalCred().toFixed(2)) && ($('#selectCCC').val() === null || $('#selectCCC').val() === '')) {
                        var notice1 = new PNotify({
                            title: 'Atenção!',
                            text: 'Favor escolher o meio de pagamento.',
                            type: 'error',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright,
                            history: {
                                menu: true,
                                labels: {
                                    redisplay: "Mostrar",
                                    all: "Todos",
                                    last: "Último"
                                }
                            }
                        });
                        notice1.get().click(function () {
                            notice1.remove();
                        });

                        return false;
                    }

                    // verifica se a loja usa condição de cliente preferencial and se o cliente é preferencial
                    if (my.userInfo.storeRules.clipreferencial && client.CliPreferencial) {
                        if ((parseFloat(my.vm.totalCred().toFixed(2)) + parseFloat(my.vm.totalCard().toFixed(2)) + parseFloat(my.vm.totalCash().toFixed(2))) !== (parseFloat(my.vm.totalAmount().toFixed(2)) + parseFloat(my.vm.feeValue().toFixed(2)))) {
                            var notice2 = new PNotify({
                                title: 'Atenção!',
                                text: 'Total de meios de pagamento não bate com total da venda.',
                                type: 'error',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright,
                                history: {
                                    menu: true,
                                    labels: {
                                        redisplay: "Mostrar",
                                        all: "Todos",
                                        last: "Último"
                                    }
                                }
                            });
                            notice2.get().click(function () {
                                notice2.remove();
                            });

                            return false;
                        } else {
                            if ((parseFloat(my.vm.totalPercDiscount()) > my.userInfo.storeRules.descontomaximo) && my.vm.validateAgain()) {

                                BootstrapDialog.show({
                                    title: 'Desconto ultrapassa o permitido',
                                    message: $('<div></div>').load('/templates/validationForm.html'),
                                    onshown: function () {
                                        $('#txtPassword').keyup(function (e) {
                                            if (e.keyCode === 13) {
                                                $('.bootstrap-dialog').find('.btn-primary').click();
                                            }
                                        });

                                        var notice3 = new PNotify({
                                            title: 'Atenção!',
                                            text: 'Total de desconto ultrapassa o máximo permitido.',
                                            type: 'error',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright,
                                            history: {
                                                menu: true,
                                                labels: {
                                                    redisplay: "Mostrar",
                                                    all: "Todos",
                                                    last: "Último"
                                                }
                                            }
                                        });
                                        notice3.get().click(function () {
                                            notice3.remove();
                                        });
                                    },
                                    onhidden: function () {
                                        if (my.iAmAdm) {
                                            RegisterSale();
                                            my.iAmAdm = false;
                                        }
                                    },
                                    buttons: [{
                                        label: 'Fechar',
                                        cssClass: 'btn-default btn-flat',
                                        action: function (dialogRef) {
                                            dialogRef.close();
                                        }
                                    }, {
                                        id: 'btnAuthenticate',
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
                                                        my.iAmAdm = true;

                                                        var notice1 = new PNotify({
                                                            title: 'Sucesso!',
                                                            text: 'Permissão concedida',
                                                            type: 'success',
                                                            addclass: 'stack-bottomright',
                                                            stack: my.stack_bottomright
                                                        });
                                                        notice1.get().click(function () {
                                                            notice1.remove();
                                                        });

                                                        if ($('#lg_once').is(':checked')) {
                                                            my.vm.adminPassword(false);
                                                        }

                                                        $('.bootstrap-dialog').modal('hide');
                                                    } else {
                                                        var notice4 = new PNotify({
                                                            title: 'Erro!',
                                                            text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                            type: 'warning',
                                                            addclass: 'stack-bottomright',
                                                            stack: my.stack_bottomright,
                                                            history: {
                                                                menu: true,
                                                                labels: {
                                                                    redisplay: "Mostrar",
                                                                    all: "Todos",
                                                                    last: "Último"
                                                                }
                                                            }
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
                                                        addclass: 'stack-bottomright',
                                                        stack: my.stack_bottomright,
                                                        history: {
                                                            menu: true,
                                                            labels: {
                                                                redisplay: "Mostrar",
                                                                all: "Todos",
                                                                last: "Último"
                                                            }
                                                        }
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
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright,
                                                    history: {
                                                        menu: true,
                                                        labels: {
                                                            redisplay: "Mostrar",
                                                            all: "Todos",
                                                            last: "Último"
                                                        }
                                                    }
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

                                return false;
                            } else {
                                RegisterSale();
                            }
                            return false;
                        }

                        return false;
                    } else if (($('#selectCCC').val() == '2') && ((client.Limite_Credito > 0 && (client.Limite_Credito < parseFloat(my.vm.totalCred().toFixed(2)))) || (client.Bloquear_Credito)) && (!my.userInfo.Adm || my.vm.adminPassword())) {

                        BootstrapDialog.show({
                            title: 'Cliente com crédito insuficiente',
                            message: $('<div></div>').load('/templates/validationForm.html'),
                            onshown: function () {
                                $('#txtPassword').keyup(function (e) {
                                    if (e.keyCode === 13) {
                                        $('.bootstrap-dialog').find('.btn-primary').click();
                                    }
                                });

                                var wMsg = '';
                                if (client.Limite_Credito > 0 && (client.Limite_Credito < parseFloat(my.vm.totalCred().toFixed(2)))) {
                                    wMsg = 'O cliente não possui crédito suficiente para compras em crediário.<br /> O crédito restante é de R$ ' + (client.Limite_Credito - my.vm.totalCred()).toFixed(2);
                                } else if (client.Bloquear_Credito) {
                                    wMsg = 'O cliente <strong>' + client.Fantasia + ' (' + client.id + ')</strong> está com crédito bloqueado.';
                                }

                                var notice7 = new PNotify({
                                    title: 'Atenção!',
                                    text: wMsg,
                                    type: 'error',
                                    addclass: 'stack-bottomright',
                                    stack: my.stack_bottomright,
                                    history: {
                                        menu: true,
                                        labels: {
                                            redisplay: "Mostrar",
                                            all: "Todos",
                                            last: "Último"
                                        }
                                    }
                                });
                                notice7.get().click(function () {
                                    notice7.remove();
                                });
                            },
                            onhidden: function () {
                                if (my.iAmAdm) {
                                    RegisterSale();
                                    my.iAmAdm = false;
                                }
                            },
                            buttons: [{
                                label: 'Fechar',
                                cssClass: 'btn-default btn-flat',
                                action: function (dialogRef) {
                                    dialogRef.close();
                                }
                            }, {
                                id: 'btnAuthenticate',
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
                                                my.iAmAdm = true;

                                                var notice1 = new PNotify({
                                                    title: 'Sucesso!',
                                                    text: 'Permissão concedida',
                                                    type: 'success',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright
                                                });
                                                notice1.get().click(function () {
                                                    notice1.remove();
                                                });

                                                if ($('#lg_once').is(':checked')) {
                                                    my.vm.adminPassword(false);
                                                }

                                                $('.bootstrap-dialog').modal('hide');
                                            } else {
                                                var notice8 = new PNotify({
                                                    title: 'Erro!',
                                                    text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                    type: 'warning',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright,
                                                    history: {
                                                        menu: true,
                                                        labels: {
                                                            redisplay: "Mostrar",
                                                            all: "Todos",
                                                            last: "Último"
                                                        }
                                                    }
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
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright,
                                                history: {
                                                    menu: true,
                                                    labels: {
                                                        redisplay: "Mostrar",
                                                        all: "Todos",
                                                        last: "Último"
                                                    }
                                                }
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
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright,
                                            history: {
                                                menu: true,
                                                labels: {
                                                    redisplay: "Mostrar",
                                                    all: "Todos",
                                                    last: "Último"
                                                }
                                            }
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

                        return false;
                    } else {
                        var grandTotal = 0;
                        $.each(my.vm.selectedProducts(), function (idx, item) {
                            grandTotal = grandTotal + (item.price() * item.qTy());
                        });
                        var discountValue = parseFloat(grandTotal) - (parseFloat(my.vm.totalAmount()));
                        var discountPerc = (discountValue * 100) / parseFloat(my.vm.extendedPrice());
                        if ((discountPerc > my.userInfo.storeRules.descontomaximo) && my.vm.validateAgain()) {

                            BootstrapDialog.show({
                                title: 'Desconto ultrapassa o permitido',
                                message: $('<div></div>').load('/templates/validationForm.html'),
                                onshown: function () {
                                    $('#txtPassword').keyup(function (e) {
                                        if (e.keyCode === 13) {
                                            $('.bootstrap-dialog').find('.btn-primary').click();
                                        }
                                    });

                                    var notice11 = new PNotify({
                                        title: 'Atenção!',
                                        text: 'Total de desconto ultrapassa o máximo permitido.',
                                        type: 'error',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: {
                                                redisplay: "Mostrar",
                                                all: "Todos",
                                                last: "Último"
                                            }
                                        }
                                    });
                                    notice11.get().click(function () {
                                        notice11.remove();
                                    });
                                },
                                onhidden: function () {
                                    if (my.iAmAdm) {
                                        RegisterSale();
                                        my.iAmAdm = false;
                                    }
                                },
                                buttons: [{
                                    label: 'Fechar',
                                    cssClass: 'btn-default btn-flat',
                                    action: function (dialogRef) {
                                        dialogRef.close();
                                    }
                                }, {
                                    id: 'btnAuthenticate',
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
                                                    my.iAmAdm = true;

                                                    var notice1 = new PNotify({
                                                        title: 'Sucesso!',
                                                        text: 'Permissão concedida',
                                                        type: 'success',
                                                        addclass: 'stack-bottomright',
                                                        stack: my.stack_bottomright
                                                    });
                                                    notice1.get().click(function () {
                                                        notice1.remove();
                                                    });

                                                    if ($('#lg_once').is(':checked')) {
                                                        my.vm.adminPassword(false);
                                                    }

                                                    $('.bootstrap-dialog').modal('hide');
                                                } else {
                                                    var notice13 = new PNotify({
                                                        title: 'Erro!',
                                                        text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                        type: 'warning',
                                                        addclass: 'stack-bottomright',
                                                        stack: my.stack_bottomright,
                                                        history: {
                                                            menu: true,
                                                            labels: {
                                                                redisplay: "Mostrar",
                                                                all: "Todos",
                                                                last: "Último"
                                                            }
                                                        }
                                                    });
                                                    notice13.get().click(function () {
                                                        notice13.remove();
                                                    });
                                                }
                                            } else {
                                                var notice14 = new PNotify({
                                                    title: 'Erro!',
                                                    text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                                    type: 'error',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright,
                                                    history: {
                                                        menu: true,
                                                        labels: {
                                                            redisplay: "Mostrar",
                                                            all: "Todos",
                                                            last: "Último"
                                                        }
                                                    }
                                                });
                                                notice14.get().click(function () {
                                                    notice14.remove();
                                                });
                                            }

                                        }).fail(function (jqXHR, textStatus) {
                                            console.log(jqXHR.responseText);
                                            var notice15 = new PNotify({
                                                title: 'Atenção!',
                                                text: 'Erro ao tentar completar a ação.',
                                                type: 'error',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright,
                                                history: {
                                                    menu: true,
                                                    labels: {
                                                        redisplay: "Mostrar",
                                                        all: "Todos",
                                                        last: "Último"
                                                    }
                                                }
                                            });
                                            notice15.get().click(function () {
                                                notice7.remove();
                                            });
                                        }).always(function () {
                                            $button.enable();
                                            $button.stopSpin();
                                            dialog.setClosable(true);
                                        });
                                    }
                                }]
                            });

                            return false;
                        } else {
                            RegisterSale();
                        }

                        return false;
                    }

                    return false;
                } else {
                    var notice16 = new PNotify({
                        title: 'Atenção!',
                        text: 'Meio de pagamento não escolhido.',
                        type: 'error',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright,
                        history: {
                            menu: true,
                            labels: {
                                redisplay: "Mostrar",
                                all: "Todos",
                                last: "Último"
                            }
                        }
                    });
                    notice16.get().click(function () {
                        notice16.remove();
                    });
                    return false;
                }

                return false;
            } else {
                var notice17 = new PNotify({
                    title: 'Atenção!',
                    text: 'Não ha produtos em seu ' + my.selectedSale + '.',
                    type: 'error',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright,
                    history: {
                        menu: true,
                        labels: {
                            redisplay: "Mostrar",
                            all: "Todos",
                            last: "Último"
                        }
                    }
                });
                notice17.get().click(function () {
                    notice17.remove();
                });

                return false;
            }

            return false;
        } else {
            var notice18 = new PNotify({
                title: 'Atenção!',
                text: 'Favor escolher cliente e vendedor.',
                type: 'error',
                addclass: 'stack-bottomright',
                stack: my.stack_bottomright,
                history: {
                    menu: true,
                    labels: {
                        redisplay: "Mostrar",
                        all: "Todos",
                        last: "Último"
                    }
                }
            });
            notice18.get().click(function () {
                notice18.remove();
            });

            return false;
        }

        return false;
    });

    $('#btnCancel').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        swal({
            title: 'Tem certeza?',
            text: 'Deseja realmente iniciar um novo ' + my.selectedSale + '?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Não',
            closeOnConfirm: true,
            closeOnCancel: true
        }).then(function (isConfirm) {
            if (isConfirm) {
                new ClearSale();

                $.scrollTo($('.breadcrumb'), 1000, {
                    offset: -40,
                    easing: 'swing'
                });

                var notice = new PNotify({
                    title: 'Sucesso!',
                    text: 'Pronto para iniciar um novo ' + my.selectedSale + '.',
                    type: 'success',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright,
                    history: {
                        menu: true,
                        labels: {
                            redisplay: "Mostrar",
                            all: "Todos",
                            last: "Último"
                        }
                    }
                });
                notice.get().click(function () {
                    notice.remove();
                });
                //window.location.href = '/vendas.html?cadastro=1';
            } else {
                var notice1 = new PNotify({
                    title: 'Cancelado!',
                    text: 'Nada foi alterado.',
                    type: 'warning',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright,
                    history: {
                        menu: true,
                        labels: {
                            redisplay: "Mostrar",
                            all: "Todos",
                            last: "Último"
                        }
                    }
                });
                notice1.get().click(function () {
                    notice1.remove();
                });
            }
        });
    });

    my.selectedSale = $("input[name=saleType]:checked").parent()[0].innerText.trim();

    $('.btnReturn').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        amplify.store.sessionStorage(document.location.host + "_client", null);

        window.location.href = '/davs';
    });

    $('#txtBoxTotalDiscount').on('focusin', function () {
        $(this).data('val', $(this).val());
    });

    $('#txtBoxTotalPercDiscount').on('focusin', function () {
        $(this).data('val', $(this).val());
    });

    $('#txtBoxTotalDiscount').focusout(function (e) {
        //amplify.store.sessionStorage(document.location.host + "_totalDiscount", $(e.target).val());
        //my.vm.totalDiscount(parseFloat($(e.target).val()));
        //amplify.store.sessionStorage(document.location.host + "_totalDiscount", my.vm.totalDiscount());
        my.vm.totalPercDiscount((my.vm.totalDiscount() * 100) / my.vm.extendedPrice());
        //my.vm.totalCash(0);
        //my.vm.totalCard(0);
        //my.vm.totalCred(0);
    });

    $('#txtBoxTotalPercDiscount').focusout(function (e) {
        //amplify.store.sessionStorage(document.location.host + "_totalPercDiscount", $(e.target).val());
        my.vm.totalDiscount((parseFloat($(e.target).val().replace(',', '.')) * my.vm.extendedPrice()) / 100);
        //amplify.store.sessionStorage(document.location.host + "_totalDiscount", my.vm.totalDiscount());
        //my.vm.totalPercDiscount(my.vm.totalPercDiscount().toFixed(2));
        //my.vm.totalCash(0);
        //my.vm.totalCard(0);
        //my.vm.totalCred(0);
    });

    $('#payCash').on('blur', function (e) {
        var $this = this;

        //amplify.store.sessionStorage(document.location.host + "_totalPayCash", $(e.target).val().replace(',', '.'));

        if (parseInt($this.value.replace(',', '')) !== 0) {
            $(e.target).val($this.value.replace(',', '.'));
            my.vm.totalCash(parseFloat($(e.target).val()));
        } else {
            my.vm.totalCash(0.00);
            //amplify.store.sessionStorage(document.location.host + "_totalPayCash", null);
        }

        if (my.vm.feeValue() > 0) {
            $('#lblBoxTotal').text('R$ ' + (my.vm.totalAmount() + my.vm.feeValue()).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })).parent().removeClass('hidden');
        }

        $this.value = formatWithComma($this.value, 2, ',');
    });

    $('#payCard').on('blur', function (e) {
        var $this = this;

        //amplify.store.sessionStorage(document.location.host + "_totalPayCard", $(e.target).val().replace(',', '.'));

        if (parseInt($this.value.replace(',', '')) !== 0) {
            $(e.target).val($this.value.replace(',', '.'));
            my.vm.totalCard(parseFloat($(e.target).val()));
        } else {
            my.vm.totalCard(0.00);
            //amplify.store.sessionStorage(document.location.host + "_totalPayCard", null);
        }

        if (my.vm.feeValue() > 0) {
            $('#lblBoxTotal').text('R$ ' + (my.vm.totalAmount() + my.vm.feeValue()).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })).parent().removeClass('hidden');
        }

        $this.value = formatWithComma($this.value, 2, ',');
    });

    $('#payCred').on('focusin', function (e) {
        my.original = parseFloat(this.value.replace(',', '.'));
    });

    $('#payCred').on('blur', function (e) {
        var $this = this;

        //amplify.store.sessionStorage(document.location.host + "_totalPayCred", $(e.target).val().replace(',', '.'));

        if (parseInt($this.value.replace(',', '')) !== 0) {
            $(e.target).val($this.value.replace(',', '.'));
            if (my.vm.feePerc() > 0) {
                if (my.original !== parseFloat($(e.target).val())) {
                    my.vm.feeValue((my.vm.feePerc() * parseFloat($(e.target).val())) / 100);
                    //my.vm.totalCred(parseFloat($(e.target).val().toFixed(2)) + my.vm.feeValue());
                } else {
                    my.vm.totalCred(parseFloat($(e.target).val()));
                }

                $('#lblBoxTotal').text('R$ ' + (my.vm.totalAmount() + my.vm.feeValue()).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })).parent().removeClass('hidden');

            } else {
                if (!$('#lblBoxTotal').parent().hasClass('hidden')) {
                    $('#lblBoxTotal').parent().addClass('hideen');
                }
                my.vm.feeValue(0);
                //my.vm.totalCred(parseFloat($(e.target).val()));
            }
        } else {
            my.vm.totalCred(0.00);
            if (!$('#lblBoxTotal').parent().hasClass('hidden')) {
                $('#lblBoxTotal').parent().addClass('hidden');
            }
            my.vm.feeValue(0);
            //amplify.store.sessionStorage(document.location.host + "_totalPayCred", null);
        }

        $this.value = formatWithComma($this.value, 2, ',');
    });

    moment.locale("pt-br");

});

function getSale() {

    var dav = JSON.parse(sale);

    var $radios = $('input:radio[name=saleType]');
    $radios.prop('disabled', true);

    if (dav.saleitems.length > 0) {
        my.vm.selectedProducts.removeAll();
        $.each(dav.saleitems, function (i, item) {
            my.vm.selectedProducts.push(new my.Product()
                .productId(item.codproduto)
                .productName(item.nome)
                .discount(item.descontoperc)
                .price(item.valorunitario)
                .qTy(item.quantidade)
                .qTyStock(item.estoque)
                .totalValue(item.valortotal)
                .saleItemId(item.codigo));
        });
    }

    $('#saleDate').html(moment(new Date($('#saleDate').text())).format('LLL'));

    $('#select2Clients').append($('<option value="' + dav.codcliente + '" active="' + dav.ativo + '" selected>' + dav.nomecliente + '</option>'));
    // $('#select2Clients').attr({
    //     'active': JSON.parse(ativo)
    // });
    $('#select2Clients').trigger('change');

    $('#select2Salesmen').append($('<option value="' + dav.codvendedor + '" selected>' + dav.vendedor + '</option>'));
    $('#select2Salesmen').trigger("change");

    if (dav.codoperadora > 0) {
        $('#select2CardProviders').append($('<option value="' + dav.odoperadora + '" selected>' + dav.operadora + '</option>'));
        $('#select2CardProviders').trigger("change");
    }

    $('#select2Products').attr('disabled', false);

    if (dav.valordinheiro > 0) {
        my.vm.totalCash(dav.valordinheiro);
    }

    if (dav.valorcartao > 0) {
        my.vm.totalCard(dav.valorcartao);
    }

    if (dav.valorcrediario > 0) {
        my.vm.totalCred(dav.valorcrediario);
    }

    if ((my.vm.totalCash() + my.vm.totalCard() + my.vm.totalCred()) == 0) {
        my.vm.totalCash(dav.valortotal);
    }

    my.vm.totalDiscount(0.00);
    my.vm.totalPercDiscount(0.00);

    if (dav.descontovalor !== 0) {
        my.vm.totalPercDiscount(dav.descontoperc.toFixed(2));
        my.vm.totalDiscount(dav.descontovalor.toFixed(2));
    }

    if (dav.acrescimoreal > 0) {
        my.vm.feeValue(dav.acrescimoreal);
        $('#lblBoxTotal').text('R$ ' + (my.vm.totalAmount() + my.vm.feeValue()).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })).parent().removeClass('hidden');
    }

    if (dav.valorcrediario > 0) {
        if (dav.cheque) {
            $('#selectCCC').val('5');
        } else {
            $('#selectCCC').val('2');
        }
        if (dav.convenio) {
            $('#selectCCC').val('3');
        }
        $('#selectCCC').trigger("change");
    }

    if (dav.orcamento) {
        //$('input[name=saleType]:eq(0)').attr({ 'selected': true });
        $radios.filter('[value=1]').prop('checked', true);
    }

    if (dav.pedido) {
        $radios.filter('[value=2]').prop('checked', true);
    }

    if (dav.condicional) {
        $radios.filter('[value=3]').prop('checked', true);
    }

    if ((!dav.orcamento) && (!dav.pedido) && (!dav.condicional)) {
        $radios.filter('[value=4]').prop('checked', true);
    }

    if (dav.impresso && (!(!dav.ocamento) && dav.status !== 3) && (dav.cod_funcionario !== my.userInfo.sgiid || (!my.userInfo.admin))) {
        var notice = new PNotify({
            title: 'Atenção!',
            text: 'Este orçamento já foi impresso e não deve ser editado.',
            type: 'info',
            addclass: 'stack-bottomright',
            stack: my.stack_bottomright,
            history: {
                menu: true,
                labels: {
                    redisplay: "Mostrar",
                    all: "Todos",
                    last: "Último"
                }
            }
        });
        notice.get().click(function () {
            notice.remove();
        });
    }

    $('#textAreaComments').val(dav.observacao);

    $('#btnFinalize').html('Salvar');

    if (((!dav.ocamento) && dav.status !== 3) && (dav.cod_funcionario !== my.userInfo.sgiid || (!my.userInfo.admin))) {
        var notice1 = new PNotify({
            title: 'Atenção!',
            text: 'Este DAV não pode ser editado.',
            type: 'warning',
            addclass: 'stack-bottomright',
            stack: my.stack_bottomright,
            history: {
                menu: true,
                labels: {
                    redisplay: "Mostrar",
                    all: "Todos",
                    last: "Último"
                }
            }
        });
        notice1.get().click(function () {
            notice1.remove();
        });
        $('#btnFinalize').attr({
            'disabled': true
        });
        $("#select2Clients").prop("disabled", true);
        $("#select2Products").prop("disabled", true);
    } else {
        ValidateCliente(dav.codcliente);
    }

}

function RegisterSale() {

    //alert('Pedido feito');

    var products = [];
    $.each(my.vm.selectedProducts(), function (i, p) {
        products.push({
            Codigo: p.saleItemId(),
            Quantidade: p.qTy(),
            CodProduto: p.productId(),
            ValorUnitario: p.price(),
            DescontoPerc: p.discount()
        });
    });

    $.ajax({
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        url: '/dnn/desktopmodules/sgi/api/sales/SaveSGISale',
        data: JSON.stringify({
            Cod_Funcionario: my.userInfo.sgiid,
            NumDav: my.saleId,
            CodCliente: $('#select2Clients').select2('data')[0].id,
            CodVendedor: $('#select2Salesmen').select2('data')[0].id,
            ValorTotal: (my.vm.totalAmount() + my.vm.feeValue()),
            Status: $('input[name=saleType]:eq(0)').is(':checked') ? 3 : 1,
            Orcamento: $('input[name=saleType]:eq(0)').is(':checked') ? true : false,
            Pedido: $('input[name=saleType]:eq(1)').is(':checked') ? true : false,
            Condicional: $('input[name=saleType]:eq(2)').is(':checked') ? true : false,
            CodCondPagto: $('#select2PayConditions').select2('data')[0].id,
            ValorDinheiro: my.vm.totalCash(),
            ValorCartao: my.vm.totalCard(),
            ValorCrediario: my.vm.totalCred(),
            Convenio: $('#selectCCC').val() == '3' ? true : false,
            Cheque: $('#selectCCC').val() == '5' ? true : false,
            DescontoValor: my.vm.totalDiscount(),
            DescontoPerc: my.vm.totalPercDiscount(),
            Observacao: $('#commentsTextArea').val(),
            CodOperadora: $('#select2CardProviders').select2('data')[0].id,
            AcrescimoReal: my.vm.feeValue(),
            SaleItems: products
        })
    }).done(function (response) {
        if (response) {

            var msg = '';
            if (my.saleId) {
                msg = 'DAV atualizad.';
            } else {
                if (response.NumDoc > 0) {
                    msg = 'DAV inserido' + ' (' + response.SequenciaDav + '). Venda (' + response.NumDoc + ')';
                } else {
                    msg = 'DAV inserido' + ' (' + response.SequenciaDav + ').'
                }
            }
            var notice = new PNotify({
                title: 'Sucesso!',
                text: msg,
                type: 'success',
                addclass: 'stack-bottomright',
                stack: my.stack_bottomright,
                history: {
                    menu: true,
                    labels: {
                        redisplay: "Mostrar",
                        all: "Todos",
                        last: "Último"
                    }
                }
            });
            notice.get().click(function () {
                notice.remove();
            });
            window.setTimeout(function () {
                new ClearSale();
            }, 3000);
            $.scrollTo($('.breadcrumb'), 1000, {
                offset: -40,
                easing: 'swing'
            });
        } else {
            var notice1 = new PNotify({
                title: 'Atenção!',
                text: response.Result + '<br />' + response.Msg,
                type: 'error',
                addclass: 'stack-bottomright',
                stack: my.stack_bottomright,
                history: {
                    menu: true,
                    labels: {
                        redisplay: "Mostrar",
                        all: "Todos",
                        last: "Último"
                    }
                }
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
            addclass: 'stack-bottomright',
            stack: my.stack_bottomright,
            history: {
                menu: true,
                labels: {
                    redisplay: "Mostrar",
                    all: "Todos",
                    last: "Último"
                }
            }
        });
        notice2.get().click(function () {
            notice2.remove();
        });
    });
}

function ClearSale() {

    my.saleId = 0;
    $('input:radio[name=saleType]').prop('disabled', false);

    $('#selectCCC').val(null);
    $("#selectCCC option").attr('disabled', false);

    if (my.userInfo.storeRules.condpagtopadrao != '') {
        $('#select2PayConditions').val(null);
        $('#select2PayConditions').append($('<option value="' + parseInt(my.userInfo.storeRules.condpagtopadrao.split(',')[0]) + '" fee="' + parseInt(my.userInfo.storeRules.condpagtopadrao.split(',')[3]) + '" default="true" selected>' + my.userInfo.storeRules.condpagtopadrao.split(',')[1] + '</option>'));
        $('#select2PayConditions').attr({
            'fee': my.userInfo.storeRules.condpagtopadrao.split(',')[3],
            'default': true
        });
        $('#select2PayConditions').trigger('change');
    }

    if (my.userInfo.storeRules.operadorapadrao != '') {
        $('#select2CardProviders').val(null);
        $('#select2CardProviders').append($('<option value="' + parseInt(my.userInfo.storeRules.operadorapadrao.split(',')[0]) + '" selected>' + my.userInfo.storeRules.operadorapadrao.split(',')[1] + '</option>'));
        $('#select2CardProviders').trigger('change');
    }

    $('#select2Salesmen').val(null);
    $('#select2Salesmen').append($('<option value="' + parseInt(my.userInfo.sgiid) + '" selected>' + my.userInfo.displayname + '</option>'));
    $('#select2Salesmen').trigger("change");

    my.vm.totalDiscount(0.00);
    my.vm.totalPercDiscount(0.00);
    my.vm.totalCash(0.00);
    my.vm.totalCard(0.00);
    my.vm.totalCred(0.00);
    my.vm.feePerc(0);
    my.vm.feeValue(0);
    my.vm.selectedProducts.removeAll();

    if (!$('#lblBoxTotal').parent().hasClass('hidden')) {
        $('#lblBoxTotal').text(0).parent().addClass('hidden');
    }

    $('#select2Clients').val(null).trigger("change");

    $('#textAreaComments').val('');

    //amplify.store.sessionStorage(document.location.host + "_saleType", null);
    amplify.store.sessionStorage(document.location.host + "_client", null);
    //amplify.store.sessionStorage(document.location.host + "_selectedCondition", null);
    //amplify.store.sessionStorage(document.location.host + "_salesman", null);
    //amplify.store.sessionStorage(document.location.host + "_otherPays", null);
    //amplify.store.sessionStorage(document.location.host + "_cardProviders", null);
    //amplify.store.sessionStorage(document.location.host + "_saleComments", null);
    //amplify.store.sessionStorage(document.location.host + '_products', null);
    //amplify.store.sessionStorage(document.location.host + "_pedido.html", null);
    //amplify.store.sessionStorage(document.location.host + document.location.pathname + document.location.search, null);
    //amplify.store.sessionStorage(document.location.host + "_totalPercDiscount", null);
    //amplify.store.sessionStorage(document.location.host + "_totalDiscount", null);
    //amplify.store.sessionStorage(document.location.host + '_totalPayCash', null);
    //amplify.store.sessionStorage(document.location.host + '_totalPayCard', null);
    //amplify.store.sessionStorage(document.location.host + '_totalPayCred', null);

    setTimeout(function () {
        PNotify.removeAll();
    }, 3000);
    history.pushState("", document.title, window.location.pathname);
}

function NewSale() {
    history.pushState("", document.title, window.location.pathname);
    window.location.reload();
}

function ValidateCliente(id) {

    $.get('/dnn/desktopmodules/sgi/api/people/ValidateSGIClient?clientId=' + id, function (data) {

        $('#payCash').prop('disabled', false);
        $('#btnSetCash').prop('disabled', false);
        $('#payCard').prop('disabled', false);
        $('#btnSetCard').prop('disabled', false);
        $('#payCred').prop('disabled', false);
        $('#btnSetCred').prop('disabled', false);
        $("#selectCCC option").attr('disabled', false);

        data.id = id;
        data.name = data.Fantasia;
        data.active = data.Ativo;
        amplify.store.sessionStorage(document.location.host + "_client", data);

        if (!my.edidting) {

            $('#btnFinalize').attr('disabled', false);

            if (data.Ativo == false || my.userInfo.DeptBlocked != '') {
                var notice = new PNotify({
                    title: 'Atenção!',
                    text: 'O cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> está inativo. ' + my.userInfo.DeptBlocked + '',
                    type: 'error',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright,
                    history: {
                        menu: true,
                        labels: {
                            redisplay: "Mostrar",
                            all: "Todos",
                            last: "Último"
                        }
                    }
                });
                notice.get().click(function () {
                    notice.remove();
                });

                if (my.userInfo.Adm == false && my.userInfo.DeptBlocked != '') {
                    if (amplify.store.sessionStorage(document.location.host + "_client")) {
                        $('#select2Clients').append($('<option value="' + id + '" active="' + data.Ativo + '" selected>' + data.Fantasia + '</option>'));
                        $('#select2Clients').attr({
                            'active': data.Ativo
                        });
                    } else {
                        $('#select2Clients').val(null);
                    }
                    $('#select2Clients').trigger('change');
                }

                return false;
            }

            if (data.SPC && data.CliPreferencial == false) {

                BootstrapDialog.show({
                    title: 'cliente no SPC',
                    message: $('<div></div>').load('/templates/validationForm.html'),
                    onshown: function () {
                        $('#txtPassword').keyup(function (e) {
                            if (e.keyCode === 13) {
                                $('.bootstrap-dialog').find('.btn-primary').click();
                            }
                        });

                        var notice1 = new PNotify({
                            title: 'Atenção!',
                            text: 'O cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> está no SPC. Favor contactar a gerência.',
                            type: 'error',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright,
                            history: {
                                menu: true,
                                labels: {
                                    redisplay: "Mostrar",
                                    all: "Todos",
                                    last: "Último"
                                }
                            }
                        });
                        notice1.get().click(function () {
                            notice1.remove();
                        });
                    },
                    onhidden: function () {
                        if (my.iAmAdm) {
                            $('#btnFinalize').attr('disabled', false);
                            my.iAmAdm = false;
                        } else {
                            if (!my.userInfo.Adm) {
                                if (amplify.store.sessionStorage(document.location.host + "_client")) {
                                    $('#select2Clients').append($('<option value="' + id + '" active="' + data.Ativo + '" selected>' + data.Fantasia + '</option>'));
                                    $('#select2Clients').attr({
                                        'active': data.Ativo
                                    });
                                } else {
                                    $('#select2Clients').val(null);
                                }
                                $('#select2Clients').trigger('change');
                            }
                        }
                    },
                    buttons: [{
                        label: 'Fechar',
                        cssClass: 'btn-default btn-flat',
                        action: function (dialogRef) {
                            dialogRef.close();
                        }
                    }, {
                        id: 'btnAuthenticate',
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
                                        my.iAmAdm = true;

                                        var notice1 = new PNotify({
                                            title: 'Sucesso!',
                                            text: 'Permissão concedida',
                                            type: 'success',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright
                                        });
                                        notice1.get().click(function () {
                                            notice1.remove();
                                        });

                                        $('.bootstrap-dialog').modal('hide');

                                        if ($('#lg_once').is(':checked')) {
                                            my.vm.adminPassword(false);
                                        }

                                        $('#btnFinalize').attr('disabled', true);
                                    } else {
                                        var notice2 = new PNotify({
                                            title: 'Erro!',
                                            text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                            type: 'warning',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright,
                                            history: {
                                                menu: true,
                                                labels: {
                                                    redisplay: "Mostrar",
                                                    all: "Todos",
                                                    last: "Último"
                                                }
                                            }
                                        });
                                        notice2.get().click(function () {
                                            notice2.remove();
                                        });
                                    }
                                } else {
                                    var notice3 = new PNotify({
                                        title: 'Erro!',
                                        text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                        type: 'error',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: {
                                                redisplay: "Mostrar",
                                                all: "Todos",
                                                last: "Último"
                                            }
                                        }
                                    });
                                    notice3.get().click(function () {
                                        notice3.remove();
                                    });
                                }

                            }).fail(function (jqXHR, textStatus) {
                                console.log(jqXHR.responseText);
                                var notice4 = new PNotify({
                                    title: 'Atenção!',
                                    text: 'Erro ao tentar completar a ação.',
                                    type: 'error',
                                    addclass: 'stack-bottomright',
                                    stack: my.stack_bottomright,
                                    history: {
                                        menu: true,
                                        labels: {
                                            redisplay: "Mostrar",
                                            all: "Todos",
                                            last: "Último"
                                        }
                                    }
                                });
                                notice4.get().click(function () {
                                    notice4.remove();
                                });
                            }).always(function () {
                                $button.enable();
                                $button.stopSpin();
                                dialog.setClosable(true);
                            });
                        }
                    }]
                });

                return false;
            }

            if (data.Bloqueado) {
                var notice5 = new PNotify({
                    title: 'Atenção!',
                    text: 'O cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> está bloqueado. Favor entrar em contato com a gerência.',
                    type: 'error',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright,
                    history: {
                        menu: true,
                        labels: {
                            redisplay: "Mostrar",
                            all: "Todos",
                            last: "Último"
                        }
                    }
                });
                notice5.get().click(function () {
                    notice5.remove();
                });

                return false;
            }

            if (my.userInfo.storeRules.bloqcliatrasado && data.DiasAtrasado) {
                if (data.CliPreferencial == false) {

                    BootstrapDialog.show({
                        title: 'Cliente bloqueado por atraso',
                        message: $('<div></div>').load('/templates/validationForm.html'),
                        onshown: function () {
                            $('#txtPassword').keyup(function (e) {
                                if (e.keyCode === 13) {
                                    $('.bootstrap-dialog').find('.btn-primary').click();
                                }
                            });

                            var notice9 = new PNotify({
                                title: 'Atenção!',
                                text: 'O cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> está bloqueado por estar atrasado em <strong>' + data.DiasAtrasado.toString() + '</strong> dias.',
                                type: 'error',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright,
                                history: {
                                    menu: true,
                                    labels: {
                                        redisplay: "Mostrar",
                                        all: "Todos",
                                        last: "Último"
                                    }
                                }
                            });
                            notice9.get().click(function () {
                                notice9.remove();
                            });

                            $('#btnFinalize').attr('disabled', true);
                        },
                        onhidden: function () {
                            if (my.iAmAdm) {
                                $('#btnFinalize').attr('disabled', false);
                                my.iAmAdm = false;
                            } else {
                                if (!my.userInfo.Adm) {
                                    if (amplify.store.sessionStorage(document.location.host + "_client")) {
                                        $('#select2Clients').append($('<option value="' + id + '" active="' + data.Ativo + '" selected>' + data.Fantasia + '</option>'));
                                        $('#select2Clients').attr({
                                            'active': data.Ativo
                                        });
                                    } else {
                                        $('#select2Clients').val(null);
                                    }

                                    $('#select2Clients').trigger('change');
                                }
                            }
                        },
                        buttons: [{
                            label: 'Fechar',
                            cssClass: 'btn-default btn-flat',
                            action: function (dialogRef) {
                                dialogRef.close();
                            }
                        }, {
                            id: 'btnAuthenticate',
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
                                            my.iAmAdm = true;

                                            var notice1 = new PNotify({
                                                title: 'Sucesso!',
                                                text: 'Permissão concedida',
                                                type: 'success',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright
                                            });
                                            notice1.get().click(function () {
                                                notice1.remove();
                                            });

                                            if ($('#lg_once').is(':checked')) {
                                                my.vm.adminPassword(false);
                                            }

                                            $('.bootstrap-dialog').modal('hide');
                                        } else {
                                            var notice10 = new PNotify({
                                                title: 'Erro!',
                                                text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                type: 'warning',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright,
                                                history: {
                                                    menu: true,
                                                    labels: {
                                                        redisplay: "Mostrar",
                                                        all: "Todos",
                                                        last: "Último"
                                                    }
                                                }
                                            });
                                            notice10.get().click(function () {
                                                notice10.remove();
                                            });
                                        }
                                    } else {
                                        var notice11 = new PNotify({
                                            title: 'Erro!',
                                            text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                            type: 'error',
                                            addclass: 'stack-bottomright',
                                            stack: my.stack_bottomright,
                                            history: {
                                                menu: true,
                                                labels: {
                                                    redisplay: "Mostrar",
                                                    all: "Todos",
                                                    last: "Último"
                                                }
                                            }
                                        });
                                        notice11.get().click(function () {
                                            notice11.remove();
                                        });
                                    }

                                }).fail(function (jqXHR, textStatus) {
                                    console.log(jqXHR.responseText);
                                    var notice12 = new PNotify({
                                        title: 'Atenção!',
                                        text: 'Erro ao tentar completar a ação.',
                                        type: 'error',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: {
                                                redisplay: "Mostrar",
                                                all: "Todos",
                                                last: "Último"
                                            }
                                        }
                                    });
                                    notice12.get().click(function () {
                                        notice12.remove();
                                    });
                                }).always(function () {
                                    $button.enable();
                                    $button.stopSpin();
                                    dialog.setClosable(true);
                                });
                            }
                        }]
                    });
                } else {
                    var notice13 = new PNotify({
                        title: 'Atenção!',
                        text: 'O cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> está bloqueado por estar atrasado em ' + data.DiasAtrasado.toString() + ' dias.',
                        type: 'warning',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright,
                        history: {
                            menu: true,
                            labels: {
                                redisplay: "Mostrar",
                                all: "Todos",
                                last: "Último"
                            }
                        }
                    });
                    notice13.get().click(function () {
                        notice13.remove();
                    });
                }
            }

            if (my.userInfo.storeRules.consistenciacliente) {
                if ($('input[name=saleType]:eq(1)').is(':checked')) {
                    if (data.Natureza != 'J' && my.validaCPF(data.Cpf_Cnpj) != true) {
                        var notice14 = new PNotify({
                            title: 'Atenção!',
                            text: 'O cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> possui um CPF inválido. Favor corrigir antes proseguir com o ' + my.selectedSale + '!',
                            type: 'error',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright,
                            history: {
                                menu: true,
                                labels: {
                                    redisplay: "Mostrar",
                                    all: "Todos",
                                    last: "Último"
                                }
                            }
                        });
                        notice14.get().click(function () {
                            notice14.remove();
                        });

                        if (amplify.store.sessionStorage(document.location.host + "_client")) {
                            $('#select2Clients').append($('<option value="' + id + '" active="' + data.Ativo + '" selected>' + data.Fantasia + '</option>'));
                            $('#select2Clients').attr({
                                'active': data.Ativo
                            });
                        } else {
                            $('#select2Clients').val(null);
                        }
                        $('#select2Clients').trigger('change');

                        return false;
                    } else if (data.Natureza != 'F' && my.validaCnpj(data.Cpf_Cnpj) != true) {
                        var notice15 = new PNotify({
                            title: 'Atenção!',
                            text: 'O cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> possui um CNPJ inválido. Favor corrigir antes proseguir com o ' + my.selectedSale + '!',
                            type: 'error',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright,
                            history: {
                                menu: true,
                                labels: {
                                    redisplay: "Mostrar",
                                    all: "Todos",
                                    last: "Último"
                                }
                            }
                        });
                        notice15.get().click(function () {
                            notice15.remove();
                        });

                        if (amplify.store.sessionStorage(document.location.host + "_client")) {
                            $('#select2Clients').append($('<option value="' + id + '" active="' + data.Ativo + '" selected>' + data.Fantasia + '</option>'));
                            $('#select2Clients').attr({
                                'active': data.Ativo
                            });
                        } else {
                            $('#select2Clients').val(null);
                        }
                        $('#select2Clients').trigger('change');
                    }
                }

                return false;
            }

            if ((my.userInfo.storerules.avisaclientedebito) && (data.Debito > 0 && data.CliPreferencial == false)) {
                var notice16 = new PNotify({
                    title: 'Atenção!',
                    text: 'O cliente <strong>' + name + ' (' + id + ')</strong> possui um débito de <strong> R$ ' + data.Debito.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) + '</strong>.',
                    type: 'warning',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright,
                    history: {
                        menu: true,
                        labels: {
                            redisplay: "Mostrar",
                            all: "Todos",
                            last: "Último"
                        }
                    }
                });
                notice16.get().click(function () {
                    notice16.remove();
                });
            }

            if (data.Bloquear_Credito && data.CliPreferencial == false) {
                var notice17 = new PNotify({
                    title: 'Atenção!',
                    text: 'O cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> está com crédito bloqueado.',
                    type: 'warning',
                    addclass: 'stack-bottomright',
                    stack: my.stack_bottomright,
                    history: {
                        menu: true,
                        labels: {
                            redisplay: "Mostrar",
                            all: "Todos",
                            last: "Último"
                        }
                    }
                });
                notice17.get().click(function () {
                    notice17.remove();
                });
            }

            //if (data.DescontoCliente > my.vm.storeRules().DescontoMaximo && my.vm.adminPassword()) {
            //    BootstrapDialog.show({
            //        title: 'Desconto ultrapassa o máximo permitido',
            //        message: $('<div></div>').load('/templates/validationForm.html'),
            //        onshown: function () {
            //            $('#txtPassword').keyup(function (e) {
            //                if (e.keyCode === 13) {
            //                    $('.bootstrap-dialog').find('.btn-primary').click();
            //                }
            //            });

            //            var notice18 = new PNotify({
            //                title: 'Atenção!',
            //                text: 'O desconto configurado para o cliente <strong>' + data.Fantasia + ' (' + id + ')</strong> ultrapassa o desconto máximo permitido.',
            //                type: 'error',
            //                addclass: 'stack-bottomright',
            //                stack: my.stack_bottomright,
            //                history: {
            //                    menu: true,
            //                    labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
            //                }
            //            });
            //            notice18.get().click(function () {
            //                notice18.remove();
            //            });
            //        },
            //        onhidden: function () {
            //            if (my.iAmAdm) {
            //                my.vm.totalPercDiscount(parseFloat(data.DescontoCliente.toFixed(2)));
            //                my.iAmAdm = false;
            //            } else {
            //                if (!my.userInfo.Adm) {
            //                    my.vm.totalPercDiscount(my.vm.storeRules().DescontoMaximo)
            //                    return false;
            //                }
            //            }
            //        },
            //        buttons: [{
            //            label: 'Fechar',
            //            cssClass: 'btn-default btn-flat',
            //            action: function (dialogRef) {
            //                dialogRef.close();
            //            }
            //        }, {
            //            id: 'btnAuthenticate',
            //            label: 'Prosseguir',
            //            cssClass: 'btn-primary btn-flat',
            //            action: function (dialog) {

            //                var $button = this;
            //                $button.disable();
            //                $button.spin();
            //                dialog.setClosable(false);

            //                var params = {
            //                    PortalId: 0,
            //                    Username: $('#txtLogin').val(),
            //                    Password: $('#txtPassword').val()
            //                };

            //                $.ajax({
            //                    type: 'POST',
            //                    url: '/dnn/desktopmodules/sgi/api/services/ValidateSGIUser',
            //                    data: params
            //                }).done(function (data) {
            //                    if (data.Result.indexOf("success") !== -1) {
            //                        if (data.User.Adm) {
            //                            my.iAmAdm = true;

            //                            var notice1 = new PNotify({
            //                                title: 'Sucesso!',
            //                                text: 'Permissão concedida',
            //                                type: 'success',
            //                                addclass: 'stack-bottomright',
            //                                stack: my.stack_bottomright
            //                            });
            //                            notice1.get().click(function () {
            //                                notice1.remove();
            //                            });

            //                            if ($('#lg_once').is(':checked')) {
            //                                my.vm.adminPassword(false);
            //                            }

            //                            $('.bootstrap-dialog').modal('hide');
            //                        } else {
            //                            var notice10 = new PNotify({
            //                                title: 'Erro!',
            //                                text: 'Sua conta foi autenticada mas não pertence a um administrador.',
            //                                type: 'warning',
            //                                addclass: 'stack-bottomright',
            //                                stack: my.stack_bottomright,
            //                                history: {
            //                                    menu: true,
            //                                    labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
            //                                }
            //                            });
            //                            notice10.get().click(function () {
            //                                notice10.remove();
            //                            });
            //                        }
            //                    } else {
            //                        var notice11 = new PNotify({
            //                            title: 'Erro!',
            //                            text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
            //                            type: 'error',
            //                            addclass: 'stack-bottomright',
            //                            stack: my.stack_bottomright,
            //                            history: {
            //                                menu: true,
            //                                labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
            //                            }
            //                        });
            //                        notice11.get().click(function () {
            //                            notice11.remove();
            //                        });
            //                    }

            //                }).fail(function (jqXHR, textStatus) {
            //                    console.log(jqXHR.responseText);
            //                    var notice12 = new PNotify({
            //                        title: 'Atenção!',
            //                        text: 'Erro ao tentar completar a ação.',
            //                        type: 'error',
            //                        addclass: 'stack-bottomright',
            //                        stack: my.stack_bottomright,
            //                        history: {
            //                            menu: true,
            //                            labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
            //                        }
            //                    });
            //                    notice12.get().click(function () {
            //                        notice12.remove();
            //                    });
            //                }).always(function () {
            //                    $button.enable();
            //                    $button.stopSpin();
            //                    dialog.setClosable(true);
            //                });
            //            }
            //        }]
            //    });
            //}

            if (data.TiposPagamentos !== null && data.TiposPagamentos !== '') {
                var blockedPays = '';
                $.each(data.TiposPagamentos.split(','), function (i, el) {

                    blockedPays += el.split(':')[1] + ', ';

                    if (!my.userInfo.Adm) {
                        switch (el.split(':')[0]) {
                            case '5' || '6':
                                $("#selectCCC option[value='5']").prop('disabled', true);
                                break;
                            case '1':
                                $('#payCash').prop('disabled', true);
                                $('#btnSetCash').prop('disabled', true);
                                break;
                            case '4':
                                $('#payCard').prop('disabled', true);
                                $('#btnSetCard').prop('disabled', true);
                                break;
                            default:
                                $("#selectCCC option[value='" + el.split(':')[0] + "']").prop('disabled', true);
                        }
                    }
                });

                if (blockedPays.indexOf('undefined') < 0) {
                    var notice19 = new PNotify({
                        title: 'Atenção!',
                        text: 'Meio(s) de pagamento <strong>' + blockedPays.substr(0, blockedPays.trim().length - 1) + '</strong> bloqueado para o cliente <strong>' + data.Fantasia + ' (' + id + ')</strong>.',
                        type: 'warning',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright,
                        history: {
                            menu: true,
                            labels: {
                                redisplay: "Mostrar",
                                all: "Todos",
                                last: "Último"
                            }
                        }
                    });
                    notice19.get().click(function () {
                        notice19.remove();
                    });
                }
            }

            //data.id = id;
            //data.name = data.Fantasia;
            //data.active = data.Ativo;
        }

        //amplify.store.sessionStorage(document.location.host + "_client", data);
    });
}

function ValidateProduct(id) {

    $.get('/dnn/desktopmodules/sgi/api/products/GetSGIProduct?productId=' + id, function (data) {

        my.product = data;

        if (data.Preco <= 0 && my.vm.adminPassword()) {
            BootstrapDialog.show({
                title: 'Produto sem preço',
                message: $('<div></div>').load('/templates/validationForm.html'),
                onshown: function () {
                    $('#txtPassword').keyup(function (e) {
                        if (e.keyCode === 13) {
                            $('.bootstrap-dialog').find('.btn-primary').click();
                        }
                    });

                    var notice = new PNotify({
                        title: 'Atenção!',
                        text: 'Produto sem preço. Requer permissão!',
                        type: 'warning',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright,
                        history: {
                            menu: true,
                            labels: {
                                redisplay: "Mostrar",
                                all: "Todos",
                                last: "Último"
                            }
                        }
                    });
                    notice.get().click(function () {
                        notice.remove();
                    });

                    $('#btnAddProduct').prop('disabled', true);
                },
                onhidden: function () {
                    if (my.iAmAdm) {
                        $('#btnAddProduct').prop('disabled', false);
                        my.iAmAdm = false;
                    } else {
                        if (!my.userInfo.Adm) {
                            return false;
                        }
                    }
                },
                buttons: [{
                    label: 'Fechar',
                    cssClass: 'btn-default btn-flat',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }, {
                    id: 'btnAuthenticate',
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
                                    my.iAmAdm = true;

                                    var notice1 = new PNotify({
                                        title: 'Sucesso!',
                                        text: 'Permissão concedida',
                                        type: 'success',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright
                                    });
                                    notice1.get().click(function () {
                                        notice1.remove();
                                    });

                                    if ($('#lg_once').is(':checked')) {
                                        my.vm.adminPassword(false);
                                    }

                                    $('.bootstrap-dialog').modal('hide');
                                } else {
                                    var notice10 = new PNotify({
                                        title: 'Erro!',
                                        text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                        type: 'warning',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: {
                                                redisplay: "Mostrar",
                                                all: "Todos",
                                                last: "Último"
                                            }
                                        }
                                    });
                                    notice10.get().click(function () {
                                        notice10.remove();
                                    });
                                }
                            } else {
                                var notice11 = new PNotify({
                                    title: 'Erro!',
                                    text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                    type: 'error',
                                    addclass: 'stack-bottomright',
                                    stack: my.stack_bottomright,
                                    history: {
                                        menu: true,
                                        labels: {
                                            redisplay: "Mostrar",
                                            all: "Todos",
                                            last: "Último"
                                        }
                                    }
                                });
                                notice11.get().click(function () {
                                    notice11.remove();
                                });
                            }

                        }).fail(function (jqXHR, textStatus) {
                            console.log(jqXHR.responseText);
                            var notice12 = new PNotify({
                                title: 'Atenção!',
                                text: 'Erro ao tentar completar a ação.',
                                type: 'error',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright,
                                history: {
                                    menu: true,
                                    labels: {
                                        redisplay: "Mostrar",
                                        all: "Todos",
                                        last: "Último"
                                    }
                                }
                            });
                            notice12.get().click(function () {
                                notice12.remove();
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

        if (my.userInfo.storeRules.estoquenegativo == false && (data.Estoque - data.EstoqueReservado) < parseFloat($('#productQty').val()) && my.vm.adminPassword()) {
            BootstrapDialog.show({
                title: 'Estoque insuficiente',
                message: $('<div></div>').load('/templates/validationForm.html'),
                onshown: function () {
                    $('#txtPassword').keyup(function (e) {
                        if (e.keyCode === 13) {
                            $('.bootstrap-dialog').find('.btn-primary').click();
                        }
                    });

                    var notice1 = new PNotify({
                        title: 'Atenção!',
                        text: 'O estoque atual do produto é de ' + (data.Estoque - data.EstoqueReservado).toString() + '. Requer permissão para continuar!',
                        type: 'warning',
                        addclass: 'stack-bottomright',
                        stack: my.stack_bottomright,
                        history: {
                            menu: true,
                            labels: {
                                redisplay: "Mostrar",
                                all: "Todos",
                                last: "Último"
                            }
                        }
                    });
                    notice1.get().click(function () {
                        notice1.remove();
                    });

                    $('#btnAddProduct').prop('disabled', true);
                },
                onhidden: function () {
                    if (my.iAmAdm) {
                        $('#btnAddProduct').prop('disabled', false);
                        my.iAmAdm = false;
                    } else {
                        if (!my.userInfo.Adm) {
                            return false;
                        }
                    }
                },
                buttons: [{
                    label: 'Fechar',
                    cssClass: 'btn-default btn-flat',
                    action: function (dialogRef) {
                        dialogRef.close();
                    }
                }, {
                    id: 'btnAuthenticate',
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
                                    my.iAmAdm = true;

                                    var notice1 = new PNotify({
                                        title: 'Sucesso!',
                                        text: 'Permissão concedida',
                                        type: 'success',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright
                                    });
                                    notice1.get().click(function () {
                                        notice1.remove();
                                    });

                                    if ($('#lg_once').is(':checked')) {
                                        my.vm.adminPassword(false);
                                    }

                                    $('.bootstrap-dialog').modal('hide');
                                } else {
                                    var notice10 = new PNotify({
                                        title: 'Erro!',
                                        text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                        type: 'warning',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: {
                                                redisplay: "Mostrar",
                                                all: "Todos",
                                                last: "Último"
                                            }
                                        }
                                    });
                                    notice10.get().click(function () {
                                        notice10.remove();
                                    });
                                }
                            } else {
                                var notice11 = new PNotify({
                                    title: 'Erro!',
                                    text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                    type: 'error',
                                    addclass: 'stack-bottomright',
                                    stack: my.stack_bottomright,
                                    history: {
                                        menu: true,
                                        labels: {
                                            redisplay: "Mostrar",
                                            all: "Todos",
                                            last: "Último"
                                        }
                                    }
                                });
                                notice11.get().click(function () {
                                    notice11.remove();
                                });
                            }

                        }).fail(function (jqXHR, textStatus) {
                            console.log(jqXHR.responseText);
                            var notice12 = new PNotify({
                                title: 'Atenção!',
                                text: 'Erro ao tentar completar a ação.',
                                type: 'error',
                                addclass: 'stack-bottomright',
                                stack: my.stack_bottomright,
                                history: {
                                    menu: true,
                                    labels: {
                                        redisplay: "Mostrar",
                                        all: "Todos",
                                        last: "Último"
                                    }
                                }
                            });
                            notice12.get().click(function () {
                                notice12.remove();
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

        $('#productQty').focus();
    });
}