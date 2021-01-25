SHELL := /bin/bash
OUT    = @echo `date +[\ %F\ -\ %T\ ]`

watch:
	$(OUT) "Watching..."
	@while sleep 5; do make -s build; done

build:
	yarn build
