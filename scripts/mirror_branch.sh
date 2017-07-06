#!/bin/bash

cd $DIR
git checkout master
git pull

git fetch origin $REF:$BRANCH_NAME -f
git checkout $BRANCH_NAME
git push $GIT_TRG_ADDRESS $BRANCH_NAME -f
