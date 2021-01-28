SHELL := /bin/bash
OUT    = @echo `date +[\ %F\ -\ %T\ ]`

watch:
	$(OUT) "Watching..."
	@while sleep 5; do make -s build; done

build:
	./node_modules/.bin/esbuild ./front/index.js --bundle --minify --sourcemap --target=chrome80,firefox80,safari11,edge16 --outfile=./front/bundle.js
