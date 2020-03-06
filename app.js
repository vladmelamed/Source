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


// in memory Model "source"
var tgs = ["#server","#workstation","#Printer","#public","#private","#Floor1","#Floor2","#Floor3"];
var names = ["office","conference room","kitchen","IT room","server room","common area","webinar","Small meeting room"];
var t = []; //test SOURCE data array

for (var i=0;i<100;i++) {
    var it1 = Math.floor(Math.random() * 3); //generate random tags
    var it2 = it1 + 1 + Math.floor(Math.random() * 3);
    var it3 = Math.floor(Math.random() * 9);

  t[i] = {_id:'idee'+i,ip:"192.168.1."+i,
    name:names[it3],
    domain:"source.test"+i+".project",
    username:"username_"+i,
    password:"password_"+i,
    addDate:new Date(new Date(). getTime() - 86400000*(i*2)), // ml seconds in one day
    updateDate: new Date(new Date(). getTime() - 86400000*i),
    tags:[tgs[it1],tgs[it2]]
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


//loads uniq tags
app.get('/tags', function (req, res, next) {
  var arr = []; var uniq = {};
  t.forEach(function (val,ind) {
    val.tags.forEach(function(v,i){
      if (!uniq[v])
      {
        uniq[v]= v;
        arr.push(v);
      }
    });
  });
  res.json(arr);
});

//loads uniq ips
app.get('/ips', function (req, res, next) {
  var arr = [];
  t.forEach(function (val,ind) {
    arr.push(val["ip"]);
  });
  res.json(arr);
});

//loads all with pagination and filtering
app.get('/source', function (req, res, next) {

  var page = Number(req.query.page);
  var perPage = Number(req.query.perPage);
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
      if (result && (filterTags.length > 0)) {
        result = val["tags"].join(" ").indexOf(filterTags) > -1;
      }
      if (result) tt.push(val);
    });
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

  var source = {};
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
