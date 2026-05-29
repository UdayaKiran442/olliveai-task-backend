# Set up instructions

## To install dependencies:
```sh
bun install
```

## Environment Variable
- Add .env file in the root project folder.
- Refer to .env.example for the env variables.

## To run:
```sh
bun run dev
```

open http://localhost:3000

## Drizzle ORM Migration Script
```sh
npx drizzle-kit generate
```
This generated sql queries whenever there is a change in schema.


# Architecture Overview
- Controller folder is where entire business logic is present.
- Routes folder handles all the routing logic.
- Middleware folder contains the authentication middleware for authenticated routes.
- Services folder contains functions which talks to third party services like open ai , sarvam etc.
- Utils folder contains reusable functions which can be used in any of the file.

# Kubernetes and Docker

## Docker

**Dockerfile**
Defines
- Base image
- Dependency installation
- Build steps
- Application startup command

**Build Docker image**
- In project root folder run the following command
```sh
docker build -t olliveai-task-backend .
```

## Kubernetes
Server is deployed in local minikube kubernetes cluster.

### Start Minikube
```sh
minikube start
```

### Load server image into Minikube
- Since docker image is built in local daemon, we need to load the image into minikube cluster.
Command to load locally built image into minikube
```sh
minikube load <image_name>
```

- After loading the image you can open the minikube cluster dashboard using
```sh
minikube dashboard
```

### Deployment Configuration
**deployment.yml**

Contains:
- Pod configuration
- Docker image details
- Replica/pod count
- Container specifications

Apply deployment:
```sh
kubectl apply -f deployment.yml
```

### Service Configuration
**service.yml**

Contains:
- Service type
- Port exposure configuration
- Internal/external access configuration

Apply service:
```sh
kubectl apply -f service.yml
```