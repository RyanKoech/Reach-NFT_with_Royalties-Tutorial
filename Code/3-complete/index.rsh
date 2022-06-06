'reach 0.1';
'use strict';

const Common ={ 
  seeOutcome: Fun([Address], Null),
  showBid: Fun([UInt], Null),
};

export const main =
  Reach.App(
    {},
    [Participant('Creator', {
      ...Common,
      getId: UInt
    }),
     ParticipantClass('Bidder', {
       ...Common,
       getBid: Fun([UInt], UInt)
     }),
     View('NFT', {
       owner: Address,
     }),
    ],
    (Creator, Bidder, vNFT) => {
      Creator.only(() => {
          const id = declassify(interact.getId);
      });
      Creator.publish(id);

      var [owner, price, lastBidder, keepGoing] = [Creator, 0, Creator, true];
      { vNFT.owner.set(owner); };
      invariant(balance() == 0);
      while (keepGoing) {
        commit();

        Bidder.only(() => {
          const bid = declassify(interact.getBid(price));
          const winner = this;
        })
        Bidder.publish(bid, winner)
          .when(bid>price && this !== lastBidder)
          .timeout(relativeTime(10), () => {
            each([Creator, Bidder], () => {
              interact.seeOutcome(lastBidder);
            });
            Bidder.pay(price).when(lastBidder == this).timeout(false);
            transfer(price).to(owner);

            [owner, price, lastBidder, keepGoing] = [lastBidder, 0, lastBidder, false]
            continue;
          })
        commit();

        each([Creator, Bidder], () => {
          interact.showBid(bid);
        });
        Anybody.publish();

        [owner, price, lastBidder, keepGoing] = [owner, bid, winner, true]
        continue;
      }
      commit();
      exit();
    }
  );