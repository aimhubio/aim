#!/bin/bash

if [ "$UPDATE_TAG" = "latest" ] || [ "$UPDATE_TAG" = "nightly" ]
then
  docker image build --no-cache	 \
    -t aimstack/aim:$AIM_VERSION -t aimstack/aim:$UPDATE_TAG --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile .
else
  docker image build --no-cache	\
    -t aimstack/aim:$AIM_VERSION --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile .
fi
docker image push --all-tags aimstack/aim
