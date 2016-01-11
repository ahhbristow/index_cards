describe('Creating a session',function() {

	var session_name;
      
	it('should add a new session and show on the list of my sessions', function() {
		// Add a session in main browser
		session_name = "Demo" + Date.now();
		element(by.id('new_session_name')).sendKeys(session_name);
		element(by.id('add_session')).click();

		// Check that it appears in the list of sessions
		var session_link = element(by.linkText(session_name));
		expect(session_link).not.toBe(null);
	});

	it('should not appear on another users list of sessions', function() {
		browser2.get('http://localhost:4072/');
		var session_link = element2(by.linkText(session_name));
		expect(session_link).not.toBe(null);
	});
});


describe('Loading of a session with existing cards', function() {

	var session_name;
	var session_url;

	beforeAll(function() {
		browser.get('http://localhost:4072/');
		
		// Create a session
		session_name = "Demo" + Date.now();
		element(by.id('new_session_name')).sendKeys(session_name);
		element(by.id('add_session')).click();
		
		// Go to that session
		var session_link = element(by.linkText(session_name));
		session_link.getAttribute('href').then(function(attr) {
			session_url = attr;
		});
		
		browser.actions().mouseMove(session_link).click().perform();
	});

	it('should show the session name in the first browser',function() {
		expect(element(by.id('session_name')).getText()).toEqual(session_name);
	});

	it('should add a question card in the first browser',function() {
		element(by.id("question")).click();
		var cards = element.all(by.repeater('card in session.cards'));
		expect(cards.count()).toEqual(1);
	});

	//TODO: Should these tests have their own set up?
	it('should load the session in the second browser',function() {
		browser2.get(session_url);
		
		// Check the correct number of cards have appeared
		var cards = element2.all(by.repeater('card in session.cards'));
		expect(cards.count()).toEqual(1);
		
		// Check we're on the session by reading the <h1> tag
		expect(element(by.id('session_name')).getText()).toEqual(session_name);
	});
});
