import { loadStdlib, ask } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(100);
    const fmt = (x) => stdlib.formatCurrency(x, 4);
    const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

    const isCreator = await ask.ask(
        `Are you a Creator?`,
        ask.yesno
    );
    const who = isCreator ? 'Creator' : 'Bidder';
    
    console.log(`Starting Nft Market! as ${who}`);
    
    let acc = null;
    const createAcc = await ask.ask(
        `Would you like to create an account? (only possible on devnet)`,
        ask.yesno
    );
    
    if (createAcc) {
        acc = await stdlib.newTestAccount(startingBalance);
    } else {
        const secret = await ask.ask(
            `What is your account secret?`,
            (x => x)
        );
        acc = await stdlib.newAccountFromSecret(secret);
    }
    
    let ctc = null;
    if (isCreator) {
      ctc = acc.contract(backend);
      ctc.getInfo().then((info) => {
        console.log(`The contract is deployed as = ${JSON.stringify(info)}`); });
    } else {
      const info = await ask.ask(
        `Please paste the contract information:`,
        JSON.parse
      );
      ctc = acc.contract(backend, info);
    }

    const before = await getBalance(acc);
    console.log(`Your balance is ${before}`);

    const Interact = {
        seeOutcome: (price, address) => {
            const winner = stdlib.formatAddress(address)
            console.log(`The Winner of address: ${address} has paid ${price}`);
        },
        showBid: (bid) => {
            console.log(`A bid of ${fmt(bid)} has been placed` );
        },
        informTimeout: () => {
            console.log("Payment was not performed.")
            process.exit(0);
        },
        isAuctionOn: async () => {

            const startAuction = await ask.ask(
                `Do you want to start the auction?`,
                ask.yesno
            );

            if(!startAuction){
                console.log(`Auction has been ended.`)
                return false;
            };
            console.log(`Auction has been started.`)
            return true;
        }
    };

    if(isCreator){
        const id = await ask.ask(
            `Enter NFT Id: `,
            (x => x)
          );

        const deadline = await ask.ask(
            `Enter Auction Dealine: `,
            (x => x)
        );


        const basePirce = await ask.ask(
            `Enter Base Price: `,
            (x => x)
        );


        const royalty = await ask.ask(
            `Enter Asking Royalty: `,
            (x => x)
        );


        const url = await ask.ask(
            `Enter NFT url: `,
            (x => x)
        );

        Interact.createNFT = () => {
              return {
                basePrice: stdlib.parseCurrency(basePirce), 
                royalty: royalty, 
                uri: url
              }
            },
        Interact.getId = id
        Interact.deadline = deadline
    }else{

        Interact.getBid = async (price) => {
            console.log("Current price is: ", fmt(price))

            const counterBid = await ask.ask(
                `Enter Counter Bid: `,
                (x => x)
              );

            if (price < stdlib.parseCurrency(counterBid)) {
                console.log("You have bid ", counterBid, "ALGO");
                return stdlib.parseCurrency(counterBid);
            };
            console.log("You have bid ", fmt(price), "ALGO")
            return price;
        }

    }

    const part = isCreator ? ctc.p.Creator : ctc.p.Bidder;
    await part(Interact);

    const after = await getBalance(acc);
    console.log(`Your balance is now ${after}`);

    ask.done();
})();