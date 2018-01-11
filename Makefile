check-test:
	@@if ! test -x ./node_modules/.bin/mocha; then \
	    NODE_ENV=dev npm install; \
	    if ! test -x ./node_modules/.bin/mocha; then \
		echo ERROR: mocha missing >&2; \
		exit 1; \
	    fi; \
	fi

clean-common:
	@@if test -s .gitignore; then \
	    while read pattern; \
		do \
		    if test "$$pattern" = / -o "$$pattern" = '*' -o "$$pattern" = '/*'; then \
			echo "WARNING: suspicous-looking gitignore entry - skipping $$pattern" >&2; \
		    elif echo "$$pattern" | grep '^/' >/dev/null; then \
			rm -fr ".$$pattern"; \
		    else \
			rm -fr "$$pattern"; \
		    fi; \
		done <.gitignore; \
	    echo "NOTICE: done dropping items matching gitignore entries"; \
	fi

clean-npm:
	@@if test -s .npmignore; then \
	    while read pattern; \
		do \
		    if test "$$pattern" = / -o "$$pattern" = '*' -o "$$pattern" = '/*'; then \
			echo "WARNING: suspicous-looking npmignore entry - skipping $$pattern" >&2; \
		    elif echo "$$pattern" | grep '^/' >/dev/null; then \
			rm -fr ".$$pattern"; \
		    else \
			rm -fr "$$pattern"; \
		    fi; \
		done <.npmignore; \
	    echo "NOTICE: done dropping items matching npmignore entries"; \
	fi

prep-test-rabbitmq:
	@@if test "$$RABBITMQ_HOST" != "127.0.0.1" -a "$$RABBITQ_HOST" != "localhost" -a "$$RABBITMQ_HOST"; then \
	    echo "not checking rabbitmq connectivity, as CLI may not be there" >&2; \
	else \
	    if test `id -u` != 0; then \
		if ! sudo rabbitmqctl status >/dev/null 2>&1; then \
		    echo "rabbitmq not available" >&2; \
		    exit 1; \
		elif test "$$RABITMQ_USER" -a "$$RABBITMQ_PW"; then \
		    if ! sudo rabbitmqctl list_users 2>/dev/null | grep ^test >/dev/null; then \
			rabbitmqctl add_user "$$RABBITMQ_USER" "$$RABBITMQ_PW" && \
			    rabbitmqctl set_user_tags "$$RABBITMQ_USER" administrator && \
			    rabbitmqctl set_permissions -p / "$$RABBITMQ_USER" ".*" ".*" ".*"; \
		    fi; \
		fi; \
	    else \
		if ! rabbitmqctl status >/dev/null 2>&1; then \
		    echo "rabbitmq not available" >&2; \
		    exit 1; \
		elif test "$$RABITMQ_USER" -a "$$RABBITMQ_PW"; then \
		    if ! rabbitmqctl list_users 2>/dev/null | grep ^test >/dev/null; then \
			rabbitmqctl add_user "$$RABBITMQ_USER" "$$RABBITMQ_PW" && \
			    rabbitmqctl set_user_tags "$$RABBITMQ_USER" administrator && \
			    rabbitmqctl set_permissions -p / "$$RABBITMQ_USER" ".*" ".*" ".*"; \
		    fi; \
		fi; \
	    fi; \
	fi

prep-test-redis:
	@@if test "$$REDIS_HOST" != "127.0.0.1" -a "$$REDIS_HOST" != "localhost" -a "$$REDIS_HOST"; then \
	    echo "not wiping redis, as CLI may not be there" >&2; \
	else \
	    redis-cli FLUSHALL; \
	fi

prep-test: prep-test-rabbitmq prep-test-redis

unit-test:
	for _t in tests/*.js; \
	    do \
		./node_modules/.bin/mocha --exit $$_t || exit 1; \
	    done

test: check-test prep-test unit-test clean-common
