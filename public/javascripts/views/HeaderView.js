var HeaderView = Backbone.View.extend({
    events: {
        "click .create": "onCreate"
    },
    initialize: function () {
        _.bindAll(this);
    },
    onCreate: function () {
        app.router.navigate("create", {trigger: true});
    }
});