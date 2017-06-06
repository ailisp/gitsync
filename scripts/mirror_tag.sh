#!/bin/bash

cd $DIR
git checkout master
git pull

git fetch origin tag $TAG_NAME
git checkout $TAG_NAME
git push $GIT_TRG_ADDRESS $TAG_NAME -f
