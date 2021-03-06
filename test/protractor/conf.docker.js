var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');
var GoogleLoginPage = require('./pages/google_login');
var TestConfig = require('./config/test');

// abstract writing screen shot to a file
var fs = require('fs');
function writeScreenShot(data, filename) {
	var strm = fs.createWriteStream(filename);
	strm.write(new Buffer(data, 'base64'));
	strm.end();
}

exports.config = {
	specs: ['src/google_login.js','src/sessions.js','src/request_participation.js'],
	seleniumAddress: 'http://172.17.0.1:4444/wd/hub',
	onPrepare: function() {

		// Fork a new browser instance
		browser2 = browser.forkNewDriverInstance();
		app_host = "172.17.0.1";

		// Register the browsers for screenshots
		jasmine.getEnv().addReporter(
			new HtmlScreenshotReporter({
				dest: browser.params.screenshot_dir,
				filename: 'index_cards_test_report.html',
				browsers: [browser,browser2]
			})
		);
	

	},

	onComplete: function(exitCode) {
		browser.quit();
		browser2.quit();
		console.log("All tests finished. Cleaning up...");
	}
};
