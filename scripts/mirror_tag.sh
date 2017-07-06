#!/bin/bash

cd $DIR
git checkout master
git pull

git fetch origin tag $TAG_NAME -f
git checkout $TAG_NAME
git push $GIT_TRG_ADDRESS $TAG_NAME -f
