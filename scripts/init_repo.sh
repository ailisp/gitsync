#!/bin/bash

echo "clear $DIR"
rm -rf $DIR

echo "Clonining $SRC_ADDRESS into $DIR"
git clone $GIT_SRC_ADDRESS $DIR
