'use strict';

$(function () {

    JsBarcode("#imgBarCode", $('#imgBarCode').attr('src'), {
        format: "EAN13",
        displayValue: true,
        fontSize: 24
    });

    $('#price').html(parseFloat($('#price').text()).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));

});
