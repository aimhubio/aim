#!/bin/bash

if [ $UPDATE_LATEST_TAG == 1 ]
then
  docker image build --no-cache	 \
    -t aimstack/aim:$AIM_VERSION -t aimstack/aim:latest --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile .
else
  docker image build --no-cache	\
    -t aimstack/aim:$AIM_VERSION --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile .
fi
docker image push --all-tags aimstack/aim