#!/bin/bash

DIR=git_workdir
mkdir $DIR
cd $DIR
git clone --mirror git@github.com:jesuscript/parity.git
cd parity.git
git push --mirror git@gitlab.ethcore.io:parity/parity.git
cd ../../
rm -rf $DIR


