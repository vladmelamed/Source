var ItemView = Backbone.View.extend({
    tmpl: _.template($("#tmpl-itemview").html()),
    events: {
        "click .edit": "onEdit",
        "click .delete": "onDelete"
    },
    initialize: function () {
        _.bindAll(this);
        this.listenTo(this.model, "change", this.render);
        this.listenTo(this.model, "destroy", this.onDestroy);
    },
    onEdit: function () {
        app.router.navigate(this.model.get("_id") + "/edit", {trigger: true});
    },
    onDelete: function () {
        this.model.destroy();
    },
    onDestroy: function () {
        this.remove();
    },
    render: function () {
        this.$el.html(this.tmpl(this.model.toJSON()));
        return this;
    }
});