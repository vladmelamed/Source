
  "use strict";

  var app = {};

  var Source = Backbone.Model.extend({
    idAttribute: "_id",
    defaults: {
      "ip":"",
      "name":"",
      "domain":"", //optional
      "username":"",// string (required)
      "password":"", // string (required) (should not be shown in clear text and should be entered twice)
      "addDate"    : new Date(),// when source was added datetime, (automatically generated)
      "updateDate" : new Date(), //, (automatically updated)
      "tags" : ""
    },
    urlRoot: '/source',
    validate: function (attributes) {
      if (attributes.ip === "" || attributes.name === "" || attributes.username === "" || attributes.password === "") {
        return "name, ip, username and password must be not empty.";
      }

    }
  });

  //Backbone.PagedCollection
  var SourceList = Backbone.Collection.extend({

    initialize: function() {
      //_.bindAll(this, 'parse', 'url', 'pageInfo', 'nextPage', 'previousPage');
      _.bindAll(this, 'url', 'pageInfo', 'parse');
      this.page = 1;
      typeof(this.perPage) != 'undefined' || (this.perPage = 25);
      typeof(this.filterIP) != 'undefined' || (this.filterIP = "");
      typeof(this.filterName) != 'undefined' || (this.filterName = "");
      typeof(this.filterTags) != 'undefined' || (this.filterTags = "");
    },
    fetch: function(options) {
      typeof(options) != 'undefined' || (options = {});
      this.trigger("fetching");
      var self = this;
      var success = options.success;
      options.success = function(resp) {
        self.trigger("fetched");
        if(success) { success(self, resp); }
      };
      return Backbone.Collection.prototype.fetch.call(this, options);
    },
    pageInfo: function() {
      var info = {
        total: this.total,
        page: this.page,
        perPage: this.perPage,
        pages: Math.ceil(this.total / this.perPage),
        prev: false,
        next: false
      };
      var max = Math.min(this.total, this.page * this.perPage);
      if (this.total == this.pages * this.perPage) {
        max = this.total;
      }
      info.range = [(this.page - 1) * this.perPage + 1, max];
      if (this.page > 1) {
        info.prev = this.page - 1;
      }
      if (this.page < info.pages) {
        info.next = this.page + 1;
      }
      return info;
    },

    parse: function(resp) {
      this.page = resp.page;
      this.perPage = resp.perPage;
      this.total = resp.total;
      return resp.models;
    },

    model: Source,
    url: function() {
      //return this.baseUrl + '?' + $.param({page: this.page, perPage: this.perPage});
      return '/source?' + $.param({page: this.page, perPage: this.perPage,filterIP:this.filterIP,filterName:this.filterName,filterTags:this.filterTags});
    },

      filter:function(filterIP,filterName,filterTags) {
          if (this.filterIP.toString()==filterIP.toString() && (
              this.filterName.toString()==filterName.toString()
          ) && (
              this.filterTags.toString()==filterTags.toString()
          ))
              return false; //ignoring

          this.filterIP = filterIP;
          this.filterName = filterName;
          this.filterTags = filterTags;
          this.page = 1;
          return this.fetch({reset:true});
      },
    nextPage: function() {
      if (!this.pageInfo().next) {
        return false;
      }
      this.page = this.page + 1;
      return this.fetch({reset:true});
    },
    previousPage: function() {
      if (!this.pageInfo().prev) {
        return false;
      }
      this.page = this.page - 1;
      return this.fetch({reset:true});
    }
  });





  var EditView = Backbone.View.extend({
    events: {
      "click #saveBtn": "onSave",
      "click #cancelBtn": "hideView"
    },
    initialize: function () {
      _.bindAll(this);

        var self = this;
        self.ipList = [];
        $.get('/ips', {}, function(result){
            self.ipList = result;
        });
        this.myIP = "";

        this.$ip = $("#editForm [name='ip']");
      this.$ip.mask('099.099.099.099');
      this.$name = $("#editForm [name='name']");
      this.$domain = $("#editForm [name='domain']");
      this.$username = $("#editForm [name='username']");
      this.$password = $("#editForm [name='password']");
      this.$password1 = $("#editForm [name='password1']");
      this.$addDate = $("#editForm [name='addDate']");
      this.$updateDate = $("#editForm [name='updateDate']");
      this.$tags = $("#editForm [name='tags']");
    },
    render: function () {
      this.$ip.val(this.model.get("ip"));
        this.myIP = this.model.get("ip"); // for edits
      this.$name.val(this.model.get("name"));
      this.$domain.val(this.model.get("domain"));
      this.$username.val(this.model.get("username"));
      this.$password.val(this.model.get("password"));
      this.$addDate.val(this.model.get("addDate"));
      this.$updateDate.val(this.model.get("updateDate"));
      this.$tags.val(this.model.get("tags"));
      this.$el.show();
      window.scrollTo(0,0);
    },
    onSave: function () {
      var _this = this;
      if (this.$ip.val()=="" || this.$name.val()=="") {
          alert("Name and IP address can't be empty");
          return;
      }
      if (!(this.myIP==this.$ip.val())) {  //new ip
          var iip = this.$ip.val().trim();
          if (this.ipList.indexOf(iip)>-1){
              alert("IP address should be unique. You entered the existing address.");
              return;
          }
      }
     if (this.$password.val()=="" || this.$password1.val()=="" || (!(this.$password.val() == this.$password1.val()))) {
            alert("Please retype the password second time");
            return;
        }
      this.model.save(
          {
            ip:this.$ip.val(),
            name:this.$name.val(),
            domain:this.$domain.val(),
            username:this.$username.val(),
            password:this.$password.val(),
            addDate:this.$addDate.val(),
            updateDate:this.$updateDate.val(),
            tags:this.$tags.val()
          }
          ).done(function () {
        _this.collection.add(_this.model, {merge: true});
      });
      this.hideView();
    },
    hideView: function () {
      this.$el.hide();
      app.router.navigate("", {trigger: true});
    }
  });

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
//  Backbone.history.start({pushState: true, root:"/app/"});

