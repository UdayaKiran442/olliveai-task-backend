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
- Services folder contains