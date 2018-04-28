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
    console.log("");
    console.log("USDT balance: ", balances.USDT.available);
    console.log("BTC balance: ", balances.BTC.available);
    console.log("");
  });
}

/*
  Second piece of ticker (USDT) is the trading pair
  e.g. XMRBTC means BTC market, XMR
*/
async function cancel_orders(req) {
  // binance.cancelOrders("BTCUSDT", (error, response, symbol) => {
  //   console.log(symbol+" cancel response:", response);
  //   console.log("");
  // });

  const cancelOrders = util.promisify(binance.cancelOrders);

  try {
      const orders = await cancelOrders(req);
      console.log("Here are your cancelled orders:\n\n", orders);
      console.log("");
  } catch(err) {
      console.error("error: " + JSON.parse(err.body).msg);
      console.log("");
      return;
  }
}

/*
  List all open orders:
  const orders = await openOrders("");

  For specific ticker:
  const orders = await openOrders(BTCUSDT);
*/
async function open_orders() {
  // binance.openOrders(false, (error, openOrders) => {
  //   console.log("Here are your open orders:\n\n", openOrders);
  //   console.log("");
  // });

   const openOrders = util.promisify(binance.openOrders);

   try {
      const orders = await openOrders("");

      // Verbose, print all info

      /*
      console.log("Here are your open orders:\n\n", orders);
      console.log("");
      */

      console.log("Open orders:\n-------------------\n");
      orders.forEach(order => {
        console.log("Ticker: " + order.symbol)
        console.log("Buy/Sell?: " + order.side)
        console.log("Type: " + order.type)
        console.log("");
        console.log("Original Qty: " + order.origQty)
        console.log("Executed Qty: " + order.origQty)

        console.log("");
        if (order.type == "TAKE_PROFIT_LIMIT") {
          console.log("Stop price: " + order.stopPrice)
        }
        console.log("Limit price: " + order.price)
        console.log("");
        console.log("-------------------");
        console.log("");
      });

   } catch(err) {
       console.error("error: " + JSON.parse(err.body).msg);
       return;
   }
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
    console.log("");
  } catch (err) {
    console.error("error: " + JSON.parse(err.body).msg);
    console.log("");
    return;
  }
}

// // Prompt for ticker to check price for
// async function price_prompt() {
//   const answer = await rl.questionAsync('View prices for which ticker? Put the pairing second (e.g. BNBBTC): ');
//   console.log("");
//   //console.log('TICKER = ',answer +"\n");
//   await price(answer);
// }

/*
  Replaces above commented code, used to have a separate function for each prompt.
  This still isn't very DRY, but it's all in one place instead of several functions
  paired with their partner functions across the codebase.
*/
async function prompt(cmd) {
  switch(cmd) {
    // Prompt for ticker to cancel orders for
    case 'cancel':
      const cancel_answer = await rl.questionAsync('View prices for which ticker? Put the pairing second (e.g. BNBBTC): ');
      console.log("");
      await cancel_orders(cancel_answer);
    break;

    // Prompt for ticker to check prices for
    case 'price':
      const price_answer = await rl.questionAsync('Cancel orders for which ticker? Put the pairing second (e.g. BNBBTC): ');
      console.log("");
      await price(price_answer);
    break;
    default:
      //
    break;
  }
}

async function run() {
  console.log("-------------Welcome-------------");
  console.log("");
  console.log("Issue a command (you can type help if you're unsure):")

  while (true) {
    const d = await rl.questionAsync('> ');
    console.log("");
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
        await prompt('cancel');
      break;

      case 'open':
      case 'orders':
      case 'o':
        await open_orders();
      break;

      case 'price':
      case 'p':
        await prompt('price');
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
