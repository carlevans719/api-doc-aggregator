# api-doc-aggregator

## Usage

Clone the repo down, run `npm i` and then `node index.js` to start. The app will be accessible on localhost:3000.

#### Docker

After cloning the repo, build the image with `docker build -t api-doc-aggregator:latest .` and then start a container with `docker run -d -p 3000:3000 api-doc-aggregator:latest`.

## Roadmap

- [ ] Remove dependency on express #1: generate static index as part of the generation process and output to ./public
- [ ] Remove dependency on express #2: add nginx to the docker image and set the server root to the public dir
- [ ] Implement access control of some sort. Likely http basic auth or a [customer authoriser](https://docs.nginx.com/nginx/admin-guide/security-controls/configuring-subrequest-authentication/)
