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

    await Promise.all([
        backend.Creator(
            ctcCreator,
            {},
        ),
        backend.Bidder(
            ctcAlice,
            {},
        ),
        backend.Bidder(
            ctcBob,
            {},
        ),
    ]);
})();