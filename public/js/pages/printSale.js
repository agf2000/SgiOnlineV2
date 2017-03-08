'use strict';

$(function () {

    kendo.pdf.defineFont({
        "DejaVu Sans": "http://cdn.kendostatic.com/2014.3.1314/styles/fonts/DejaVu/DejaVuSans.ttf",
        "DejaVu Sans|Bold": "http://cdn.kendostatic.com/2014.3.1314/styles/fonts/DejaVu/DejaVuSans-Bold.ttf",
        "DejaVu Sans|Bold|Italic": "http://cdn.kendostatic.com/2014.3.1314/styles/fonts/DejaVu/DejaVuSans-Oblique.ttf",
        "DejaVu Sans|Italic": "http://cdn.kendostatic.com/2014.3.1314/styles/fonts/DejaVu/DejaVuSans-Oblique.ttf"
    });

    /*my.saleId = my.getQuerystring('numDav', my.getStringParameterByName('numDav'));

    if (amplify.store.sessionStorage(document.location.host + "_user_loggedin") > 0) {

        my.userInfo = JSON.parse(amplify.store.sessionStorage(document.location.host + "_user"));

        my.admin = my.userInfo.Adm;

        $('.overlay').remove();

        $.get('/dnn/desktopmodules/sgi/api/services/UserAuthenticated', function (auth) {
            if (auth) {
                amplify.store.sessionStorage(document.location.host + "_storeRules", auth);

                my.viewModel();

                if (my.saleId > 0) {
                    $.ajax({
                        type: 'POST',
                        url: '/dnn/desktopmodules/sgi/api/sales/PrintSGISale?saleId=' + my.saleId + '&sgiId=' + my.userInfo.SGIID
                    }).done(function (data) {
                        if (data) {
                            if (data.NumDav > 0) {
                                DataVenda(new Date(data.DataVenda).toLocaleString());
                                DescontoPerc('% ' + parseFloat(Math.round(data.DescontoPerc * 100) / 100).toFixed(2));
                                DescontoValor(data.DescontoValor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                                NumDav(my.padLeft(parseInt(data.NumDav), 10));
                                Observacao(data.Observacao);
                                SaleItems(data.SaleItems);
                                ValorCartao(data.ValorCartao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                                ValorCrediario(data.ValorCrediario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                                ValorDinheiro(data.ValorDinheiro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                                ValorTotal(data.ValorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                                NumDoc(my.padLeft(Math.max(0, parseInt(data.NumDoc)), 6));
                                Nome(data.NomeCliente);
                                Fantasia(data.FantasiaCliente);
                                NomeStatus(data.NomeStatus);
                                Vendedor(data.Vendedor);
                                CondPagto(data.CondPagto);
                                Operadora(data.Operadora);
                                Cnpj(data.Cnpj);
                                TelefoneCliente(data.TelefoneCliente);
                                TelefoneEmpresa(data.TelefoneEmpresa);
                                EnderecoEmpresa(data.EnderecoEmpresa);
                                EnderecoCliente(data.EnderecoCliente);
                                Empresa(data.Empresa);
                                EmailEmpresa(data.EmailEmpresa);
                                Cpf_Cnpj(data.Cpf_Cnpj);
                            }
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
                        var notice1 = new PNotify({
                            title: 'Atenção!',
                            text: 'Erro ao buscar o dav. Mais informações no log do navegador',
                            type: 'error',
                            animation: 'none',
                            addclass: 'stack-bottomright',
                            stack: my.stack_bottomright
                        });
                        notice1.get().click(function () {
                            notice1.remove();
                        });
                    });
                }
            }
        });
    }*/

    $(".export-pdf").click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        e.preventDefault();

        var $btn = $(this);
        $btn.text('Um momento...');

        // Convert the DOM element to a drawing using kendo.drawing.drawDOM
        kendo.drawing.drawDOM($("#printableDiv"))
            .then(function (group) {
                // Render the result as a PDF file
                return kendo.drawing.exportPDF(group, {
                    paperSize: "auto",
                    margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" }
                });
            })
            .done(function (data) {
                // Save the PDF file
                kendo.saveAs({
                    dataURI: data,
                    fileName: "DAV_" + my.saleId + ".pdf",
                    proxyURL: "//demos.telerik.com/kendo-ui/service/export"
                });

                $btn.text('Salvar como PDF');
            });
    });
});

function pdfMe() {
    var quotes = document.querySelector('#printableDiv');

    html2canvas(quotes, {
        onrendered: function (canvas) {

            //! MAKE YOUR PDF
            var pdf = new jsPDF('p', 'pt', 'letter');

            for (var i = 0; i <= quotes.clientHeight / 970; i++) {
                //! This is all just html2canvas stuff
                var srcImg = canvas;
                var sX = 0;
                var sY = 970 * i; // start 980 pixels down for every new page
                var sWidth = 900;
                var sHeight = 970;
                var dX = 0;
                var dY = 0;
                var dWidth = 900;
                var dHeight = 970;

                window.onePageCanvas = document.createElement("canvas");
                onePageCanvas.setAttribute('width', 900);
                onePageCanvas.setAttribute('height', 970);
                var ctx = onePageCanvas.getContext('2d');
                // details on this usage of this function: 
                // https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images#Slicing
                ctx.drawImage(srcImg, sX, sY, sWidth, sHeight, dX, dY, dWidth, dHeight);

                // document.body.appendChild(canvas);
                var canvasDataURL = onePageCanvas.toDataURL("image/png", 1.0);

                var width = onePageCanvas.width;
                var height = onePageCanvas.clientHeight;

                //! If we're on anything other than the first page,
                // add another page
                if (i > 0) {
                    pdf.addPage(612, 791); //8.5" x 11" in pts (in*72)
                }
                //! now we declare that we're working on that page
                pdf.setPage(i + 1);
                //! now we add content to that page!
                pdf.addImage(canvasDataURL, 'PNG', 20, 1, (width * .84), (height * .82));

            }
            //! after the for loop is finished running, we save the pdf.
            pdf.save('Test.pdf');
        }
    });
}

//function pdfMe() {

//    var table = document.querySelector('#printableDiv');

//    html2canvas(table, { background: '#ffffff' }).then(function (canvas) {

//        var image = new Image();
//        image.src = canvas.toDataURL('image/png');

//        var doc = new jsPDF();
//        doc.addImage(image, 'PNG', 15, 0);
//        //doc.text('Documento não fiscal', 0, 200);
//        doc.save('DAV_' + my.saleId);

//    });    
//}

function printMe() {
    window.print();
}