SHELL := /bin/bash
OUT    = @echo `date +[\ %F\ -\ %T\ ]`

watch:
	$(OUT) "Watching..."
	./node_modules/.bin/esbuild ./front/index.js --bundle --minify --sourcemap --target=chrome80,firefox80,safari11,edge16 --outfile=./front/bundle.js --watch

build:
	./node_modules/.bin/esbuild ./front/index.js --bundle --minify --sourcemap --target=chrome80,firefox80,safari11,edge16 --outfile=./front/bundle.js
