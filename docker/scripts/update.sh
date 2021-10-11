#!/bin/bash

if [ "$EUID" -eq 0 ]
  then echo "Do not run as root"
  exit
fi

echoerr() { echo "$@" 1>&2; }

if [ -z "${GITHUB_USERNAME}" ] && [ -z "${GITHUB_REPOSITORY}" ]; then
        echo "GITHUB_USERNAME or GITHUB_REPOSITORY not set. Exiting."
        exit 0;
fi

if [ -z "${GITHUB_BRANCH}" ]; then
        GITHUB_BRANCH=master
fi

checkout_repo() {
    GIT_URL=https://github.com/${GITHUB_USERNAME}/${GITHUB_REPOSITORY}
    echoerr "Cloning over HTTPS from $GIT_URL to $1"
    git clone --branch="${GITHUB_BRANCH}" "$GIT_URL" "${1}"
}


LOCAL_PATH=/tmp/apprepo

mkdir -p ${LOCAL_PATH}

if [ ! -d "${LOCAL_PATH}/.git" ]; then
        checkout_repo "${LOCAL_PATH}"
        ls -la /usr/local/bin/
        cd ${LOCAL_PATH}
        npm install
        echo "Installed"
        npm run build
        cp -Rf prod/* /srv/www/public/
        exit 0;
fi

pushd ${LOCAL_PATH} > /dev/null

LOCAL_REVISION=$(git rev-parse @)
REMOTE_REVISION=$(git rev-parse "origin/${GITHUB_BRANCH}")

echo "Local revision: $LOCAL_REVISION"
echo "Remote revision: $REMOTE_REVISION"
if [ ! $LOCAL_REVISION = $REMOTE_REVISION ]; then
        git merge "origin/${GITHUB_BRANCH}"
        npm install && npm run build && cp -Rf prod/* /srv/www/public/
fi

popd > /dev/null

