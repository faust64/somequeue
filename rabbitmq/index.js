const logger = require('wraplog')('rabbitmq-handler');

module.exports = (remoteHost, remotePort, exchange, logUser, logPw) => {
	this._remotePort = remotePort || 5672;
	this._remoteHost = remoteHost || '127.0.0.1';
	this._logUser = logUser || false;
	this._logPw = logPw || false;
	this._exchange = exchange || 'somequeue';

	let self = this;
	return {
		pubsub: (topic, what) => {
			what = what || 'both';
			return require('./pubsub.js')(topic, what, self._exchange, self._remoteHost, self._remotePort, self._logUser, self._logPw);
		    }
	    };
    };
