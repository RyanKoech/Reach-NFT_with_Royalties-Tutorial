'reach 0.1';
'use strict';

const Common =
    { seeOutcome: Fun([Address], Null),
      showBid: Fun([UInt], Null),
      informTimeout: Fun([], Null),
    };

export const main =
  Reach.App(
    {},
    [Participant('Creator', {
      ...Common,
      getId: UInt,
      deadline: UInt,
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
          const deadline = declassify(interact.deadline);
      });
      Creator.publish(id, deadline);

      var [owner, price, lastBidder, keepGoing] = [Creator, 0, Creator, true];
      { vNFT.owner.set(owner); };
      invariant(balance() == 0);
      while (keepGoing) {
        commit();

        Bidder.only(() => {
          const bid = (this !== lastBidder && this !== owner) ? declassify(interact.getBid(price)) : price;
          const winner = (this !== lastBidder && this !== owner) ? this : lastBidder;
        });
        Bidder.publish(bid, winner)
          .when(bid>price && this !== lastBidder)
          .timeout(relativeTime(deadline), () => {
            each([Creator, Bidder], () => {
              interact.seeOutcome(lastBidder);
            });
            Bidder.pay(price).when(lastBidder == this).timeout(relativeTime(10), () => {
              each([Creator, Bidder], () => {
                interact.informTimeout();
              })

              Bidder.publish();
              [owner, price, lastBidder, keepGoing] = [owner, 0, owner, false]
              continue;
            });
            transfer(price).to(owner);

            [owner, price, lastBidder, keepGoing] = [lastBidder, 0, lastBidder, true]
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