const Promise = require('bluebird');
const Queue = require('bee-queue');
const logger = require('wraplog')('redis-jobs');

module.exports = (topic, what, remoteHost, remotePort, dbId, logPw) => {
	return new Promise((resolve, reject) => {
		let watchFor = false;
		try {
		    remotePort = remotePort || 6379;
		    remoteHost = remoteHost || '127.0.0.1';
		    dbId = dbId || 0;
		    this._topic = topic || 'somequeue';
		    if (what !== 'worker') {
			if (logPw !== undefined && logPw !== false) {
			    this._scheduler = new Queue(this._topic, { removeOnSuccess: true, isWorker: false, redis: { dbId: dbId, port: remotePort, host: remoteHost, auth_pass: logPw }});
			} else { this._scheduler = new Queue(this._topic, { removeOnSuccess: true, isWorker: false, redis: { dbId: dbId, port: remotePort, host: remoteHost }}); }
			this._scheduler.on('error', (e) => {
				logger.error(e || 'undefined scheduler error');
				reject('scheduler error caught');
			    });
			watchFor = this._scheduler;
		    }
		    if (what !== 'scheduler') {
			if (logPw !== undefined && logPw !== false) {
			    this._worker = new Queue(this._topic, { removeOnSuccess: true, isWorker: true, redis: { dbId: dbId, port: remotePort, host: remoteHost, auth_pass: logPw }});
			} else { this._worker = new Queue(this._topic, { removeOnSuccess: true, isWorker: true, redis: { dbId: dbId, port: remotePort, host: remoteHost }}); }
			this._worker.on('error', (e) => {
				logger.error(e || 'undefined worker error');
				reject('worker error caught');
			    });
			watchFor = this._worker;
		    }
		} catch(e) {
		    logger.error(e || 'undefined jobs error');
		    reject('redis jobs initialization error');
		}
		let self = this;

		watchFor.on('ready', () => {
			resolve({
				setHandler: (fn) => {
					self._worker.process((task, done) => {
						if (task.data.what === self._topic) {
						    if (typeof fn === 'function') {
							if (task.data.doparse === true) {
							    fn(JSON.parse(task.data.jobdata), done);
							} else { fn(task.data.jobdata, done); }
						    } else {
							logger.info('should process job:');
							logger.info(task.data.jobdata);
							done();
						    }
						}
					    });
				    },
				schedule: (data) => {
					if (typeof data === 'string') {
					    return self._scheduler.createJob({ what: self._topic, doparse: false, jobdata: data }).save()
					} else {
					    return self._scheduler.createJob({ what: self._topic, doparse: true, jobdata: JSON.stringify(data) }.save())
					}
				    }
			    });
		    });
	    });
    };
