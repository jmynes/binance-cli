require('dotenv').config()
const binance = require('node-binance-api');
binance.options({
  APIKEY: process.env.BINANCEPUB,
  APISECRET: process.env.BINANCESEC,
  useServerTime: true, // If you get timestamp errors, synchronize to server time at startup
  // Toggle below when ready!
  //test: true // If you want to use sandbox mode where orders are simulated
});

console.log("Issue a command");

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
  switch(d.toString().trim()) {
    /*
      List available commands and any other documentation relevant to a new user
    */
    case '?':
    case 'help':
    case 'list':
    case 'commands':
      console.log("You can use the commands: balances, cancel, help, open, price, or quit");
    break;

    /*
      See all balances, no matter how small.
      Also, display USDT and BTC while we're still testing.
    */
    case 'balances':
    case 'balance':
    case 'b':
      binance.balance((error, balances) => {
        console.log("balances()", balances);
        console.log("USDT balance: ", balances.USDT.available);
        console.log("BTC balance: ", balances.BTC.available);
      });
    break;

    /*
      Second piece of ticker (USDT) is the trading pair
      e.g. XMRBTC means BTC market, XMR
    */
    case 'cancel':
    case 'c':
      binance.cancelOrders("BTCUSDT", (error, response, symbol) => {
        console.log(symbol+" cancel response:", response);
      });
    break;

    /*
      List all open orders
    */
    case 'open':
    case 'orders':
    case 'o':
      binance.openOrders(false, (error, openOrders) => {
        console.log("openOrders()", openOrders);
      });
    break;

    /*
      Get current price of asset (in our case, BNB priced in BTC)
    */
    case 'price':
    case 'p':
      binance.prices('BNBBTC', (error, ticker) => {
        console.log("Price of BNB: ", ticker.BNBBTC);
      });
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

    */
    default:
      console.log("Command does not exist or failed. Please type help for a list of commands.")
    break;
  }
});
