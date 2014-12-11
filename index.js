var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var path = require('path');
var fs = require('fs');

var imagePath = '/Volumes/steve/phototest';
var host = null;
var port = null;

app.use('/vendor', express.static(__dirname + '/vendor'));
app.use('/photos', express.static(imagePath));

app.use(express.static(__dirname + '/public'));

io.on('connection', function(socket) {
  console.log('socket connected!');
  var sent = [];
  var to = setInterval(function() {
    fs.readdir(imagePath, function(err, files) {
      if(err) throw err;

      files = _.difference(files, sent);

      urls = _.chain(files)
        .filter(function(file) { return path.basename(file)[0] != '.'; })
        .map(function(file) { 
          return "http://" + host + ":" + port + "/photos/" + path.basename(file);
        })
        .value();

      if(urls.length) 
        socket.emit('addImages', urls);

      sent = sent.concat(files);
    });

  }, 2000);
});

var server = http.listen(3000, function () {

  host = server.address().address
  port = server.address().port

  console.log('App listening at http://%s:%s', host, port)

})
