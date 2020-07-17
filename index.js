const multihashes = require("multihashes");
const BigNumber = require("bignumber.js");

exports.cidToArgs = (cid) => {
  const mh = multihashes.fromB58String(Buffer.from(cid));
  return {
    hashFunction: "0x" + mh.slice(0, 1).toString("hex"),
    size: "0x" + mh.slice(1, 2).toString("hex"),
    digest: "0x" + mh.slice(2).toString("hex"),
  };
};

exports.argsToCid = (hashFunction, size, digest) => {
  const hashHex = hashFunction.slice(2) + size.slice(2) + digest.slice(2);
  const hashBytes = Buffer.from(hashHex, "hex");
  return multihashes.toB58String(hashBytes);
};

// number is is equivalent to 1(128*0)
exports.fungibleBaseId = new BigNumber(
  "340282366920938463463374607431768211456"
);

// which is equivalent in binary to 1(126*0)1(128*0)
exports.nonFungibleBaseId = new BigNumber(
  "57896044618658097711785492504343953926975274699741220483192166611388333031424"
);

exports.printQueues = async (event, type) => {
  const granularity = await event.granularity();
  for (i = 1; i <= granularity.toNumber(); i++) {
    let percentage = (100 / granularity.toNumber()) * i;

    let queue = await event.buyingQueue(type, percentage);

    let head = queue["head"];
    let tail = queue["tail"];
    let numberTickets = queue["numberTickets"];
    let queueString = (percentage + "% (" + numberTickets + ")").padEnd(12);

    // buying queue
    let buyingString = "";
    for (j = tail - 1; j >= head; --j) {
      let queueEntryBuying = await event.getQueuedUserBuying(
        type,
        percentage,
        j
      );
      buyingString += queueEntryBuying["quantity"];
    }
    queueString += buyingString.padStart(15) + " --- ";

    //selling queue
    let sellingString = "";
    for (j = head; j < head; j++) {
      let queueEntrySelling = await event.getQueuedUserSelling(
        type,
        percentage,
        j
      );
      sellingString += queueEntrySelling["quantity"];
    }

    queueString += sellingString;

    console.log(queueString);
  }
};
