# Drift Frontend Dashboard

A Next.js-based dashboard for interacting with the Drift Protocol on Solana blockchain. This application enables users to connect wallets, view account information, place trades, and manage positions in the Drift decentralized exchange.

## Features

- 🔐 Solana wallet integration
- 📊 Real-time oracle price display
- 💰 Account management and position tracking
- 📈 Trading interface for placing various order types:
  - Market orders
  - Limit orders
  - Stop market orders
  - Stop limit orders
  - Scale orders
- 🏦 Deposit and withdrawal functionality
- 🌓 Light/Dark theme support
- 🔔 Transaction notifications via toast messages

## Tech Stack

- **Frontend**: Next.js 15+, React 19, TypeScript, TailwindCSS
- **Blockchain**: Solana Web3.js, Wallet Adapter
- **Drift Protocol**: Drift SDK (@drift-labs/sdk)
- **State Management**: Zustand
- **Data Fetching**: SWR

## Getting Started

### Prerequisites

- Node.js 19.x or later
- pnpm
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Jesscha/drift-trial.git
cd drift-frontend-task
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Architecture

The project follows a modular architecture:

```
src/
├── app/                  # Next.js App Router structure
│   ├── components/       # React components
│   ├── providers/        # Context providers
│   ├── hooks/            # Custom React hooks
│   ├── stores/           # Zustand stores
│   ├── utils/            # Utility functions
│   └── page.tsx          # Main page component
├── services/             # Service layer
│   ├── drift/            # Drift protocol integration
│   │   ├── account.ts    # Account management
│   │   ├── client.ts     # Drift client service
│   │   ├── deposit.ts    # Deposit functionality
│   │   ├── market.ts     # Market data handling
│   │   ├── order.ts      # Order placement
│   │   └── withdraw.ts   # Withdrawal functionality
│   └── txTracker/        # Transaction tracking
```

## Drift Protocol Integration

The application integrates with the Drift Protocol using the official SDK. Key functionality includes:

### Market Data

- Fetching perpetual and spot market accounts
- Getting real-time oracle prices with caching
- Retrieving market symbols

### Order Placement

Supports various order types:

- Market orders
- Limit orders
- Scale orders
- Trigger market orders
- Trigger limit orders

### Account Management

- Connecting to user accounts
- Viewing positions and balances
- Managing deposits and withdrawals

## Development

### Custom Components

The UI is built with custom components leveraging Tailwind CSS for styling:

- Trading modals
- Position displays
- Oracle price boards
- Transaction toasts
- Custom dropdowns
- Theme toggle

### State Management

State is managed primarily with Zustand stores, providing a lightweight and efficient state management solution.

## Deployment

Deploy your application to Vercel:

```bash
pnpm build
pnpm start
```

For production deployment, follow the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
