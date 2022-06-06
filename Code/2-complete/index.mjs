import { loadStdlib } from '@reach-sh/stdlib';
import * as backend from './build/index.main.mjs';

(async () => {
    const stdlib = await loadStdlib();
    const startingBalance = stdlib.parseCurrency(10);

    const accCreator = await stdlib.newTestAccount(startingBalance);
    const accAlice = await stdlib.newTestAccount(startingBalance);
    const accBob = await stdlib.newTestAccount(startingBalance);
 
    const ctcCreator = accCreator.contract(backend);
    const ctcAlice = accAlice.contract(backend, ctcCreator.getInfo());
    const ctcBob = accBob.contract(backend, ctcCreator.getInfo());

    const id = stdlib.randomUInt();
    const bids = {
        alice: 2,
        bob: 4,
    };

    const Common = (Who) => ({
        seeOutcome: (address) => {
            const winner = (stdlib.addressEq(accAlice.getAddress(), address)) ? "Alice" : "Bob";
            console.log(`${Who} Saw The Winner: `, winner);
        }
    });

    await Promise.all([
        backend.Creator(
            ctcCreator,{
            ...Common("Creator"),
            getId: id,
        }),
        backend.Bidder(
            ctcAlice,{
            ...Common("Alice"),
            getBid: () => {
                console.log("Alice's Bid: ", bids.alice, "ALGO")
                return stdlib.parseCurrency(bids.alice);
            }
        }),
        backend.Bidder(
            ctcBob,{
            ...Common("Bob"),
            getBid: () => {
                console.log("Bob's Bid: ", bids.bob, "ALGO")
                return stdlib.parseCurrency(bids.bob);
            }
        }),
    ]);
})();