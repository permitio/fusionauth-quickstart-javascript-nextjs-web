# Example Next.js Application

This repo holds an example Next.js application that uses FusionAuth as the identity provider.
This application uses [NextAuth.js](https://next-auth.js.org/) which includes a [FusionAuth](https://next-auth.js.org/providers/fusionauth) provider.

This application was built by following the [Next.js Quickstart](https://fusionauth.io/docs/quickstarts/quickstart-javascript-nextjs-web/).

## Project Contents

The `docker-compose.yml` file and the `kickstart` directory are used to start and configure a local FusionAuth server.

The `/complete-application` directory contains a fully working version of the application.

## Project Dependencies

- Docker, for running FusionAuth
- Node 16 or later, for running the Changebank Next.js application

## Running FusionAuth

> Kickstart will only run if no API keys, users or tenants exist. If any exist, Kickstart will not run.
> You can remove docker containers and volumes by calling `docker compose down -v`

To run FusionAuth, just stand up the docker containers using `docker-compose`.

```shell
docker-compose up
```

This will start a PostgreSQL database, and Elastic service, and the FusionAuth server.

## Running the Example App

To run the application, first go into the project directory

```shell
cd complete-application
```

Install dependencies

```shell
npm install
```

Start the application

```shell
npm run dev
```
