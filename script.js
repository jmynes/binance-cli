require('dotenv').config()
const binance = require('node-binance-api');
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
function price(req) {
  binance.prices(req, (error, ticker) => {
    console.log("Price of "+req+":", ticker[req]);
  });
}

console.log("Issue a command");

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
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
      price("BNBBTC");
      price("WTCBTC");
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
});
