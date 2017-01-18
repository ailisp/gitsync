#!/bin/bash

DIR=git_workdir
mkdir $DIR
cd $DIR

echo Cloning $GIT_SRC_ADDRESS
git clone --mirror $GIT_SRC_ADDRESS

cd parity.git

echo Pusing to $GIT_TRG_ADDRESS
git push --mirror $GIT_TRG_ADDRESS

cd ../../
rm -rf $DIR


