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

build:
	@./node_modules/loader/bin/build views .

start: install build
	@nohup ./node_modules/.bin/pm2 start app.js --name "gaoqiblog" -i max --node-args="--max-old-space-size=300" >> gaoqi-blog.log 2>&1 &

restart: install build
	@nohup ./node_modules/.bin/pm2 restart "gaoqiblog" >> gaoqi-blog.log 2>&1 &

reboot:
	@nohup ./node_modules/.bin/pm2 restart "gaoqiblog" >> gaoqi-blog.log 2>&1 &
.PHONY: install build start restart reboot