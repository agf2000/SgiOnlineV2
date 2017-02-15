my.viewModel = function () {

    // knockout js view model
    my.vm = function () {
        // this is knockout view model
        var self = this;

        // view models
        self.nextClient = ko.observable(),
        self.prevClient = ko.observable(),
        self.personId = ko.observable(0),
        self.personType = ko.observable('F');

        // make view models available for apps
        return {
            personId: personId,
            personType: personType,
            nextClient: nextClient,
            prevClient: prevClient
        };

    }();

    ko.applyBindings(my.vm);

};