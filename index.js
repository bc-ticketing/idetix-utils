const multihashes = require("multihashes");
const BigNumber = require("bignumber.js");

// number is is equivalent to 1(128*0)
const fungibleBaseId = new BigNumber("340282366920938463463374607431768211456");

// which is equivalent in binary to 1(126*0)1(128*0)
const nonFungibleBaseId = new BigNumber("57896044618658097711785492504343953926975274699741220483192166611388333031424");

const cidToArgs = (cid) => {
  const mh = multihashes.fromB58String(Buffer.from(cid));
  return {
    hashFunction: "0x" + mh.slice(0, 1).toString("hex"),
    size: "0x" + mh.slice(1, 2).toString("hex"),
    digest: "0x" + mh.slice(2).toString("hex"),
  };
};

const argsToCid = (hashFunction, size, digest) => {
  const hashHex = hashFunction.slice(2) + size.slice(2) + digest.slice(2);
  const hashBytes = Buffer.from(hashHex, "hex");
  return multihashes.toB58String(hashBytes);
};

const prettyPrintAddress = (address) => address.slice(0, 6) + "..." + address.slice(-4);

const getNfId = (nfTicketId) => nfTicketId.minus(nonFungibleBaseId);

const printQueues = async (event, type) => {
  const queueFormatLength = 15;
  const percentageFormatLength = 7;
  const quantityFormatLength = 6;
  const queueSeparator = " --- ";

  const granularity = await event.granularity();
  for (i = 1; i <= granularity.toNumber(); i++) {
    let percentage = (100 / granularity.toNumber()) * i;

    let buyingQueue = await event.buyingQueue(type, percentage);
    let headBuying = buyingQueue["head"];
    let tailBuying = buyingQueue["tail"];
    let numberTicketsBuying = buyingQueue["numberTickets"];

    let queueString = (percentage + "%").padEnd(percentageFormatLength);
    queueString += ("(" + numberTicketsBuying + ")").padEnd(quantityFormatLength);

    // buying queue
    let buyingString = "";
    for (j = tailBuying - 1; j >= headBuying; --j) {
      let queueEntryBuying = await event.getQueuedUserBuying(type, percentage, j);
      buyingString += queueEntryBuying["quantity"];
    }
    queueString += buyingString.padStart(queueFormatLength) + queueSeparator;

    let sellingQueue = await event.sellingQueue(type, percentage);

    let headSelling = sellingQueue["head"];
    let tailSelling = sellingQueue["tail"];
    let numberTicketsSelling = sellingQueue["numberTickets"];

    //selling queue
    let sellingString = "";
    for (j = headSelling; j < tailSelling; j++) {
      let queueEntrySelling = await event.getQueuedUserSelling(type, percentage, j);
      sellingString += queueEntrySelling["quantity"];
    }
    queueString += sellingString.padEnd(queueFormatLength) + ("(" + numberTicketsSelling + ")").padStart(quantityFormatLength);
    console.log(queueString);
  }
  let totalString = "Total".padEnd(percentageFormatLength);
  totalString += ("(" +(await event.totalInBuying(type)).toString() + ")").padEnd(queueFormatLength + quantityFormatLength);
  totalString += queueSeparator;
  totalString += ("(" + (await event.totalInSelling(type)).toString() + ")").padStart(queueFormatLength + quantityFormatLength);
  console.log(totalString);
};

const printNfSellOrders = async(event, type) => {
  let eventMetaData = await event.ticketTypeMeta(type);
  let supply = eventMetaData["supply"];
  const ticketIdFormatLength = 9
  const sellerFormatLength = 14
  const percentageFormatLength = 11

  console.log(
    "Ticket ID".padStart(ticketIdFormatLength),
    "Seller".padStart(sellerFormatLength),
    "Percentage".padStart(percentageFormatLength)
  );

  for(i=type.plus(1, 10); i.isLessThan(type.plus(supply, 10)); i=i.plus(1, 10)){
    let sellOrder = await event.nfTickets(i.toFixed());
    let seller = new BigNumber(sellOrder["userAddress"])
    if(!seller.isZero()){
      console.log(
        getNfId(i).toString().padStart(ticketIdFormatLength) +
        prettyPrintAddress(sellOrder["userAddress"]).padStart(sellerFormatLength) +
        (sellOrder["percentage"].toNumber().toString()).padStart(percentageFormatLength)
      );
    }
  }
  console.log("\nTotal: " + await event.totalInSelling(type));
}

module.exports = {
  fungibleBaseId,
  nonFungibleBaseId,
  cidToArgs,
  argsToCid,
  prettyPrintAddress,
  getNfId,
  printQueues,
  printNfSellOrders
}