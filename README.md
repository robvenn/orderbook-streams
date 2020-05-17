# Orderbook streams

This project started as a solution for Keyrock's full stack developer test, based the on [orderbook-parser](https://github.com/KeyrockEU/orderbook-parser) example project.
The idea is that it should be able to support data from multiple cryptocurrency exchanges, currently it only supports [Kraken](https://www.kraken.com/).
This repository contains a Node.js backend and a React frontend, and it should be able to support multiple clients running in the browser to track updates from crypto markets.

The "experimental" part is about testing some different approaches to handle the updates, changing some of the presets like size of the snapshots in memory, if it's possible to move more calculations to the frontend, etc.
Some background information about orderbooks with the Kraken WebSocket API cn be found here:
- https://support.kraken.com/hc/en-us/articles/360027821131-How-to-maintain-a-valid-order-book-
- https://support.kraken.com/hc/en-us/articles/360027678792-Example-order-book-transcript

## Goals & approach

### The backend (Node.js)
- [x] connects to the crypto exchange (for Kraken: using a WebSocket, keeping the connection alive with ping messages)
- [x] allows incoming WebSocket connections from multiple clients 
- [x] sends a message with the available exchanges and markets to the clients on first connection
- [x] allows clients to subscribe and unsubscribe to these markets 
- [x] manages the subscriptions to the crypto exchange, subscribing & unsubscribing when needed
- [x] uses streams and pipes to filter the right subscriptions and connect them to the right clients
- [x] keeps track of the update speed by market and periodically sends a message to the clients with the current speed

TODO: consider potential improvements: move snapshot updating to client-side to avoid putting too much load on the server if there are many subscriptions and updates
- [ ] backend could get latest snapshot from the exchange for every new client subscription to avoid processing all the snapshot updates
- [ ] will reconnect if the connection to the exchange drops (and restore all the subscriptions that were active?)

### The frontend (React.js)
- [x] initializes with no subscriptions and opens a WebSocket connection to the backend
- [x] receives the list of available subscriptions in a WebSocket message when the connection opens
- [x] can select markets to subscribe and continuously update the orderbook numbers
- [x] can remove active markets to unsubscribe and stop receiving updates for that market
- [x] calculates the mid price and spread based on the snapshots

TODO: consider potential improvements
- [ ] calculates the snapshot updates to avoid putting too much load on the backend
- [ ] will try to reconnect if the connection closes (and restore the active subscriptions?)


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
