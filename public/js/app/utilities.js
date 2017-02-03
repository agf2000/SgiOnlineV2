var my = {}; //my namespace

function doesDataSourceHaveChanges(ds) {
    var dirty = false;

    $.each(ds._data, function () {
        if (this.dirty === true) {
            dirty = true;
        }
    });

    if (ds._destroyed.length > 0) dirty = true;

    return dirty;
}

/* remove border around all input elements */
if (navigator.userAgent.toLowerCase().indexOf("chrome") >= 0) {
    $(window).load(function () {
        $('input:-webkit-autofill').each(function () {
            var text = $(this).val();
            var id = $(this).attr('id');
            $(this).after(this.outerHTML).remove();
            $('input[id=' + id + ']').val(text);
        });
    });
}

my.isNumberKey = function (evt) {
    var charCode = (evt.which) ? evt.which : event.keyCode
    if (charCode > 31 && (charCode < 43 || charCode > 57))
        return false;

    return true;
};

my.isValidEmailAddress = function (emailAddress) {
    var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    return pattern.test(emailAddress);
};

my.formatPhone = function (phonenum) {
    //return text.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    var regexObj = /^(?:\+?1[-. ]?)?(?:\(?([0-9]{2})\)?[-. ]?)?([0-9]{4})[-. ]?([0-9]{4})$/;
    if (regexObj.test(phonenum)) {
        var parts = phonenum.match(regexObj);
        var phone = "";
        if (parts[1]) {
            phone += "(" + parts[1] + ") ";
        }
        phone += parts[2] + "-" + parts[3];
        return phone;
    } else {
        //invalid phone number
        return phonenum;
    }
};

my.encodeSlash = function (str) {
    var urlEncodeForwardSlashedRegExp = new RegExp("/", "gi");
    str = str.replace(urlEncodeForwardSlashedRegExp, "%2F");
    return str;
};

/**
 * Format postal code
 */

my.formatPostalcode = function (pcode) {
    var regexObj = /^\d{5}$|^\d{5}\-\d{}$/;
    if (regexObj.test(parseInt(pcode))) {
        var parts = pcode.match(regexObj);
        var pc = parts[1] + " " + parts[3];
        return pc.toUpperCase();
    } else {
        return pcode;
    }
};

my.getQuerystring = function (key, default_) {
    if (default_ == null) default_ = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (qs == null)
        return default_;
    else
        return qs[1];
};

my.getStringParameterByName = function (name) {
    var sURL = window.document.URL.toString();
    if (sURL.indexOf(name) > -1) {
        return sURL.split(name + '/')[1];
    } else {
        return '';
    }
};

my.getParameterByName = function (name) {
    var sURL = window.document.URL.toString();
    if (sURL.indexOf(name) > -1) {
        return parseInt(sURL.split(name + '/')[1]);
    } else {
        return 0;
    }
};

my.getTopParameterByName = function (name) {
    var sURL = window.top.document.URL.toString();
    if (sURL.indexOf(name) > -1) {
        return parseInt(sURL.split(name + '/')[1]);
    } else {
        return 0;
    }
};

my.formatCurrency = function (value) {
    return "R$ " + value.toFixed(2);
};

my.formatPercent = function (value) {
    return value.toFixed(2) + ' %';
};

my.Left = function (str, n) {
    if (n <= 0)
        return "";
    else if (n > String(str).length)
        return str;
    else
        return String(str).substring(0, n) + ' ...';
};

my.Right = function (str, n) {
    if (n <= 0)
        return "";
    else if (n > String(str).length)
        return str;
    else {
        var iLen = String(str).length;
        return String(str).substring(iLen, iLen - n);
    }
};


my.pmt = function (rate, per, nper, pv, fv) {

    fv = parseFloat(fv);

    nper = parseFloat(nper);

    pv = parseFloat(pv);

    per = parseFloat(per);

    if ((per === 0) || (nper === 0)) {

        alert("Why do you want to test me with zeros?");

        return (0);

    }

    rate = eval((rate) / (per * 100));

    if (rate === 0) // Interest rate is 0

    {

        pmt_value = -(fv + pv) / nper;

    } else {

        x = Math.pow(1 + rate, nper);

        pmt_value = -((rate * (fv + x * pv)) / (-1 + x));

    }

    pmt_value = my.conv_number(pmt_value, 2);

    return (parseFloat(pmt_value));

};

my.conv_number = function (expr, decplaces) { // This function is from David Goodman's Javascript Bible.

    var str = "" + Math.round(eval(expr) * Math.pow(10, decplaces));

    while (str.length <= decplaces) {

        str = "0" + str;

    }

    var decpoint = str.length - decplaces;

    return (str.substring(0, decpoint) + "." + str.substring(decpoint, str.length));

};

my.scorePassword = function (pass) {
    var score = 0;
    if (!pass)
        return score;

    // award every unique letter until 5 repetitions
    var letters = new Object();
    for (var i = 0; i < pass.length; i++) {
        letters[pass[i]] = (letters[pass[i]] || 0) + 1;
        score += 4.9 / letters[pass[i]];
    }

    // bonus points for mixing it up
    var variations = {
        digits: /\d/.test(pass),
        lower: /[a-z]/.test(pass),
        upper: /[A-Z]/.test(pass),
        nonWords: /\W/.test(pass),
    };

    var variationCount = 0;
    for (var check in variations) {
        variationCount += (variations[check] === true) ? 1 : 0;
    }
    score += (variationCount - 1) * 10;

    return parseInt(score);
};

my.checkPassStrength = function (pass) {
    var score = my.scorePassword(pass);
    if (score > 80)
        return "Exceletente!";
    if (score > 60)
        return "Compatível, e boa.";
    if (score >= 30)
        return "Compatível, porém fraca.";

    return "Senha Não Compatível.";
};

my.size_format = function (bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return 'n/a';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[[i]];
};

my.endsWith = function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

// Feature detect + local reference
my.storage;
var fail,
    uid;
try {
    uid = new Date;
    (my.storage = window.localStorage).setItem(uid, uid);
    fail = my.storage.getItem(uid) != uid;
    my.storage.removeItem(uid);
    fail && (my.storage = false);
} catch (e) {};

// kendo dataSource sorting parameterMap command convertion
my.convertSortingParameters = function (original) {
    if (original) {
        var sortIndex;
        var converted = "";
        for (sortIndex = 0; sortIndex < original.length; sortIndex += 1) {
            if (sortIndex > 0) {
                converted += ", ";
            }
            converted += original[sortIndex].field + " " + original[sortIndex].dir;
        }
        return converted;
    }
};

my.stripEndQuotes = function (s) {
    var t = s.length;
    if (s.charAt(0) == '"') s = s.substring(1, t--);
    if (s.charAt(--t) == '"') s = s.substring(0, t);
    return s;
}

my.createObject = function (value) {
    var str = $('<div/>').html(value).text();
    var obj = str.substring(1, str.length - 2);;
    return $('<' + obj + '/>');
};

//create a in-memory div, set it's inner text(which jQuery automatically encodes)
//then grab the encoded contents back out.  The div never exists on the page.
my.htmlDecode = function (value) {
    return $('<div/>').html(value).text();
};

my.htmlEncode = function (value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
};

// HtmlHelpers Module
// Call by using my.htmlHelpers.getQueryStringValue("myname");
my.htmlHelpers = function () {
    return {
        // Based on http://stackoverflow.com/questions/901115/get-query-string-values-in-javascript
        getQueryStringValue: function (name) {
            var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        }
    };
}();

// StringHelpers Module
// Call by using StringHelpers.padLeft("1", "000");
my.stringHelpers = function () {
    return {
        // Pad string using padMask.  string '1' with padMask '000' will produce '001'.
        padLeft: function (string, padMask) {
            string = '' + string;
            return (padMask.substr(0, (padMask.length - string.length)) + string);
        }
    };
}();

my.padLeft = function (str, max) {
    str = str.toString();

    function main(str, max) {
        return str.length < max ? main("0" + str, max) : str;
    }
    return main(str, max);
};

String.prototype.padLeft = function padLeft(length, leadingChar) {
    if (leadingChar === undefined) leadingChar = "0";
    return this.length < length ? (leadingChar + this).padLeft(length, leadingChar) : this;
};

Date.prototype.addSeconds = function (seconds) {
    this.setDate(this.getSeconds() + seconds);
    return this;
};

Date.prototype.addMinutes = function (minutes) {
    this.setDate(this.getMinutes() + minutes);
    return this;
};

Date.prototype.addDays = function (days) {
    this.setDate(this.getDate() + days);
    return this;
};

Date.prototype.addMonths = function (months) {
    this.setDate(this.getMonth() + months);
    return this;
};

Date.prototype.addYears = function (years) {
    this.setDate(this.getFullYear() + years);
    return this;
};

my.daysBetween = function (date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
    return Math.round(difference_ms / ONE_DAY);
};

my.setHours = function (date, days, nhr, nmin, nsec) {
    var d, s;
    d = date;
    d = date.addDays(days);
    d.setHours(nhr, nmin, nsec);
    s = "Current setting is " + d.toLocaleString();
    return (d);
};

String.prototype.strip = function () {
    var translate_re = /[úõôóíêéçãâáàÚÕÔÓÍÊÉÇÃÁÀÂ]/g;
    var translate = {
        "À": "A",
        "Á": "A",
        "Ã": "A",
        "Â": "A",
        "Ç": "C",
        "É": "E",
        "Ê": "E",
        "Í": "I",
        "Ó": "O",
        "Ô": "O",
        "Õ": "O",
        "Ú": "U",
        "à": "a",
        "á": "a",
        "â": "a",
        "ã": "a",
        "ç": "c",
        "é": "e",
        "ê": "e",
        "í": "i",
        "ó": "o",
        "ô": "o",
        "õ": "o",
        "ú": "u"
    };
    return (this.replace(translate_re, function (match) {
        return translate[match];
    }));
};

// file encoding must be UTF-8!
my.getTextExtractor = function () {
    return (function () {
        var patternLetters = /[úõôóíêéçãâáàÚÕÔÓÍÊÉÇÃÁÀÂ]/g;
        var patternDateDmy = /^(?:\D+)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/;
        var lookupLetters = {
            "À": "A",
            "Á": "A",
            "Ã": "A",
            "Â": "A",
            "Ç": "C",
            "É": "E",
            "Ê": "E",
            "Í": "I",
            "Ó": "O",
            "Ô": "O",
            "Õ": "O",
            "Ú": "U",
            "à": "a",
            "á": "a",
            "â": "a",
            "ã": "a",
            "ç": "c",
            "é": "e",
            "ê": "e",
            "í": "i",
            "ó": "o",
            "ô": "o",
            "õ": "o",
            "ú": "u"
        };
        var letterTranslator = function (match) {
            return lookupLetters[match] || match;
        }

        return function (node) {
            var text = $.trim($(node).text());
            var date = text.match(patternDateDmy);
            if (date)
                return [date[3], date[2], date[1]].join("-");
            else
                return text.replace(patternLetters, letterTranslator);
        }
    })();
};

my.generateUUID = function () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
};

jQuery.fn.getCheckboxVal = function () {
    var vals = [];
    this.each(function () {
        vals.push(parseInt(jQuery(this).val()));
    });
    return vals;
};

my.stack_bottomright = {
    "dir1": "up",
    "dir2": "left",
    "firstpos1": 25,
    "firstpos2": 25
};
my.stack_bottomleft = {
    "dir1": "up",
    "dir2": "right",
    "firstpos1": 25,
    "firstpos2": 25
};
my.stack_topleft = {
    "dir1": "down",
    "dir2": "right",
    "push": "top"
};
my.stack_topright = {
    "dir1": "down",
    "dir2": "left",
    "firstpos1": 25,
    "firstpos2": 25
};

var ValidationUtility = function () {
    var validationElements = $('[data-role="validate"]');
    var elementCount;

    validationElements.popover({
        placement: 'top',
        trigger: 'manual'
    });

    validationElements.on('invalid', function () {
        if (elementCount === 0) {
            $('#' + this.id).addClass('invalid');
            $('#' + this.id).popover('show');
            elementCount++;
        }
    });

    validationElements.on('blur', function () {
        $('#' + this.id).removeClass('invalid');
        $('#' + this.id).popover('hide');
    });

    var validate = function (formSelector) {
        elementCount = 0;

        if (formSelector.indexOf('#') === -1) {
            formSelector = '#' + formSelector;
        }

        return $(formSelector)[0].checkValidity();
    };

    return {
        validate: validate
    };
};

my.minmax = function (value, min, max) {
    if (parseInt(value) < 0 || isNaN(value))
        return 0;
    else if (parseInt(value) > 100)
        return 100;
    else return value;
};

window.downloadFile = function (sUrl) {

    //iOS devices do not support downloading. We have to inform user about this.
    if (/(iP)/g.test(navigator.userAgent)) {
        alert('Your device does not support files downloading. Please try again in desktop browser.');
        return false;
    }

    //If in Chrome or Safari - download via virtual link click
    if (window.downloadFile.isChrome || window.downloadFile.isSafari) {
        //Creating new link node.
        var link = document.createElement('a');
        link.href = sUrl;

        if (link.download !== undefined) {
            //Set HTML5 download attribute. This will prevent file from opening if supported.
            var fileName = sUrl.substring(sUrl.lastIndexOf('/') + 1, sUrl.length);
            link.download = fileName;
        }

        //Dispatching click event.
        if (document.createEvent) {
            var e = document.createEvent('MouseEvents');
            e.initEvent('click', true, true);
            link.dispatchEvent(e);
            return true;
        }
    }

    // Force file download (whether supported by server).
    if (sUrl.indexOf('?') === -1) {
        sUrl += '?download';
    }

    window.open(sUrl, '_self');
    return true;
}

my.zeroPad = function (num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
};

window.downloadFile.isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
window.downloadFile.isSafari = navigator.userAgent.toLowerCase().indexOf('safari') > -1;

my.formatVersion = function (version) {
    var html = '';
    if (version > 0) {
        html = version.toString().substring(0, 1) + '.' + version.toString().substring(1, 2) + '.' + version.toString().substring(2, 3) + '.' + version.toString().substring(3, 4);
    }

    return html;
};

function escapeRegExp(string) {
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
};

my.replaceAll = function (string, find, replace) {
    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
};

my.stripHtml = function (html) {
    var tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

my.symbolsToEntities = function (sText) {
    var sNewText = "";
    var iLen = sText.length;
    for (i = 0; i < iLen; i++) {
        iCode = sText.charCodeAt(i);
        sNewText += (iCode > 256 ? "&#" + iCode + ";" : sText.charAt(i));
    }
    return sNewText;
};

my.popupwindow = function (url, title, w, h) {
    var left = (screen.width / 2) - (w / 2);
    var top = (screen.height / 2) - (h / 2);
    var openWindow = window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left, true);
    openWindow.document.title = title;
    return openWindow;
};

my.getStateName = function (s) {
    var stateName = '';
    switch (s.toUpperCase()) {
        case "AC":
            stateName = "Acre"
            break;
        case "AL":
            stateName = "Alagoas"
            break;
        case "AP":
            stateName = "Amapá"
            break;
        case "AM":
            stateName = "Amazonas"
            break;
        case "BA":
            stateName = "Bahia"
            break;
        case "CE":
            stateName = "Ceará"
            break;
        case "DF":
            stateName = "Distrito Federal"
            break;
        case "ES":
            stateName = "Espírito Santo"
            break;
        case "GO":
            stateName = "Goiás"
            break;
        case "MA":
            stateName = "Maranhão"
            break;
        case "MT":
            stateName = "Mato Grosso"
            break;
        case "MS":
            stateName = "Mato Grosso do Sul"
            break;
        case "MG":
            stateName = "Minas Gerais"
            break;
        case "PA":
            stateName = "Pará"
            break;
        case "PB":
            stateName = "Paraíba"
            break;
        case "PR":
            stateName = "Paraná"
            break;
        case "PE":
            stateName = "Pernambuco"
            break;
        case "PI":
            stateName = "Piauí"
            break;
        case "RJ":
            stateName = "Rio de Janeiro"
            break;
        case "RN":
            stateName = "Rio Grande do Norte"
            break;
        case "RS":
            stateName = "Rio Grande do Sul"
            break;
        case "RO":
            stateName = "Rondônia"
            break;
        case "RR":
            stateName = "Roraima"
            break;
        case "SC":
            stateName = "Santa Catarina"
            break;
        case "SP":
            stateName = "São Paulo"
            break;
        case "SE":
            stateName = "Sergipe"
            break;
        case "TO":
            stateName = "Tocantins"
            break;
        default:

    }
    return stateName;
}

my.validaCPF = function (cpf) {

    var cboll = true;

    if (cpf != undefined) {
        strCPF = cpf.replace(/[^\d]+/g, '');
        var Soma;
        var Resto;
        Soma = 0;

        if (strCPF.length != 11)
            cboll = false;

        for (i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
        Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11)) Resto = 0;
        if (Resto != parseInt(strCPF.substring(9, 10))) cboll = false;

        Soma = 0;
        for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
        Resto = (Soma * 10) % 11;

        if ((Resto == 10) || (Resto == 11)) Resto = 0;
        if (Resto != parseInt(strCPF.substring(10, 11))) cboll = false;
    }

    return cboll;

}

my.validaCnpj = function (str) {

    if (str != undefined) {
        str = str.replace(/[^\d]+/g, '');
        cnpj = str;
        var numeros, digitos, soma, i, resultado, pos, tamanho, digitos_iguais;
        digitos_iguais = 1;
        if (cnpj.length < 14 && cnpj.length < 15)
            return false;
        for (i = 0; i < cnpj.length - 1; i++)
            if (cnpj.charAt(i) != cnpj.charAt(i + 1)) {
                digitos_iguais = 0;
                break;
            }
        if (!digitos_iguais) {
            tamanho = cnpj.length - 2
            numeros = cnpj.substring(0, tamanho);
            digitos = cnpj.substring(tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0))
                return false;
            tamanho = tamanho + 1;
            numeros = cnpj.substring(0, tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2)
                    pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1))
                return false;
            return true;
        } else
            return false;
    } else
        return false;
}

//{ 'Tipo': 9, 'Nome': 'OUTROS' },
//{ 'Tipo': 10, 'Nome': 'WHATSAPP' },
//{ 'Tipo': 11, 'Nome': 'CONTATOS' },
//{ 'Tipo': 1, 'Nome': 'PRINCIPAL' },
//{ 'Tipo': 2, 'Nome': 'FAX' },
//{ 'Tipo': 3, 'Nome': 'TRABALHO' },
//{ 'Tipo': 4, 'Nome': 'COBRANÇA' },
//{ 'Tipo': 5, 'Nome': 'FAX TRABALHO' },
//{ 'Tipo': 6, 'Nome': 'FAX COBRANÇA' },
//{ 'Tipo': 7, 'Nome': 'CELULAR' },
//{ 'Tipo': 8, 'Nome': 'OUTRO' }

my.getPhoneType = function (type) {
    var result = '';
    switch (type) {
        case 9:
            result = 'OUTROS';
            break;
        case 10:
            result = 'WHATSAPP';
            break;
        case 11:
            result = 'CONTATOS';
            break;
        case 2:
            result = 'FAX';
            break;
        case 3:
            result = 'TRABALHO';
            break;
        case 4:
            result = 'COBRANÇA';
            break;
        case 5:
            result = 'FAX TRABALHO';
            break;
        case 6:
            result = 'FAX COBRANÇA';
            break;
        case 7:
            result = 'CELULAR';
            break;
        case 8:
            result = 'OUTRO';
            break;
        default:
            result = 'PRINCIPAL'
    }
    return result;
}

my.availableColors = [
    '#ADFF2F', '#ADD8A6', '#FAEBD7', '#FF8A80', '#D1C4E9', '#C5CAE9', '#BBDEFB', '#B2DFDB', '#C8E6C9', '#CCFF90', '#F4FF81', '#FFE0B2', '#FFAB91', '#CFD8DC', '#E0E0E0'
];

function removeCurrency(strValue) {
    var value = strValue;
    if (value === "") {
        value = 0;
    } else {
        value = value.replace(".", "");
        value = value.replace(",", ".");
        value = value.replace('R', '');
        value = value.replace('$', '');
        value = parseFloat(value);
    }
    return value;
}

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

////retornará 1234.53
//function formatNumber(value) {
//    value = convertToFloatNumber(value);
//    return value.formatMoney(2, '.', '');
//}

////retornará 1.234,53
//function formatNumber(value) {
//    value = convertToFloatNumber(value);
//    return value.formatMoney(2, ',', '.');
//}

////retornará 1,234.53
//function formatNumber(value) {
//    value = convertToFloatNumber(value);
//    return value.formatMoney(2, '.', ',');
//}

//transforma a entrada em número float
var convertToFloatNumber = function (value) {
    value = value.toString();
    if (value.indexOf('.') !== -1 && value.indexOf(',') !== -1) {
        if (value.indexOf('.') < value.indexOf(',')) {
            //inglês
            return parseFloat(value.replace(/,/gi, ''));
        } else {
            //português
            return parseFloat(value.replace(/./gi, '').replace(/,/gi, '.'));
        }
    } else {
        return parseFloat(value);
    }
}

//prototype para formatar a saída  
Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};