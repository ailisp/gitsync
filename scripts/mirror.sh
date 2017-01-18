#!/bin/bash

DIR=git_workdir
mkdir $DIR
cd $DIR
git clone --mirror GIT_SRC_ADDRESS
cd parity.git
git push --mirror GIT_TRG_ADDRESS
cd ../../
rm -rf $DIR


