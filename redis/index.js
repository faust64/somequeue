const logger = require('wraplog')('redis-handler');

module.exports = (remoteHost, remotePort, dbId, logPw) => {
	this._remotePort = remotePort || 6379;
	this._remoteHost = remoteHost || '127.0.0.1';
	this._dbId = dbId || 0;

	let self = this;
	return {
		jobs: (topic, what) => {
			what = what || 'both';
			return require('./jobs.js')(topic, what, self._remoteHost, self._remotePort, self._dbId, logPw || false);
		    },
		pubsub: (topic, what) => {
			what = what || 'both';
			return require('./pubsub.js')(topic, what, self._remoteHost, self._remotePort, self._dbId, logPw || false);
		    }
	    };
    };
