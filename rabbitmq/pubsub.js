const Promise = require('bluebird');
const logger = require('wraplog')('rabbitmq-pubsub');

module.exports = (topic, what, exchange, remoteHost, remotePort, remoteUser, remotePass) => {
	return new Promise((resolve, reject) => {
		let open = remote = false;
		try {
		    remotePort = remotePort || 5672;
		    remoteHost = remoteHost || '127.0.0.1';
		    if (remoteUser !== undefined && remoteUser !== false && remotePass !== undefined && remotePass !== false) {
			remote = `amqp://${remoteUser}:${remotePass}@${remoteHost}:${remotePort}`;
		    } else { remote = `amqp://${remoteHost}:${remotePort}`; }
		    this._topic = topic || 'somequeue';
		    open = require('amqplib').connect(remote);
		} catch(e) {
		    logger.error(e || 'undefined pubsub error');
		    reject(e || 'undefined pubsub error');
		}
		let self = this;

		open.then((conn) => conn.createChannel())
		    .then((ch) => {
			    return ch.assertQueue(this._topic)
				.then((ok) => {
					this._channel = ch;
					resolve({
						publish: (msg) => {
							let buf = new Buffer(typeof msg === 'string' ? msg : JSON.stringify(msg));
							self._channel.sendToQueue(self._topic, buf);
						    },
						subscribe: (fn) => {
							if (typeof fn !== 'function') {
							    self._channel.consume(self._topic, (msg) => {
								    logger.info(msg.content.toString())
								    self._channel.ack(msg);
								});
							} else {
							    self._channel.consume(self._topic, (msg) => {
								    fn(msg.content.toString(), ((e) => {
									    if (e === undefined) {
										self._channel.ack(msg);
									    }
									}));
								});
							}
						    }
					    });
				    })
			})
	    });
    };
