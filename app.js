"use strict";

var express = require('express'),
    http = require('http'),
    path = require('path');//,
//mongoose = require('mongoose');

var app = module.exports =express();

// Configuration

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

// Model "source"

var t = []; //test SOURCE data array

for (var i=0;i<100;i++) {
  t[i] = {_id:'idee'+i,ip:"192.168.1."+i, name:"name_"+i,domain:"domain_"+i,username:"username_"+i,password:"password_"+i,
    addDate:new Date(new Date(). getTime() + 86400000*i), // ml seconds in one day
    updateDate: new Date((new Date(new Date(). getTime() + 86400000*i)).getTime()+86400000*i/2),
    tags:"tag_"+i+"\r\n"+"tag_"+(i+2)
  };
}

//help function
function copy(from,to) {
  to.ip = from.ip;
  to.name = from.name;
  to.domain = from.domain;
  to.username = from.username;
  to.password = from.password;
  to.addDate = from.addDate;
  to.updateDate = from.updateDate;
  to.tags = from.tags;
}

// Routes

//loads all with pagination and filtering
app.get('/source', function (req, res, next) {

  var page = new Number(req.query.page);
  var perPage = new Number(req.query.perPage);
  var filterName = req.query.filterName.toString();
  var filterIP = req.query.filterIP.toString();
  var filterTags = req.query.filterTags.toString();


  console.log("get sourcelist");

  //filtering implementation
  var tt = t;
  if (filterIP.length+filterName.length+filterTags.length > 0) {
    tt = [];
    console.log("filterName= "+filterName);
    t.forEach(function (val,ind) {
      var result = true;
      if (filterName.length>0)
        result = val["name"].indexOf(filterName)>-1;
      if (result && (filterIP.length > 0))
        result = val["ip"].indexOf(filterIP)>-1;
      if (result && (filterTags.length > 0))
        result = val["tags"].indexOf(filterTags)>-1;
      if (result) tt.push(val);
    })
    console.log("tt= "+tt.length);
  }

  //pagination implementation
  var ex = [];
  for (var e=((page-1)*perPage);(e<tt.length && (ex.length<perPage));e++){
    ex.push(tt[e]);
  }
  var r = {models:ex,page : page,perPage:perPage,total:tt.length,filterName:filterName,filterIP:filterIP};
  res.json(r);
});

//read
app.get('/source/:id', function (req, res, next) {
  console.log("get source : " + req.params.id);
  var err =true;
  t.forEach(function (data,ind){
    if (t[ind]._id==req.params.id) {
      err = false;
      res.json(t[ind]);
    }
  });
  if (err) return next(err);

});

//add
app.post('/source', function (req, res, next) {
  console.log("post source : " + req.body.content);

  var source = new Object();
  copy(req.body,source);
  source._id = 'idee'+t.length;
  t.push (source);

  res.json(source);

});


//edit
app.put('/source/:id', function (req, res, next) {
  console.log("put source : " + req.params.id);
  console.log(req.body.content);
  t.forEach(function (data,ind){
    if (t[ind]._id==req.params.id) {
      copy(req.body,t[ind]);
      res.json(t[ind]);
    }
  });
});

//delete
app.del('/source/:id', function (req, res, next) {
  console.log("delete source :: " + req.params.id);

  var index = -1;
  t.forEach(function (data,ind){
    if (t[ind]._id==req.params.id) {
      index=  ind;
    }
  });
  var data = t[index];
  t.splice(index, 1); //delete from permanent storage
  res.json(data);
});

http.createServer(app).listen(3000, function () {
  console.log("Express server listening on port %d in %s mode", app.settings.port, app.settings.env);
});
