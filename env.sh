#!/bin/bash
if [[ $1 == 'test' ]]; then
  export EROSION_DIR=/tmp/erosion
  export EROSION_ENV=test
  export EROSION_DBG=true
fi

if [[ $1 == 'dev' ]]; then
  export EROSION_ENV=dev
  export EROSION_DBG=true
fi

