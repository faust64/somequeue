describe('test rabbitmq', () => {
	let opts = {
		driver: 'rabbitmq',
		host: process.env.RABBITMQ_HOST || '127.0.0.1',
		port: process.env.RABBITMQ_PORT || 5672,
		user: process.env.RABBITMQ_USER || false,
		pass: process.env.RABBITMQ_PW || false,
		db: process.env.RABBITMQ_EXCHANGE || 'somequeue'
	    };
	const mylib = require('../index.js')(opts);
	it('tests rabbitmq pubsub', (done) => {
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
    /*
	it('tests rabbitmq jobs', (done) => {
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
    */
    });
