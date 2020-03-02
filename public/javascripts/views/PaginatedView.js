var PaginatedView = Backbone.View.extend({
    tmpl: _.template($("#tmpl-pageview").html()),
    initialize: function() {
        _.bindAll(this, 'previous', 'next', 'render');
        this.collection.bind('refresh', this.render);
        this.listenTo(this.collection, 'reset', this.render);
    },
    events: {
        'click a.prev': 'previous',
        'click a.next': 'next'
    },
    render: function() {
        this.$el.empty();
        this.$el.html(this.tmpl(this.collection.pageInfo()));
    },

    previous: function() {
        this.collection.previousPage();
        return false;
    },

    next: function() {
        this.collection.nextPage();
        return false;
    }
});
