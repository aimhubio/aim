#!/bin/bash

if [ "$UPDATE_TAG" = "latest" ] || [ "$UPDATE_TAG" = "nightly" ]
then
  for i in {1..5}
  do
    docker image build --no-cache	 \
      -t aimstack/aim:$AIM_VERSION -t aimstack/aim:$UPDATE_TAG --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile . \
      && break || echo "retry attempt ${i}" && sleep 120
  done
else
  for i in {1..5}
  do
    docker image build --no-cache	\
      -t aimstack/aim:$AIM_VERSION --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile . \
      && break || echo "retry attempt ${i}" && sleep 120
  done
fi
docker image push --all-tags aimstack/aim
