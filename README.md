# Keyrock full stack developer test 
Solution based on `orderbook-parser` example project that gets orderbook snapshots from Kraken.

## Goals

- This project is the result of a coding test with data from a cryptocurrency exchange, currently it only supports [Kraken](https://www.kraken.com/)

### Backend

- The backend server connects to the crypto exchange over a WebSocket, keeping the connection alive
- The backend allows incoming WebSocket connections and subscriptions, and will manage the subscriptions to the crypto exchange
- Multiple clients can connect and they can all subscribe or unsubscribe to the markets they want
- The backend will subscribe to the crypto exchange if there is a client that wants to subscribe
- If there are no more subscriptions from clients the backend will also close this subscription to the crypto exchange
- The backend uses Node.js streams and pipes to filter the right subscriptions and connect them to the right clients

### Frontend

- The frontend is a React app that initializes with no subscriptions and starts a WebSocket connection
- The frontend receives the list of available subscriptions in a WebSocket message when the connection opens
- It's possible to "add a market" and pick one of the available subscriptions
- The market data will continuously update and keep the connection open
- It's also possible to unsubscribe which will close the market "box" and stop receiving updates for that market

## Requirements

- You need a relatively new version of Node.js (this was tested with version 14.1.0)
- `yarn` package manager

## How to install

- `git clone` this repo
- Run `yarn` to install the dependencies

## How to run
****
Run`yarn start`, open your browser on `http://localhost:9000/`.

## Development

The React frontend can run separately by running `npm start` from `/client` which will start a Webpack dev server on `http://localhost:3000`.
To use the latest frontend running on the static server on `http://localhost:9000`, run `npm build` from `/client`.
Run`yarn dev` and this will run the backend with `nodemon` to restart in development, while still serving the frontend on `http://localhost:9000/`.
