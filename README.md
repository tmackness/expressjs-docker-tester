# ExpressJS API To Test Docker Swarm + Traefik + Consul + REDIS + ELK

This is a basic API to test getting a Swarm stack up and running with the following services:

- Docker Swarm
- Traefik
- Consul (on host)
- REDIS
- Elastic APM

## Endpoints

### /

Shows:

- hostname
- container ip (if pulls from correct interface eth0-eth3) - set to eth2

### /redis

Gives you info on using query param e.g. ?key=some-value-here

### /redis?key=any-value-here

Should output the query value from both REDIS and Consul KV.

### /error

Will only see "Server error" but should see the error info in Elastic APM UI.
