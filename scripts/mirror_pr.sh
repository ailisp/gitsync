#!/bin/bash

cd $DIR
git checkout master
git pull

echo "get the PR"
PR_BRANCH=pr-$PR_ID

git fetch origin pull/$PR_ID/head:$PR_BRANCH
git checkout $PR_BRANCH

echo "push to gitlab"
git push $GIT_TRG_ADDRESS $PR_BRANCH -f 
