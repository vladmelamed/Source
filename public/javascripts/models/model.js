

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
        _.bindAll(this, 'url', 'pageInfo', 'parse')
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





