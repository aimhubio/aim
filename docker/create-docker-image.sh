#!/bin/bash

if [ $UPDATE_LATEST_TAG == 1 ]
then
  docker image build --no-cache	 \
    -t aimstack/aim:$AIM_VERSION -t aimstack/aim:latest --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile .
else
  if [[ "$AIM_VERSION" == *".dev"* ]]; then
    AIM_VERSION=${AIM_VERSION::-8}
  fi
  docker image build --no-cache	\
    -t aimstack/aim:$AIM_VERSION --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile .
fi
docker image push --all-tags aimstack/aim