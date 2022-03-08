#!/bin/bash

IFS='.' read -r -a current_version <<< `cat ./aim/VERSION`

new_major=${current_version[0]}
new_minor=`expr ${current_version[1]} + 1`
version_suffix=dev$(date -u +%Y%m%d)

new_version=$new_major.$new_minor.0.$version_suffix

echo $new_version > ./aim/VERSION