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

## FusionAuth Installation via Docker

In the root of this project directory (next to this README) are two files [a Docker compose file](./docker-compose.yml) and an [environment variables configuration file](./.env). Assuming you have Docker installed on your machine, you can stand up FusionAuth up on your machine with:

```docker compose up -d
```

### Automated Startup with Terraform Configuration

This project includes a startup script that will automatically:
1. Configure Permit.io using Terraform with your exported Permit configuration
2. Start the Docker services including FusionAuth and the Permit.io PDP

To use this automated startup:

1. Make sure Terraform is installed on your system. If not, [install Terraform](https://developer.hashicorp.com/terraform/install).
2. Ensure your `.env` file contains your `PERMIT_API_KEY`.
3. Run the startup script:
```shell
./startup.sh
```

This script will apply your Permit.io configuration before starting the Docker services, ensuring that the PDP has the correct configuration when it comes online.

> **NOTE**: If you've already exported your Permit configuration using `permit env export terraform`, the startup script will use this configuration. Otherwise, the default configuration in the terraform directory will be used.

### Permit.io Integration

This project includes a Permit.io Policy Decision Point (PDP) service for authorization. Before running the application, you need to:

1. [Obtain a Permit.io API](https://docs.permit.io/overview/use-the-permit-api-and-sdk/#obtain-your-api-key) key from your [Permit.io account](https://app.permit.io/)
2. Add the API key to your `.env` file:

```
PERMIT_API_KEY=your_permit_api_key_here
```

The PDP service will be available at:
- Main PDP service: http://localhost:7766
- OPA service: http://localhost:8181

The FusionAuth configuration files also make use of a unique feature of FusionAuth, called [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart): when FusionAuth comes up for the first time, it will look at the [Kickstart file](./kickstart/kickstart.json) and mimic API calls to configure FusionAuth for use when it is first run. 

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker compose by executing `docker compose down -v`. 

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can log into the [FusionAuth admin UI](http://localhost:9011/admin) and look around if you want, but with Docker/Kickstart you don't need to.

## Permit.io Authorization Setup

This application uses Permit.io for fine-grained authorization:

1. [Create a Permit.io account](https://app.permit.io/signup) if you don't have one
2. Create a new project in Permit.io dashboard
3. [Generate an API key](https://docs.permit.io/overview/use-the-permit-api-and-sdk/#obtain-your-api-key) with the appropriate permissions
4. Add the API key to your `.env` file:
   ```
   PERMIT_API_KEY=your_permit_api_key_here
   ```

The application automatically:
- Syncs authenticated users with Permit.io
- Performs permission checks on both client and server
- Conditionally renders UI elements based on user permissions

Default permissions in the example app:
- Regular users (`richard@example.com`) have limited capabilities
- Admin users (`admin@example.com`) have additional administrative permissions

You can customize roles and permissions through the [Permit.io dashboard](https://app.permit.io).

## Running the Example App

To run the application, first go into the project directory

```shell
cd complete-application
```

Create a local environment file

```shell
cp .env.example .env.local
```

Install dependencies

```shell
npm install
```

Start the application

```shell
npm run dev
```
