$(function () {

    if (!amplify.store.sessionStorage(document.location.host + "_user_loggedin")) {
        $.getJSON('/api/getUserInfo', function (data, textStatus, jqXHR) {
            if (textStatus === 'success') {
                amplify.store.sessionStorage(document.location.host + "_user", JSON.stringify(data[0]));
                amplify.store.sessionStorage(document.location.host + "_user_loggedin", data[0].sgiid);
            }
        });
        // window.location.href = '/login?next=' + window.location.pathname;
    }

});