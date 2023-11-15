# Arena DAO UI

Welcome to the Arena DAO UI, a web application built using Next.js and Chakra UI. This application serves as a user interface for the Arena DAO platform, enabling users to participate in competitions, engage with the community, and manage their DAOs.

## Getting Started

To kickstart your journey with the project, install the required packages and start the development server by executing the following commands:

    npm install
    npm run dev

## Project Structure

The project is organized into several directories, each with a specific purpose:

- `pages`: This directory houses all the pages of the application. Each file corresponds to a specific route in the application. For instance, `index.tsx` corresponds to the home page, `featured.tsx` corresponds to the featured DAOs page, and so on.

- `components`: This directory contains reusable React components that are used across different pages.

- `config`: This directory contains configuration files, such as the theme configuration for Chakra UI.

- `ts-codegen`: This directory contains TypeScript code that is automatically generated from JSONSchema files.

## Key Features

The application boasts several key features:

- Home Page (`pages/index.tsx`): Showcases a welcome message and a list of features offered by the platform.

- Featured DAOs Page (`pages/featured.tsx`): Displays a curated list of featured DAOs.

- DAO Enabling Page (`pages/dao/enable.tsx`): Empowers users to enable their DAOs.

- Faucet Page (`pages/faucet.tsx`): Provides a faucet for users to acquire test tokens in the development environment.

## Customization

You can tailor the appearance of the application by modifying the Chakra UI theme configuration located in `config/theme`.

## Contributing

Before contributing, please ensure to run the linter:

    npm run lint

If any issues are detected, they can be automatically fixed by running:

    npm run lint:fix

Please note that this project is licensed under the GPL-3.0 license. By contributing to this project, you agree to abide by its terms.
