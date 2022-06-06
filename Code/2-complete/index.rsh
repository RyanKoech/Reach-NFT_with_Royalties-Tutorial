'reach 0.1';
'use strict';

const Common =
    { seeOutcome: Fun([Address], Null) };

export const main =
  Reach.App(
    {},
    [Participant('Creator', {
      ...Common,
      getId: UInt,
    }),
     ParticipantClass('Bidder', {
       ...Common,
       getBid: Fun([], UInt)
     }),
    ],
    (Creator, Bidder) => {
      Creator.only(() => {
          const id = declassify(interact.getId);
      });
      Creator.publish(id);
      commit();

      Bidder.only(() => {
          const bid = declassify(interact.getBid());
          const winner = this;
      })
      Bidder.publish(bid, winner)
      commit();

      each([Creator, Bidder], () => {
          interact.seeOutcome(winner)
      })
      exit();
    });