const express = require("express");
const { getPairs } = require("./server/kraken");

const FRONTEND_PORT = 9000;

const app = express();

app.use(express.static(`${__dirname}/public`));
app.listen(FRONTEND_PORT, () =>
  console.log(`App listening on port ${FRONTEND_PORT}`)
);

//getPairs();
