FROM ruby:2.5.1

ARG image_name="my_project"
LABEL Name=$image_name
LABEL Version="0.0.1"

# Install some essential library
RUN apt-get update        \
    && apt-get install -y \
      build-essential     \
      libpq-dev           \
      imagemagick         \
    && rm -rf /var/lib/apt/lists/*

# Install postgresql-client
RUN apt-get update \
    && apt-get install -y postgresql-client --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

## Install Node.js
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get install -y nodejs
RUN apt-get update && apt-get install -y yarn


## Install Bundle 1.15.4
RUN gem install bundler --version '1.15.4'

## Change the Workdir and add new env
ENV APP_LOCATION /rails_app
RUN mkdir -p ${APP_LOCATION}
WORKDIR ${APP_LOCATION}

## Bundle install
COPY Gemfile ${APP_LOCATION}/Gemfile
COPY Gemfile.lock ${APP_LOCATION}/Gemfile.lock
RUN bundle install

COPY package.json yarn.lock ./
RUN yarn install

## Copy all application
COPY . ${APP_LOCATION}



