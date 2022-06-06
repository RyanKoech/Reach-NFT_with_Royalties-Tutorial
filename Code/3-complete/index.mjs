import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(10);

    const fmt = (x) => stdlib.formatCurrency(x, 4);

    const accCreator = await stdlib.newTestAccount(startingBalance);
    const accAlice = await stdlib.newTestAccount(startingBalance);
    const accBob = await stdlib.newTestAccount(startingBalance);
 
    const ctcCreator = accCreator.contract(backend);
    const ctcInfo = ctcCreator.getInfo(); 

    const bids = {
        "Alice": {
            maxBid: stdlib.parseCurrency(9),
        },
        "Bob": {
            maxBid: stdlib.parseCurrency(6),
        },
    };

    const id = stdlib.randomUInt();
    const meter = {
        bidder: "",
        lastBid: 0,
    };
    
    const Common = (who) => ({
        seeOutcome: (address) => {            
            const winner = (stdlib.addressEq(accAlice.getAddress(), address)) ? "Alice" : "Bob";
            console.log(`${who} Saw The Winner: `, winner);
        },
        showBid: (bid) => {
            console.log(`${who} saw the bid;`);
            console.log(`Bidder: `, meter.bidder);
            console.log(`Bid: ${fmt(bid)}`);
        }
    });

    const makeOwner = (acc, who) => {
        const ctc = acc.contract(backend, ctcInfo);
        return backend.Bidder(ctc, {
            ...Common(who),
            getBid: (price) => {
                if (stdlib.add(price, stdlib.parseCurrency(1)) < bids[who].maxBid) {
                    const bid = stdlib.add(price, stdlib.parseCurrency(1));
                    if( who !== meter.bidder && bid > meter.lastBid){
                        console.log(who,"'s Bid:", fmt(bid), "ALGO");
                        meter.bidder = who;
                        meter.lastBid = bid;
                    };
                    return bid;
                };
                return price;
            }
        })
    };

    await Promise.all([
        backend.Creator(
            ctcCreator,{
            ...Common("Creator"),
            getId: id,
        }),

        makeOwner(accAlice, "Alice"),
        makeOwner(accBob, "Bob"),
    ]);
})();