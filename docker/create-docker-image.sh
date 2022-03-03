#!/bin/bash

echo '-----'
echo $UPDATE_LATEST_TAG
echo $AIM_VERSION
echo '-----'

if [ $UPDATE_LATEST_TAG == 1 ]
then
    echo 'latest'
else
    ${AIM_VERSION::-8}
    echo 'yooohoooo'
fi