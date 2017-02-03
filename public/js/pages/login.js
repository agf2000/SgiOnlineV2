$(function () {

    amplify.store.sessionStorage(document.location.host + "user", null);
    amplify.store.sessionStorage(document.location.host + "user_loggedin", null);

    var returnUrl = getQuerystring('next', getParameterByName('next'));

    $('#sgiLoginTextBox').keyup(function (e) {
        if (e.target.value.length > 1) {
            $('#sgiPasswordTextBox').focus();
        }
    });

    $('#sgiLoginTextBox').focusin(function (e) {
        $('#sgiLoginTextBox').val(null);
    });

    $('#sgiPasswordTextBox').keypress(function (e) {
        if (e.which == 13) {
            $('#btnDoSGILogin').click();
        }
    });

    $('#btnDoSGILogin').click(function (e) {
        if (e.clientX === 0) {
            return false;
        }
        // e.preventDefault();

        var $this = $(this);
        $this.html("Um momento...").attr('disabled', true);

        return;
    });

    $('#sgiLoginTextBox').focus();

});

var getQuerystring = function (key, default_) {
    if (default_ == null) default_ = "";
    key = key.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
    var qs = regex.exec(window.location.href);
    if (qs == null)
        return default_;
    else
        return qs[1];
};

var getParameterByName = function (name) {
    var sURL = window.document.URL.toString();
    if (sURL.indexOf(name) > -1) {
        return parseInt(sURL.split(name + '/')[1]);
    }
    else {
        return 0;
    }
};