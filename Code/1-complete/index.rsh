'reach 0.1';

export const main =
  Reach.App(
    {},
    [Participant('Creator', {}), ParticipantClass('Bidder', {})],
    (Creator, Bidder) => {
      exit();
    });