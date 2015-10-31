var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


// ====== DB initialise =======

var mongoose = require('mongoose');
var mongo_uri = process.env.MONGOLAB_URI;
mongoose.connect(mongo_uri, function(err) {
	if(err) {
		console.log('connection error', err);
	} else {
		console.log('connection successful');
	}
});


// ===== Initialise app =======

var app = express();
var server = require('http').createServer(app);  

// Load models
var Session = require(__dirname + '/models/session.js');
var User = require(__dirname + '/models/user.js');

// ===== Configuring Passport ====
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

app.use(require('express-session')({
	    secret: 'billythefish',
	    resave: false,
	    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Configure Socket IO
var io = require('socket.io')(server);
io.set('transports', ['websocket']);


// View engine setup.  Uses EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static', express.static('public'));


// Set up a httpserver on port 4072
var port = process.env.PORT || 4072;
server.listen(port); 

// Load routes
var routes = require('./routes/sessions')(passport);
app.use('/', routes);












/* =========== Other functions ============== */

/*
 * app.sync_session
 *
 * Write the entire session object to the DB
 */
app.sync_session = function(session_id) {

	var session_details = app.locals.sessions[session_id];
	Session.findByIdAndUpdate(session_id, session_details, function (err, updated_session) {
		if (err) return next(err);

		io.emit('sync', {
			"session_id": session_id,
			"session": session_details
		});
	});
}

// Init empty array of sessions
app.locals.sessions = [];

// ======== Handlers ===============


// Receive socket connection
io.on('connection', function(client) {  
	console.log('Client connected...');


	// Get the session from DB and story in memory 
	client.on('join', function(data) {
		var session_id = data.session_id;
		client.join(session_id);
		Session.findById(session_id, function (err, session_details) {
			if (err) return next(err);
			app.locals.sessions[session_id] = session_details
		});
	});

	// Client will send a move_end message once
	// dragging has stopped.  We sync at this point
	client.on('move_end', function(data) {
		var session_id = data.session_id;
		app.sync_session(session_id);
	});

	// Update the session 
	client.on('move', function(data) {
		app.locals.sessions[data.session_id] = data.session_details;
		client.broadcast.emit('sync', {
			"session_id": data.session_id,
			"session": data.session_details
		});
	});

});


/* =========== Error Handling ================ */

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		console.log(err.stack )
		console.log(err);
	console.trace();
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: err
	});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {}
	});
});


module.exports = app;
