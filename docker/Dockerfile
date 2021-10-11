FROM lukacu/webhook

RUN apk add --no-cache git tar openssh-client

ENV ROOT_PATH /srv/www/public

ENV GITHUB_REPOSITORY instasepa

ENV GITHUB_USERNAME lukacu

ENV GITHUB_SECRET placeholder

RUN sudo chmod a+x "/root/" && sudo chown -R nginx:nginx "/root/.npm"

RUN chown -R nginx:nginx "/srv/www"

COPY ./scripts /scripts

