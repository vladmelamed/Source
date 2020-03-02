
var AppRouter = Backbone.Router.extend({
    routes: {
        "": "home",
        "create": "add",
        ":id/edit": "edit"
    },
    initialize: function () {
        _.bindAll(this);

        this.collection = new SourceList();

        this.headerView = new HeaderView({el: $(".navbar")});

        this.editView = new EditView({el: $("#editForm"), collection: this.collection});

        this.listView = new ListView({el: $("#sourceList"), collection: this.collection});

        this.pageView = new PaginatedView({el: $("#sourcePage"), collection: this.collection});

        this.filterView = new FilterView({el: $("#filterView"), collection: this.collection});
    },
    home: function () {
        this.editView.hideView();
    },
    add: function () {

        this.editView.model = new Source(null, {collection: this.collection});
        this.editView.render();
    },
    edit: function (id) {
        this.editView.model = this.collection.get(id);
        if (this.editView.model) {
            this.editView.render();
        }
    }
});

app.router = new AppRouter();

Backbone.history.start();




