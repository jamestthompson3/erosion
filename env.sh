#!/bin/bash
if [[ $1 == 'test' ]]; then
  export EROSION_DIR=/tmp/erosion
fi

if [[ $1 == 'dev' ]]; then
  export EROSION_ENV=dev
fi

