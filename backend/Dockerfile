# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.0.21 as base
LABEL org.opencontainers.image.source="https://github.com/gardencmp/succulent"
WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
LABEL org.opencontainers.image.source="https://github.com/gardencmp/succulent"
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
LABEL org.opencontainers.image.source="https://github.com/gardencmp/succulent"
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
LABEL org.opencontainers.image.source="https://github.com/gardencmp/succulent"
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# copy production dependencies and source code into final image
FROM base AS release
LABEL org.opencontainers.image.source="https://github.com/gardencmp/succulent"
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/index.ts .
COPY --from=prerelease /usr/src/app/package.json .

USER bun
ENV NODE_ENV production
ENTRYPOINT [ "bun", "run", "src/index.ts" ]