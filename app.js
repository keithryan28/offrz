var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

process.env['user_api'] = '*********';
process.env['user_key'] = '*********';


var routes = require('./routes');
var api = require('./routes/api');

var multer = require('multer');

var users = require('./routes/user');

var mongo = require('mongodb');

// Get the MongoClient Object
var mongoClient = mongo.MongoClient;

// Connect to the db. The callback function will be passed two arguments: err - which
// will contain error information, and db - which will contain a connection to the
// mongodb Database
mongoClient.connect("mongodb://localhost:27017/Offrz", function(err, db) {
  if(!err) {
    console.log("We are connected");
    // Store the connection to the mongodb database on the aplication object
    // under the name db so that I can access in another file
    app.set('db', db);
}
else {
    throw err;
}
});

var multerOptions = {
  dest: './public/images/uploads/',
  rename: function(fieldname, filename) {
    return filename+"_"+Date.now();
  }
};

var app = express();

var server = app.listen(process.env.PORT || 8080, function(){
    console.log('listening on port 8080');
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon());
app.use(logger('dev'));

app.use(express.urlencoded());


app.use(express.cookieParser('mongodb'));
app.use(express.session());


app.use(multer(multerOptions));

app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

app.use('/', routes);

app.get('/uploadtest', routes.uploadtest);
app.post('/uploadImageTest', routes.uploadImageTest);

//app.get('/sendEmail', routes.sendEmail);

app.get('/', routes.welcome);
app.get('/login', routes.login);
app.post('/processLogin', routes.processLogin);
app.get('/users', users.list);
app.get('/register', routes.register);
app.get('/registerUser', routes.registerUser);
app.post('/processRegUser', routes.processRegUser);
app.get('/registerBus', routes.registerBus);
app.post('/processRegBus', routes.processRegBus);
app.get('/homeUser', routes.homeUser);
app.get('/busProfileFromUser', routes.busProfileFromUser);
app.get('/profileUser', routes.profileUser);
app.get('/search', routes.search);
app.get('/singlePost', routes.singlePost);
app.get('/editProfile', routes.editProfile);
app.post('/processEditProfile', routes.processEditProfile);
app.get('/logout', routes.logout);

app.get('/homeBusUser', routes.homeBusUser);
app.get('/busPost', routes.busPost);
app.get('/busProfile', routes.busProfile);
app.get('/editBusProfileFromBus', routes.editBusProfileFromBus);
app.post('/processEditBusProfileFromBus', routes.processEditBusProfileFromBus);
app.get('/editBusPost', routes.editBusPost);
app.post('/deletePost', routes.deletePost);

app.post('/processUpdatedPost', routes.processUpdatedPost);

app.get('/adminHome', routes.adminHome);
app.get('/adminAccounts', routes.adminAccounts);
app.get('/adminUsers', routes.adminUsers);
app.get('/postFromAdmin', routes.postFromAdmin);
app.post('/processPostFromAmin', routes.processPostFromAmin);
app.post('/deletePostFromAdmin', routes.deletePostFromAdmin);
app.get('/accFromAdmin', routes.accFromAdmin);
app.get('/userFromAdmin', routes.userFromAdmin);
app.post('/updateUserProfileFromAdmin', routes.updateUserProfileFromAdmin);
app.post('/deleteUserFromAdmin', routes.deleteUserFromAdmin);
app.post('/editAccFromAdmin', routes.editAccFromAdmin);
app.post('/deleteAccFromAdmin', routes.deleteAccFromAdmin);


app.get('/gps', routes.gps);

app.get('/processGps', routes.processGps);



//app.get('/findBusinessIdsInFollowingArray', routes.findBusinessIdsInFollowingArray);
app.get('/listOfBusinesses', routes.listOfBusinesses);
app.get('/listOfOffers', routes.listOfOffers);
app.post('/follow', api.follow);
app.post('/like', api.like);
app.post('/checkEmail', api.checkEmail);
app.post('/api/saveGPSData', api.saveGPSData);
app.post('/incrementClickCount', api.incrementClickCount);
app.post('/incrementViewCount', api.incrementViewCount);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
    app.locals.pretty = true;

}

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
        res.render('error', {
        message: err.message,
        error: {}
    });

});


module.exports = app;
