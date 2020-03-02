

var EditView = Backbone.View.extend({
    events: {
        "click #saveBtn": "onSave",
        "click #cancelBtn": "hideView"
    },
    initialize: function () {
        _.bindAll(this);

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
            alert("Name and IP address can't be empty")
            return;
        }
        if (this.$password.val()=="" || this.$password1.val()=="" || (!(this.$password.val() == this.$password1.val()))) {
            alert("Please retype the password second time")
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





