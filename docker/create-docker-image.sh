#!/bin/bash

echo '-----'
echo $UPDATE_LATEST_TAG
echo $AIM_VERSION
echo '-----'

if [ $UPDATE_LATEST_TAG == 1 ]
then
#  docker image build --no-cache	 \
#    -t aimstack/aim:$AIM_VERSION -t aimstack/aim:latest --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile .
    echo 'latest'
else
#  docker image build --no-cache	\
#    -t aimstack/aim:$AIM_VERSION --build-arg AIM_VERSION=$AIM_VERSION -f Dockerfile .
    ${AIM_VERSION::-8}
    echo 'yooohoooo'
fi
#docker image push --all-tags aimstack/aim