TESTS = $(shell find test -type f -name "*.test.js")
TEST_TIMEOUT = 10000
MOCHA_REPORTER = spec
NPM_REGISTRY = ""

preinstall:
	@if ! test -f config.js; then \
		cp config.default.js config.js; \
	fi
	@if ! test -d public/upload; then \
		mkdir public/upload; \
	fi

install: preinstall
	@npm install $(NPM_REGISTRY)

test: install preinstall
	@NODE_ENV=test ./node_modules/mocha/bin/mocha \
		--reporter $(MOCHA_REPORTER) \
		-r should \
		-r test/env \
		--timeout $(TEST_TIMEOUT) \
		$(TESTS)

test-cov cov: install preinstall
	@NODE_ENV=test node \
		node_modules/.bin/istanbul cover --preserve-comments \
		./node_modules/.bin/_mocha \
		-- \
		-r should \
		-r test/env \
		--reporter $(MOCHA_REPORTER) \
		--timeout $(TEST_TIMEOUT) \
		$(TESTS)

build:
	@./node_modules/loader/bin/build views .

start: install build
	@nohup ./node_modules/.bin/pm2 start app.js --name "gaoqiblog" -i max --node-args="--max-old-space-size=300" >> gaoqi-blog.log 2>&1 &

restart: install build
	@nohup ./node_modules/.bin/pm2 restart "gaoqiblog" >> gaoqi-blog.log 2>&1 &

reboot:
	@nohup ./node_modules/.bin/pm2 restart "gaoqiblog" >> gaoqi-blog.log 2>&1 &
.PHONY: install build start restart reboot