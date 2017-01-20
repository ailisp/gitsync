#!/bin/bash


if [ -d "$DIR" ]; then
  cd $DIR
	echo "Updating the local clone"
	git remote update
else
	echo Cloning $GIT_SRC_ADDRESS to $DIR
	git clone --mirror $GIT_SRC_ADDRESS $DIR

	cd $DIR
fi

echo Pusing to $GIT_TRG_ADDRESS

git push --mirror $GIT_TRG_ADDRESS



