FROM node:14-buster as builder

ARG BUILD_NUMBER
ARG GIT_REF

RUN apt-get update && \
    apt-get upgrade -y

WORKDIR /app

COPY . .

RUN CYPRESS_INSTALL_BINARY=0 npm ci --no-audit && \
    npm run build && \
    export BUILD_NUMBER=${BUILD_NUMBER} && \
    export GIT_REF=${GIT_REF} && \
    npm run record-build-info

RUN npm prune --production

FROM node:14-buster-slim
LABEL maintainer="HMPPS Digital Studio <info@digital.justice.gov.uk>"

RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

RUN addgroup --gid 2000 --system appgroup && \
    adduser --uid 2000 --system appuser --gid 2000

ENV TZ=Europe/London
RUN ln -snf "/usr/share/zoneinfo/$TZ" /etc/localtime && echo "$TZ" > /etc/timezone

# Create app directory
RUN mkdir /app && chown appuser:appgroup /app
USER 2000
WORKDIR /app

COPY --from=builder --chown=appuser:appgroup \
        /app/package.json \
        /app/package-lock.json \
        /app/build-info.json \
        ./


COPY --from=builder --chown=appuser:appgroup \
        /app/node_modules ./node_modules

COPY --from=builder --chown=appuser:appgroup \
        /app/views ./views

COPY --from=builder --chown=appuser:appgroup \
        /app/backend/. ./backend/

COPY --from=builder --chown=appuser:appgroup \
        /app/build/. ./build/

COPY --from=builder --chown=appuser:appgroup \
        /app/src/dateHelpers.js ./src/dateHelpers.js

COPY --from=builder --chown=appuser:appgroup \
        /app/src/BulkAppointments/RecurringAppointments.js ./src/BulkAppointments/RecurringAppointments.js


ENV PORT=3000
ENV DISABLE_WEBPACK=true

EXPOSE 3000
USER 2000
CMD [ "npm", "start" ]