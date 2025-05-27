# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Arena DAO UI is a Next.js web application that serves as the frontend for Arena DAO smart contracts on the Neutron blockchain. It enables users to participate in competitions (wagers, leagues, tournaments), manage teams, and engage with the decentralized gaming community.

## Development Commands

**Setup and Development:**
```bash
yarn                    # Install dependencies
yarn dev               # Start development server with Turbopack
yarn build             # Build for production
yarn start             # Start production server
```

**Code Quality:**
```bash
yarn lint              # Run Biome linter with auto-fix
yarn lint:unsafe       # Run Biome linter with unsafe auto-fixes
yarn format            # Format code with Biome
yarn lint && yarn format  # Full linting and formatting (run before commits)
```

**Requirements:**
- Node.js >=20.0.0
- Yarn >=4.0.0

## Architecture

### Technology Stack
- **Framework:** Next.js 15 with App Router
- **UI:** HeroUI (Next UI successor), Tailwind CSS, Framer Motion
- **Blockchain:** CosmJS, Cosmos Kit for wallet integration
- **State:** Zustand stores, TanStack Query for server state
- **Forms:** React Hook Form with Zod validation
- **TypeScript:** Strict mode with comprehensive type checking

### Directory Structure

**App Router Structure (`app/`):**
- `compete/` - Competition creation and management
- `dao/jailhouse/` - DAO governance interface
- `enrollment/view/` - Competition enrollment views
- `league/view/` - League-specific displays
- `tournament/view/` - Tournament brackets and management
- `team/` and `teams/` - Team creation and management
- `user/` - User dashboard and profile management
- `wager/view/` - Wager competition interface

**Source Structure (`src/`):**
- `codegen/` - Auto-generated smart contract clients and types
- `config/` - Configuration files including competition categories
- `contexts/` - React contexts (CategoryContext)
- `helpers/` - Utility functions organized by domain
- `hooks/` - Custom React hooks including blockchain interactions
- `store/` - Zustand stores for client state
- `types/` - TypeScript type definitions

### Key Architectural Patterns

**Smart Contract Integration:**
- All smart contract interactions are in `src/codegen/` (auto-generated)
- Each contract has `.client.ts`, `.react-query.ts`, and `.types.ts` files
- Use TanStack Query hooks for contract queries and mutations

**Environment Configuration:**
- Environment variables are validated via Zod schema in `useEnv.ts`
- All public env vars must have `NEXT_PUBLIC_` prefix
- Supports development (testnet) and production (mainnet) environments

**Component Organization:**
- Page components in `app/*/page.tsx`
- Shared components in `app/components/`
- Feature-specific components in `app/*/components/`
- Complex views have dedicated `components/` subdirectories

**State Management:**
- Server state: TanStack Query with auto-generated hooks
- Client state: Zustand stores (`authStore.ts`, `teamStore.ts`)
- Form state: React Hook Form with Zod schemas

**Blockchain Wallet Integration:**
- Cosmos Kit provider supports Keplr, Leap, and MetaMask
- Chain configuration switches between testnet/mainnet based on environment
- Wallet connection state managed globally through providers

### Code Style and Standards

**Biome Configuration:**
- Tab indentation, 100 character line width
- Import organization enabled
- Strict TypeScript rules with unused import/variable errors
- Sorted CSS classes required
- Double quotes, trailing commas, semicolons

**Path Aliases:**
- `~/` maps to `./src/`
- `@/` maps to `./app/`

**TypeScript Configuration:**
- Strict mode enabled with comprehensive type checking
- No unchecked indexed access
- No unused parameters allowed
- Source maps enabled for debugging

## Environment Setup

The application requires numerous environment variables for smart contract addresses, API endpoints, and blockchain configuration. Key variables include:

- Chain configuration (CHAIN, BECH32_PREFIX, RPC_URL)
- Arena DAO contract addresses (ARENA_CORE_ADDRESS, etc.)
- External service URLs (DAO_DAO_URL, DISCORD_API_URL)
- Code IDs for various smart contracts

Environment files should follow the naming pattern in `useEnv.ts` with `NEXT_PUBLIC_` prefixes.

## Development Notes

**Generated Code:**
- Never manually edit files in `src/codegen/` - these are auto-generated
- Biome ignores the codegen directory to prevent formatting conflicts

**Blockchain Development:**
- Use development environment for testnet, production for mainnet
- Smart contract interactions are strongly typed via generated clients
- Always handle wallet connection states and transaction errors

**Component Development:**
- Follow existing patterns in similar components
- Use HeroUI components for consistency
- Implement proper loading states and error boundaries
- Form validation should use Zod schemas from `src/config/schemas/`

**Testing:**
- No test framework is currently configured
- Manual testing should verify wallet connections and contract interactions