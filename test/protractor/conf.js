exports.config = {
	specs: ['test.js'],
	onPrepare: function() {
		// Fork a new browser instance
		browser2 = browser.forkNewDriverInstance();

		// Login as 'master' with first browser	
		browser.get('http://localhost:4072/');
		element(by.id('new_username')).sendKeys("ci_user_master");
		element(by.id('new_password')).sendKeys("password");
		element(by.id('register')).click();
		element(by.id('username')).sendKeys("ci_user_master");
		element(by.id('password')).sendKeys("password");
		element(by.id('login')).click();
		
		// Register and login as 'slave' with second browser
		browser2.get('http://localhost:4072/');
		element2 = browser2.element;
		element2(by.id('new_username')).sendKeys("ci_user_slave");
		element2(by.id('new_password')).sendKeys("password");
		element2(by.id('register')).click();
		element2(by.id('username')).sendKeys("ci_user_slave");
		element2(by.id('password')).sendKeys("password");
		element2(by.id('login')).click();
	},
	onComplete: function(exitCode) {
		browser2.quit();
	}
};
