const Promise = require('bluebird');
const logger = require('wraplog')('redis-pubsub');

module.exports = (topic, what, remoteHost, remotePort, dbId, logPw) => {
	return new Promise((resolve, reject) => {
		let watchFor = false;
		try {
		    remotePort = remotePort || 6379;
		    remoteHost = remoteHost || '127.0.0.1';
		    dbId = dbId || 0;
		    const redis = require('redis');
		    if (what !== 'subscriber') {
			if (logPw !== undefined && logPw !== false) {
			    this._publisher = redis.createClient(remotePort, remoteHost, { db: dbId, auth_pass: logPw });
			} else { this._publisher = redis.createClient(remotePort, remoteHost, { db: dbId }); }
			this._publisher.on('error', (e) => {
				logger.error(e || 'undefined publisher error');
				reject('publisher error caught');
			    });
			watchFor = this._publisher;
		    }
		    if (what !== 'publisher') {
			if (logPw !== undefined && logPw !== false) {
			    this._subscriber = redis.createClient(remotePort, remoteHost, { db: dbId, auth_pass: logPw });
			} else { this._subscriber = redis.createClient(remotePort, remoteHost, { db: dbId }); }
			this._subscriber.on('error', (e) => {
				logger.error(e || 'undefined subscriber error');
				reject('subscriber error caught');
			    });
			watchFor = this._subscriber;
		    }
		    this._topic = topic || 'somequeue';
		} catch(e) {
		    logger.error(e || 'undefined pubsub error');
		    reject('redis pubsub initialization error');
		}
		let self = this;

		watchFor.on('connect', () => {
			resolve({
				publish: (msg) => {
					self._publisher.publish(self._topic, typeof msg === 'string' ? msg : JSON.stringify(msg));
				    },
				subscribe: (fn) => {
					if (typeof fn !== 'function') {
					    self._subscriber.on('message', (chan, msg) => logger.info(msg));
					} else { self._subscriber.on('message', (chan, msg) => fn(msg)); }
					self._subscriber.subscribe(self._topic);
				    }
			    });
		    });
	});
    };
