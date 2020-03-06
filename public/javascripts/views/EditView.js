

var EditView = Backbone.View.extend({
    events: {
        "click #saveBtn": "onSave",
        "click #cancelBtn": "hideView",
        "click #saveTag": "OnSaveTag",
    },
    initialize: function () {
        _.bindAll(this);

        var self = this;
        //unieq ips to check input against
        self.ipList = [];
        $.get('/ips', {}, function(result){
            self.ipList = result;
        });
        this.myIP = "";
        //tagsCollection to recomend for autocomplete
        self.tagsList = [] ;
        $.get('/tags', {}, function(result){
            self.tagsList = result;
        });

        this.$ip = $("#editForm [name='ip']");
        this.$ip.mask('099.099.099.099');
        this.$name = $("#editForm [name='name']");
        this.$domain = $("#editForm [name='domain']");
        this.$username = $("#editForm [name='username']");
        this.$password = $("#editForm [name='password']");
        this.$password1 = $("#editForm [name='password1']");
        this.$addDate = $("#editForm [name='addDate']");
        this.$updateDate = $("#editForm [name='updateDate']");
        this.$tags = $("#tagslist");
        this.$inputTag = $("#inputTag");
    },
    render: function () {
        var self = this;
        this.$ip.val(this.model.get("ip"));
        this.myIP = this.model.get("ip"); // for edits
        this.$name.val(this.model.get("name"));
        this.$domain.val(this.model.get("domain"));
        this.$username.val(this.model.get("username"));
        this.$password.val(this.model.get("password"));
        this.$addDate.val(new Date(this.model.get("addDate")).toLocaleDateString());
        this.$updateDate.val(new Date(this.model.get("updateDate")).toLocaleDateString());
        this.$tags.empty();
        var arr = this.model.get("tags");
        arr.forEach(function(v,i){
            self.$tags.append("<li data='"+v+"'>"+v+"<span onclick='this.parentElement.parentElement.removeChild(this.parentElement)' class=\"close\">x</span></li>");
        });
        this.$el.show();
        autocomplete(document.getElementById("inputTag"), self.tagsList);
        window.scrollTo(0,0);
    },
    OnSaveTag:function () {
        if (this.$inputTag.val().length<2) {
            alert("The tag is too small!");
            return;
        }
        var Tags = [];
        var v = this.$inputTag.val().toLowerCase();
        this.$tags.find("li").each(function(){Tags.push($(this).attr("data"));});
        if (Tags.indexOf(v)>-1) {
            alert("You already have such tag!");
            return;
        }
        this.$tags.append("<li data='"+v+"'>"+v+"<span onclick='this.parentElement.parentElement.removeChild(this.parentElement)' class=\"close\">x</span></li>");
        this.$inputTag.val("");
    },
    onSave: function () {

        //validations
        var _this = this;
        if (this.$ip.val().trim()=="" || this.$name.val().trim()=="") {
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

        //collecting tags from UI
        var newsTags = [];
        this.$tags.find("li").each(function(){newsTags.push($(this).attr("data"));});

        this.model.save(
            {
                ip:this.$ip.val(),
                name:this.$name.val(),
                domain:this.$domain.val(),
                username:this.$username.val(),
                password:this.$password.val(),
                updateDate: new Date(),  //last update data
                tags:newsTags // new tags
            }
        ).done(function () {
            _this.collection.add(_this.model, {merge: true});
            $.get('/tags', {}, function(result){  //refreshing list of tags from server
                _this.tagsList = result;
            });

        });
        this.hideView();
    },
    hideView: function () {
        this.$el.hide();
        app.router.navigate("", {trigger: true});
    }
});





