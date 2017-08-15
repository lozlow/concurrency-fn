.PHONY: bootstrap test test-watch test-coverage

BIN = ./node_modules/.bin

node_modules: package-lock.json package.json
	npm install
	touch node_modules

test: node_modules
	NODE_ENV=test $(BIN)/tape test.js

test-watch:
	NODE_ENV=test nodemon --watch test.js --watch index.js --exec "make test | $(BIN)/tap-notify"

test-coverage:
	$(BIN)/nyc make test
