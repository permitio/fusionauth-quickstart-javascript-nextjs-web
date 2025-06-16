# Permit.io FGA with FusionAuth Authentication

This project demonstrates the integration of Permit.io's Fine-Grained Authorization (FGA) with FusionAuth as the authentication provider. It showcases how to implement robust authorization controls while leveraging FusionAuth for secure user authentication.

## Quick Setup Guide

1. **Permit.io Setup**
   - Create a `.env` file in the root directory
   - Add your Permit.io API key:
     ```
     PERMIT_API_KEY=your_permit_api_key_here
     ```

2. **Run the Startup Script**
   ```bash
   ./startup.sh
   ```

3. **Start Docker Services**
   ```bash
   docker compose up -d
   ```

4. **Setup the Complete Application**
   ```bash
   cd complete-application
   ```

5. **Configure Application Environment**
   - Create a `.env.local` file in the `complete-application` directory
   - Add the same Permit.io API key:
     ```
     PERMIT_API_KEY=your_permit_api_key_here
     ```

6. **Install Dependencies**
   ```bash
   npm install
   ```

7. **Start the Development Server**
   ```bash
   npm run dev
   ```

The application should now be running at `http://localhost:3000`

## Project Overview

This is a Next.js application that implements Permit.io's Fine-Grained Authorization (FGA) system with FusionAuth handling user authentication. The application uses:
- [NextAuth.js](https://next-auth.js.org/) with the [FusionAuth provider](https://next-auth.js.org/providers/fusionauth) for authentication
- Permit.io for authorization policies and access control
- [Next.js](https://nextjs.org/) as the application framework

## Project Contents

The project consists of:
- `/complete-application` - The main Next.js application with Permit.io integration
- `docker-compose.yml` - Configuration for running FusionAuth and Permit.io PDP
- `kickstart` directory - FusionAuth initial configuration
- `terraform` directory - Permit.io infrastructure configuration

## Project Dependencies

- Docker and Docker Compose
- Node.js (v16 or later)
- Terraform
- A Permit.io account and API key

## Detailed Setup Instructions

### Permit.io Integration

This project uses Permit.io's Policy Decision Point (PDP) service for authorization. Before running the application:

1. [Create a Permit.io account](https://app.permit.io/signup) if you don't have one
2. Create a new project in the Permit.io dashboard
3. [Generate an API key](https://docs.permit.io/overview/use-the-permit-api-and-sdk/#obtain-your-api-key) with the appropriate permissions
4. Add the API key to your `.env` file:
   ```
   PERMIT_API_KEY=your_permit_api_key_here
   ```

The PDP service will be available at:
- Main PDP service: http://localhost:7766
- OPA service: http://localhost:8181

The application automatically:
- Syncs authenticated users with Permit.io
- Performs permission checks on both client and server
- Conditionally renders UI elements based on user permissions

Default permissions in the example app:
- Regular users (`richard@example.com`) have limited capabilities
- Admin users (`admin@example.com`) have additional administrative permissions

You can customize roles and permissions through the [Permit.io dashboard](https://app.permit.io).

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

### FusionAuth Installation via Docker

FusionAuth is used as the authentication provider in this project. The configuration uses Docker Compose to set up the service:

```
docker compose up -d
```

The FusionAuth configuration uses [Kickstart](https://fusionauth.io/docs/v1/tech/installation-guide/kickstart) to automatically configure the service on first run. The [Kickstart file](./kickstart/kickstart.json) contains the initial configuration.

> **NOTE**: If you ever want to reset the FusionAuth system, delete the volumes created by docker compose by executing `docker compose down -v`. 

FusionAuth will be initially configured with these settings:

* Your client Id is: `e9fdb985-9173-4e01-9d73-ac2d60d1dc8e`
* Your client secret is: `super-secret-secret-that-should-be-regenerated-for-production`
* Your example username is `richard@example.com` and your password is `password`.
* Your admin username is `admin@example.com` and your password is `password`.
* Your fusionAuthBaseUrl is 'http://localhost:9011/'

You can access the [FusionAuth admin UI](http://localhost:9011/admin) to manage users and settings.

## Troubleshooting

If you encounter any issues:
1. Ensure all environment variables are correctly set
2. Check that Docker services are running properly
3. Verify that the Permit.io API key is valid and has the correct permissions

## Additional Resources

- [Permit.io Documentation](https://docs.permit.io/)
- [FusionAuth Documentation](https://fusionauth.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
