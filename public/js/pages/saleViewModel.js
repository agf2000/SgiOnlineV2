my.viewModel = function () {

    ko.extenders.decimals = function (target, precision) {
        target(parseFloat(target()));
        var result = ko.computed({
            read: function () {
                return target().toFixed(precision);
            },
            write: target
        });

        result.raw = target;
        return result;
    };

    ko.bindingHandlers.commaDecimalFormatter = {
        init: function (element, valueAccessor) {

            var observable = valueAccessor();

            var interceptor = ko.computed({
                read: function () {
                    return formatWithComma(observable());
                },
                write: function (newValue) {
                    observable(reverseFormat(newValue));
                }
            });

            ko.applyBindingsToNode(element, {
                value: interceptor
            });
        }
    };

    // Formatting Functions
    function formatWithComma(x, precision, seperator) {
        var options = {
            precision: precision || 2,
            seperator: seperator || ','
        };
        var formatted = parseFloat(x, 10).toFixed(options.precision);
        var regex = new RegExp(
            '^(\\d+)[^\\d](\\d{' + options.precision + '})$');
        formatted = formatted.replace(
            regex, '$1' + options.seperator + '$2');
        return formatted;
    }

    function reverseFormat(x, precision, seperator) {
        var options = {
            precision: precision || 2,
            seperator: seperator || ','
        };
        var regex = new RegExp(
            '^(\\d+)[^\\d](\\d+)$');
        var formatted = x.replace(regex, '$1.$2');
        return parseFloat(formatted);
    }

    // product view model
    my.Product = function () {
        var self = this;

        self.productId = ko.observable();
        self.productCode = ko.observable();
        self.itemType = ko.observable();
        self.productName = ko.observable();
        self.productUnit = ko.observable();
        self.discount = ko.observable(0);
        self.price = ko.observable(0);
        self.qTy = ko.observable(0);
        self.qTyStock = ko.observable(0);
        self.totalValue = ko.observable(0);
        self.cost = ko.observable(0);
        self.onSpecial = ko.observable();
        self.onSpecialQty = ko.observable(0);
        self.bulkPrice = ko.observable(0);
        self.bulkDiscountQty = ko.observable(0);
        self.discountOnResale = ko.observable();
        self.discountPrice = ko.observable(0);
        self.saleItemId = ko.observable();
        //self.increaseQuantity = function (quantity) {
        //    self.qTy(self.qTy() + quantity);
        //};
    };

    // knockout js view model
    my.vm = function () {
        // this is knockout view model
        var self = this;

        // view models
        self.storeRules = ko.observableArray([]),
            self.personId = ko.observable(0),
            self.itemType = ko.observable(),
            self.productCode = ko.observable(),
            self.selectedProducts = ko.observableArray([]),
            self.productId = ko.observable(),
            self.productName = ko.observable(),
            self.productUnit = ko.observable(),
            self.unitValue = ko.observable(),
            self.price = ko.observable(),
            self.productQty = ko.observable(),
            self.qTyStock = ko.observable(),
            self.removedItem = ko.observable(0),
            self.saleItems = ko.observableArray([]),
            self.totalDiscount = ko.observable(0.00),
            self.totalPercDiscount = ko.observable(0.00),
            self.totalCash = ko.observable(0.00),
            self.totalCard = ko.observable(0.00),
            self.totalCred = ko.observable(0.00),
            self.adminPassword = ko.observable(true),
            self.allowClose = ko.observable(true),
            self.validateAgain = ko.observable(true),
            self.feePerc = ko.observable(0),
            self.feeValue = ko.observable(0),

            self.editPayment = function (item, event) {

                var $this = $(event.currentTarget);

                my.vm.totalCard(0);
                my.vm.totalCred(0);
                my.vm.totalCash(0);

                switch ($this.attr('value')) {
                    case 'card':
                        my.vm.totalCard(my.vm.totalAmount());
                        //amplify.store.sessionStorage(document.location.host + '_totalPayCard', parseFloat(my.vm.totalAmount()));
                        break;
                    case 'cred':
                        my.vm.totalCred(my.vm.totalAmount());
                        //amplify.store.sessionStorage(document.location.host + '_totalPayCred', parseFloat(my.vm.totalAmount()));
                        break;
                    default:
                        my.vm.totalCash(my.vm.totalAmount());
                    //amplify.store.sessionStorage(document.location.host + '_totalPayCash', parseFloat(my.vm.totalAmount()));
                };

            },

            self.originalPrice = ko.observable(0),

            self.editItem = function (item, event) {

                var $this = $(event.currentTarget);

                if ($this.val() == '1') {

                    if (my.userInfo.DeptBlockedDiscount != '' && item.discount() > 0) {
                        BootstrapDialog.show({
                            title: 'Desconto somente com senha do administrador',
                            message: $('<div></div>').load('/templates/validationForm.html'),
                            onshown: function () {
                                $('#txtPassword').keyup(function (e) {
                                    if (e.keyCode === 13) {
                                        $('.bootstrap-dialog').find('.btn-primary').click();
                                    }
                                });

                                var notice = new PNotify({
                                    title: 'Atenção!',
                                    text: 'O departamento do usuário proíbe descontos!',
                                    type: 'error',
                                    addclass: 'stack-bottomright',
                                    stack: my.stack_bottomright
                                });
                                notice.get().click(function () {
                                    notice1.remove();
                                });
                            },
                            onhidden: function () {
                                if (my.iAmAdm) {
                                    item.qTy(parseFloat(item.qTy()));
                                    item.totalValue((item.price() * item.qTy()) - ((item.price() * item.qTy()) * item.discount() / 100));
                                    my.iAmAdm = false;
                                } else {
                                    item.discount(0);
                                }
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
                                                my.iAmAdm = true;

                                                notice = new PNotify({
                                                    title: 'Sucesso!',
                                                    text: 'Permissão concedida',
                                                    type: 'success',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright,
                                                    history: {
                                                        menu: true,
                                                        labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                                    }
                                                });
                                                notice.get().click(function () {
                                                    notice.remove();
                                                });

                                                $('.bootstrap-dialog').modal('hide');

                                                if ($('#lg_once').is(':checked')) {
                                                    my.vm.adminPassword(false);
                                                }

                                                $this.next('button').addClass('hidden');
                                                $this.html('<span class="glyphicon glyphicon-edit"></span>');
                                                $this.parent().parent().find('input').prop('readonly', true);
                                                $this.removeAttr('value');
                                                originalPrice(0);
                                            } else {
                                                notice = new PNotify({
                                                    title: 'Erro!',
                                                    text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                    type: 'warning',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright,
                                                    history: {
                                                        menu: true,
                                                        labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                                    }
                                                });
                                                notice.get().click(function () {
                                                    notice.remove();
                                                });
                                            }
                                        } else {
                                            notice = new PNotify({
                                                title: 'Erro!',
                                                text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                                type: 'error',
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright,
                                                history: {
                                                    menu: true,
                                                    labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                                }
                                            });
                                            notice.get().click(function () {
                                                notice.remove();
                                            });
                                        }

                                    }).fail(function (jqXHR, textStatus) {
                                        console.log(jqXHR.responseText);
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

                    if (my.userInfo.storeRules.bloqprecomenorquecusto && (item.cost() > item.price())) {
                        new PNotify({
                            title: 'Atenção!',
                            text: 'O preço indicado está abaixo do permitido!',
                            type: 'error',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright
                        });
                        item.price(originalPrice());
                        return false;
                    }

                    if (originalPrice() > 0 && (item.price() < originalPrice()) && (my.userInfo.storeRules.naopermitirreduzirpreco || my.userInfo.storeRules.bloqprecomenorquecusto)) {
                        new PNotify({
                            title: 'Atenção!',
                            text: 'O preço indicado está abaixo do permitido!',
                            type: 'error',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright
                        });
                        item.price(originalPrice());
                    } else {
                        item.qTy(parseFloat(item.qTy()));
                        item.totalValue((item.price() * item.qTy()) - ((item.price() * item.qTy()) * item.discount() / 100));

                        // check for browser storage availability
                        //if (my.storage) {
                        //    amplify.store.sessionStorage(document.location.host + '_products', null);
                        //    amplify.store.sessionStorage(document.location.host + '_products', ko.toJSON(my.vm.selectedProducts()));
                        //}

                        $this.next('button').addClass('hidden');
                        $this.html('<span class="glyphicon glyphicon-edit"></span>');
                        $this.parent().parent().find('input').prop('readonly', true);
                        $this.removeAttr('value');
                        originalPrice(0);
                    }
                } else {

                    if (my.userInfo.storeRules.naopermitirreduzirpreco || my.userInfo.storeRules.bloqprecomenorquecusto) {
                        originalPrice(item.price());
                    }

                    $this.html('<span class="glyphicon glyphicon-ok"></span>');
                    $this.next('button').removeClass('hidden');
                    $this.parent().parent().find('input').removeAttr('readonly');
                    $this.prop('value', '1');
                }

            },

            // function to remove a cart item
            self.removeItem = function () {

                self.removedItem(this.productId());

                // remove the cart item
                self.selectedProducts.remove(this);

                ko.utils.arrayFirst(my.vm.saleItems(), function (item) {
                    if (item) {
                        if (item.productId() === self.removedItem()) self.saleItems.remove(item);
                    }
                });

                // empty storage session
                amplify.store.sessionStorage(document.location.host + '_products', null);

                if (self.selectedProducts().length > 0) {
                    // convert view model selectedProducts to string and add to storage via amplify 
                    amplify.store.sessionStorage(document.location.host + '_products', ko.toJSON(my.vm.selectedProducts()));
                }

                // if there are no more items left on ko view model selectedProducts
                if (my.vm.selectedProducts().length === 0) {
                    my.vm.saleItems([]);
                    //my.vm.totalPercDiscount(0);
                    my.vm.feeValue(0);

                    if (!$('#lblBoxTotal').parent().hasClass('hidden')) {
                        $('#lblBoxTotal').text(0).parent().addClass('hidden');
                    }

                    my.vm.totalCard(0);
                    my.vm.totalCred(0);
                    my.vm.totalCash(0);

                    if (my.userInfo.storeRules.condpagtopadrao != '') {
                        $('#select2PayConditions').select2('val', null);
                        $('#select2PayConditions').append($('<option value="' + parseInt(my.userInfo.storeRules.condpagtopadrao.split(',')[0]) + '" fee="' + parseInt(my.userInfo.storeRules.condpagtopadrao.split(',')[3]) + '" default="true" selected>' + my.userInfo.storeRules.condpagtopadrao.split(',')[1] + '</option>'));
                        $('#select2PayConditions').attr({ 'fee': my.userInfo.storeRules.condpagtopadrao.split(',')[3], 'default': true });
                        $('#select2PayConditions').trigger('change');
                        if (parseFloat(my.userInfo.storeRules.condpagtopadrao.split(',')[3])) {
                            my.vm.feePerc(parseFloat(my.userInfo.storeRules.condpagtopadrao.split(',')[3]));
                        } else {
                            my.vm.feePerc(0);
                        }
                    }

                    $('#selectCCC').val(null);
                    $("#selectCCC option").removeProp('disabled');
                }

            },

            self.cancelItem = function (tem, event) {
                var $this = $(event.currentTarget);
                $this.prev('button').html('<span class="glyphicon glyphicon-edit"></span>');
                $this.addClass('hidden');
                $this.parent().parent().find('input').prop('readonly', true);
            },

            self.blockPayMethod = function (item, event) {
                var payMethods = [],
                    result = false;
                payMethods = JSON.parse(my.userInfo.TiposPagamentos);

                payMethods.find(function (el) {
                    if (el == 5) {
                        result = true;
                    }
                });

                return result;
            },

            self.validPermission = ko.observable(''),
            self.dateDisplay = ko.observable(moment(new Date()).format('DD/MM/YYYY')),
            self.saleId = ko.observable(0);

        // make view models available for apps
        return {
            storeRules: storeRules,
            selectedProducts: selectedProducts,
            personId: personId,
            productCode: productCode,
            itemType: itemType,
            saleItems: saleItems,
            productId: productId,
            productName: productName,
            productUnit: productUnit,
            unitValue: unitValue,
            price: price,
            productQty: productQty,
            qTyStock: qTyStock,
            removeItem: removeItem,
            removedItem: removedItem,
            totalPercDiscount: totalPercDiscount,
            totalDiscount: totalDiscount,
            totalCash: totalCash,
            totalCard: totalCard,
            totalCred: totalCred,
            adminPassword: adminPassword,
            allowClose: allowClose,
            validateAgain: validateAgain,
            saleId: saleId,
            dateDisplay: dateDisplay,
            validPermission: validPermission,
            feePerc: feePerc,
            feeValue: feeValue
        };

    }();

    // compute and format cart's footer with total amounts
    my.vm.extendedPrice = ko.computed(function () {

        // add total variable to memory
        var total = 0;

        // go thru each item in ko view model selectedProducts
        $.each(this.selectedProducts(), function (i, p) {
            total += parseFloat(p.totalValue());
        });

        // return grand total from memory
        return total;

    }, my.vm);

    // compute and format cart's footer with total amounts
    my.vm.totalAmount = ko.computed(function () {

        // add total variable to memory
        var total = my.vm.extendedPrice();

        total = total - my.vm.totalDiscount();

        var client = amplify.store.sessionStorage(document.location.host + "_client");

        if (client != undefined) {
            if (client.convenentDiscount > 0) {
                my.vm.totalDiscount(((total / 100) * parseFloat(client.convenentDiscount)));
            }
        }

        if (my.userInfo.storeRules) {
            if (my.userInfo.storeRules.usardescmaximo) {
                var totalDiscounts = 0,
                    subTotal = 0,
                    grandTotal = 0;
                $.each(my.vm.selectedProducts(), function (i, item) {
                    totalDiscounts += ((parseFloat(item.price()) * parseFloat(item.qTy())) * parseFloat(item.discount()) / 100);
                    grandTotal += (parseFloat(item.price()) * parseFloat(item.qTy()));
                });

                //totalDiscounts = (parseFloat(grandTotal) - parseFloat(subTotal));

                if ((my.userInfo.DeptBlockedDiscount != '' && ((totalDiscounts > 0 || my.vm.totalDiscount() > 0) && (totalDiscounts + my.vm.totalDiscount()) > parseFloat(((my.userInfo.storeRules.descontomaximo * grandTotal) / 100).toFixed(2))))) {
                    if ((!my.userInfo.Adm || my.vm.adminPassword()) && my.vm.selectedProducts().length > 0) {

                        BootstrapDialog.show({
                            title: 'Desconto acima do permitido',
                            message: $('<div></div>').load('/templates/validationForm.html'),
                            onshown: function () {
                                $('#txtPassword').keyup(function (e) {
                                    if (e.keyCode === 13) {
                                        $('.bootstrap-dialog').find('.btn-primary').click();
                                    }
                                });

                                var notice = new PNotify({
                                    title: 'Atenção!',
                                    text: my.userInfo.DeptBlockedDiscount, // + '<br />Não será possível concluir o pedido sem a senha do administrador!',
                                    type: 'error',
                                    addclass: 'stack-bottomright',
                                    stack: my.stack_bottomright,
                                    history: {
                                        menu: true,
                                        labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                    }
                                });
                                notice.get().click(function () {
                                    notice.remove();
                                });
                            },
                            onhidden: function () {
                                if (my.iAmAdm) {
                                    my.vm.validateAgain(false);

                                    my.iAmAdm = false;
                                    var notice1 = new PNotify({
                                        title: 'Sucesso!',
                                        text: 'Permissão concedida',
                                        type: 'success',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                        }
                                    });
                                    notice1.get().click(function () {
                                        notice1.remove();
                                    });
                                } else {
                                    my.vm.validateAgain(true);

                                    var notice2 = new PNotify({
                                        title: 'Atenção!',
                                        text: 'O DAV não poderá ser atualizado.',
                                        type: 'warning',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                        }
                                    });
                                    notice2.get().click(function () {
                                        notice2.remove();
                                    });
                                }
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
                                                my.iAmAdm = true;

                                                $('.bootstrap-dialog').modal('hide');

                                                if ($('#lg_once').is(':checked')) {
                                                    my.vm.adminPassword(false);
                                                }
                                            } else {
                                                var notice3 = new PNotify({
                                                    title: 'Erro!',
                                                    text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                    type: 'warning',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright,
                                                    history: {
                                                        menu: true,
                                                        labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                                    }
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
                                                addclass: 'stack-bottomright',
                                                stack: my.stack_bottomright,
                                                history: {
                                                    menu: true,
                                                    labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                                }
                                            });
                                            notice4.get().click(function () {
                                                notice4.remove();
                                            });
                                        }

                                    }).fail(function (jqXHR, textStatus) {
                                        console.log(jqXHR.responseText);
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
                    if (((totalDiscounts > 0 || my.vm.totalDiscount() > 0) && (totalDiscounts + my.vm.totalDiscount()) > parseFloat(((my.userInfo.storeRules.descontomaximo * grandTotal) / 100).toFixed(2)))) {
                        if ((!my.userInfo.Adm && my.vm.adminPassword()) && (my.vm.selectedProducts().length > 0)) {

                            BootstrapDialog.show({
                                title: 'Autorização',
                                message: $('<div></div>').load('/templates/validationForm.html'),
                                onshown: function () {
                                    $('#txtPassword').keyup(function (e) {
                                        if (e.keyCode === 13) {
                                            $('.bootstrap-dialog').find('.btn-primary').click();
                                        }
                                    });

                                    var notice5 = new PNotify({
                                        title: 'Atenção!',
                                        text: 'O desconto execede o valor máximo permitido.', // Não será possível concluir o pedido sem a senha do administrador!',
                                        type: 'warning',
                                        addclass: 'stack-bottomright',
                                        stack: my.stack_bottomright,
                                        history: {
                                            menu: true,
                                            labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                        }
                                    });
                                    notice5.get().click(function () {
                                        notice5.remove();
                                    });

                                    my.vm.validateAgain(true);

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

                                                    var notice6 = new PNotify({
                                                        title: 'Sucesso!',
                                                        text: 'Permissão concedida',
                                                        type: 'success',
                                                        addclass: 'stack-bottomright',
                                                        stack: my.stack_bottomright,
                                                        history: {
                                                            menu: true,
                                                            labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                                        }
                                                    });
                                                    notice6.get().click(function () {
                                                        notice7.remove();
                                                    });

                                                    $('.bootstrap-dialog').modal('hide');

                                                    if ($('#lg_once').is(':checked')) {
                                                        my.vm.adminPassword(false);
                                                    }

                                                    my.vm.validateAgain(false);
                                                } else {
                                                    var notice7 = new PNotify({
                                                        title: 'Erro!',
                                                        text: 'Sua conta foi autenticada mas não pertence a um administrador.',
                                                        type: 'warning',
                                                        addclass: 'stack-bottomright',
                                                        stack: my.stack_bottomright,
                                                        history: {
                                                            menu: true,
                                                            labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                                        }
                                                    });
                                                    notice7.get().click(function () {
                                                        notice7.remove();
                                                    });
                                                }
                                            } else {
                                                var notice8 = new PNotify({
                                                    title: 'Erro!',
                                                    text: (data.Result.indexOf('error') == 0 ? 'Um erro imprevisto ocorreu. Caso este erro persista, contate o administrador do sistema.<br /><br />' : '') + (data.Msg || data.Result),
                                                    type: 'error',
                                                    addclass: 'stack-bottomright',
                                                    stack: my.stack_bottomright,
                                                    history: {
                                                        menu: true,
                                                        labels: { redisplay: "Mostrar", all: "Todos", last: "Último" }
                                                    }
                                                });
                                                notice8.get().click(function () {
                                                    notice8.remove();
                                                });
                                            }

                                        }).fail(function (jqXHR, textStatus) {
                                            console.log(jqXHR.responseText);
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
                        my.vm.allowClose(true);
                    }
                }
            }
        }

        if (total > 0) {
            if (client !== undefined) {
                if (client.DescontoCliente > 0 && my.saleId <= 0) {
                    if (my.discountApplied) {
                        my.vm.totalDiscount((client.DescontoCliente * my.vm.extendedPrice()) / 100);
                        total = (total - my.vm.totalDiscount());
                        my.discountApplied = false;
                    } else {
                        my.discountApplied = true;
                    }
                }
            }
        }

        //if (my.vm.feeValue() > 0) {
        //    //my.vm.totalCred((parseFloat($('#payCred').val()) - my.vm.feeValue()));
        //    my.vm.totalCred(my.vm.totalCred() + ((my.vm.feePerc() * my.vm.totalCred()) / 100));
        //    $('#lblBoxTotal').text((parseFloat($('#payCred').val()) + my.vm.feeValue()).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })).parent().removeClass('hidden');
        //} else {
        //    //my.vm.totalCred(parseFloat($('#payCred').val()) + my.vm.feeValue());
        //    if (!$('#lblBoxTotal').parent().hasClass('hidden')) {
        //        $('#lblBoxTotal').parent().addClass('hideen');
        //    }
        //}

        // return grand total from memory
        return total;

    }, my.vm);

    ko.applyBindings(my.vm);

};