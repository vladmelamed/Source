var ListView = Backbone.View.extend({

    initialize: function () {
        this.listenTo(this.collection, "add", this.addItemView);
        this.listenTo(this.collection, 'reset', this.render);
        var _this = this;
        this.collection.fetch({reset: true}).done(function () {
            _this.render();
        });
    },
    render: function () {
        this.$el.empty();
        this.collection.each(function (item) {
            this.addItemView(item);
        }, this);
        return this;
    },
    addItemView: function (item) {
        this.$el.append(new ItemView({model: item}).render().el);
    }
});
