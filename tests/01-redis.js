describe('test redis', () => {
	let opts = {
		driver: 'redis',
		host: process.env.REDIS_HOST || '127.0.0.1',
		port: process.env.REDIS_PORT || 6379,
		user: process.env.REDIS_USER || false,
		pass: process.env.REDIS_PW || false,
		db: process.env.REDIS_DB || 0
	    };
	const mylib = require('../index.js')(opts);
	it('tests redis pubsub', (done) => {
		let pubsub = false;
		mylib.pubsub('testtopic')
		    .then((ret) => {
			    pubsub = ret;
			    pubsub.subscribe((msg) => {
				    if (msg === 'everyoneknowsitsbutters') {
					done();
				    } else { done(msg); }
				});
			    setTimeout(() => {
				    pubsub.publish('everyoneknowsitsbutters');
				}, 1000);
			})
		    .catch((e) => done(e || 'undefined error'));
	    });
	it('tests redis jobs', (done) => {
		let jobs = false;
		mylib.jobs('testqueue')
		    .then((ret) => {
			    jobs = ret;
			    jobs.setHandler((jobData, markJobDone) => {
				    markJobDone();
				    if (jobData === 'everyoneknowsitsbutters') {
					done();
				    } else { done(jobData); }
				});
			    setTimeout(() => {
				    jobs.schedule('everyoneknowsitsbutters');
				}, 1000);
			})
		    .catch((e) => done(e || 'undefined error'));
	    });
    });
