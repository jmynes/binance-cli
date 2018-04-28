require('dotenv').config();
const util = require('util');
const binance = require('node-binance-api');
const readline = require('readline-promise');

const rl = new readline.default.Interface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

binance.options({
  APIKEY: process.env.BINANCEPUB,
  APISECRET: process.env.BINANCESEC,
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  // Toggle below when ready!
  //test: true // If you want to use sandbox mode where orders are simulated
});

/*
  List available commands and any other documentation relevant to a new user
*/
function help() {
  console.log("You can use the commands: balances, cancel, help, open, price, or quit");
}

/*
  See all balances, no matter how small.
  Also, display USDT and BTC while we're still testing.
*/
function balance() {
  binance.balance((error, balances) => {
    console.log("balances()", balances);
    console.log("USDT balance: ", balances.USDT.available);
    console.log("BTC balance: ", balances.BTC.available);
  });
}

/*
  Second piece of ticker (USDT) is the trading pair
  e.g. XMRBTC means BTC market, XMR
*/
function cancel() {
  binance.cancelOrders("BTCUSDT", (error, response, symbol) => {
    console.log(symbol+" cancel response:", response);
  });
}

/*
  List all open orders
*/
function open_orders() {
  binance.openOrders(false, (error, openOrders) => {
    console.log("openOrders()", openOrders);
  });
}

/*
  Get current price of requested ticker pairing
*/
async function price(req) {
  // binance.prices(req, (error, ticker) => {
  //   console.log("Price of "+req+":", ticker[req]);
  //  ticker = await prices(req);

  const prices = util.promisify(binance.prices);

  try {
    const ticker = await prices(req);
    console.log("Price of "+req+":", ticker[req]);
  } catch (err) {
    console.error("error: " + JSON.parse(err.body).msg);
    return;
  }
}

async function priceGet() {
  console.log("\nGetting price...\n");

  const answer = await rl.questionAsync('Which ticker? Put the pairing second (e.g. BNBBTC): ');
  //console.log('TICKER = ',answer +"\n");
  await price(answer);
}

async function run() {
  console.log("Issue a command");

  while (true) {
    const d = await rl.questionAsync('> ');
    switch(d.toString().trim()) {
      case 'help':
      case 'list':
      case 'commands':
      case '?':
      case 'h':
        help();
      break;

      case 'balance':
      case 'balances':
      case 'b':
        balance();
      break;

      case 'cancel':
      case 'c':
        cancel();
      break;

      case 'open':
      case 'orders':
      case 'o':
        open_orders();
      break;

      case 'price':
      case 'p':
        await priceGet();
        //price("BNBBTC");
        //price("WTCBTC");
      break;

      /*
        Exit the program
      */
      case 'quit':
      case 'q':
      case 'exit':
        process.exit(0)
      break;

      /*
        Inform the user of an error
      */
      default:
        console.log("Command does not exist or failed. Please type help for a list of commands.")
      break;
    }
  }
}

// Run the program
run();
