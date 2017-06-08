#!/bin/bash

cd $DIR
git fetch origin $REF:$BRANCH_NAME
git checkout $BRANCH_NAME
git push $GIT_TRG_ADDRESS $BRANCH_NAME -f
