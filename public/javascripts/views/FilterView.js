var FilterView = Backbone.View.extend({
    tmpl: _.template($("#tmpl-filterview").html()),
    initialize: function() {
        _.bindAll(this, 'clear', 'render');
        this.collection.bind('refresh', this.render);
        this.listenTo(this.collection, 'reset', this.render);

    },
    events: {
        'click a.clear': 'clear',
        "change #ipFilter": "changeFilter",
        "change #nameFilter": "changeFilter",
        "change #tagsFilter": "changeFilter",
    },
    render: function() {
        this.$el.empty();
        this.$el.html(this.tmpl(this.collection));
    },

    changeFilter: function() {
        this.collection.filter($("#ipFilter").val(),$("#nameFilter").val(),$("#tagsFilter").val());
        return false;
    },

    clear: function() {
        this.collection.filter("","","");
        return false;
    }
});