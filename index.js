const valid = [ 'rabbitmq', 'redis' ];

module.exports = (opts) => {
	opts = opts || { driver: 'redis' };
	if (opts.driver === 'redis') {
	    const redis = require('./redis/index.js');
	    return redis(opts.host || '127.0.0.1', opts.port || 6379, opts.db || 0, opts.pass || false);
	} else if (opts.driver === 'rabbitmq') {
	    const rabbitmq = require('./rabbitmq/index.js');
	    return rabbitmq(opts.host || '127.0.0.1', opts.port || 5672, opts.db || 'somequeue', opts.user || false, opts.pass || false);
	}
	return new Error(`unsupported Queue driver ${opts.driver}`);
    };
