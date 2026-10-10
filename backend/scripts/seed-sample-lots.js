// Adds (or removes) demo auction lots so the auction pages have realistic content.
// Demo lots carry isSample: true in the database (hidden from the UI) so they can be
// removed cleanly. No real people are named in the provenance text.
//
//   node scripts/seed-sample-lots.js                 add / refresh the sample lots
//   node scripts/seed-sample-lots.js --remove        delete every sample lot
//   node scripts/seed-sample-lots.js --replace-old   ALSO back up and delete the
//                                                    existing non-sample lots first
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import BiddingProduct from '../src/models/biddingProduct.js';
import Bid from '../src/models/bid.js';

const DAY = 24 * 60 * 60 * 1000;
const from = (days) => new Date(Date.now() + days * DAY);

// Prices are in US dollars.
// endsInDays > 0: open lot. soldFor set: closed archive lot (ended `endsInDays` days ago).
const LOTS = [
  // ---- gowns ----
  {
    name: 'Ivory tulle ball gown',
    lotCollection: 'Gowns',
    images: ['/images/lots/ivory-ball-gown.jpg'],
    description: 'Ivory tulle ball gown with a lace-appliqué bodice, fitted waist and a sweeping chapel train.',
    provenance: 'Commissioned for a society wedding and worn once, then kept in climate-controlled storage.',
    authenticity: 'Couture label and original garment bag included.',
    condition: 'Excellent. Professionally cleaned and pressed; train unmarked.',
    startingPrice: 640, estimateLow: 860, estimateHigh: 1290, endsInDays: 3.4,
  },
  {
    name: 'Ivory silk satin gown',
    lotCollection: 'Gowns',
    images: ['/images/lots/ivory-satin-gown.jpg'],
    description: 'Heavy silk satin gown with a high-low skirt, a structured bodice and a hand-finished hem.',
    provenance: 'From the archive of a bridal couturier.',
    authenticity: 'Atelier label and sample-room tag intact.',
    condition: 'Very good. One faint pressing mark inside the waistband.',
    startingPrice: 540, estimateLow: 710, estimateHigh: 1070, endsInDays: 8,
  },
  {
    name: 'Black beaded gown with textured wrap',
    lotCollection: 'Gowns',
    images: ['/images/lots/black-beaded-gown.jpg'],
    description: 'Floor-length black beaded gown with a plunging neckline, shown with a heavily textured evening wrap.',
    provenance: 'Worn to a film-festival premiere by a private client.',
    authenticity: 'Designer label and styling lookbook page included.',
    condition: 'Excellent. All beading secure; wrap lightly steamed.',
    startingPrice: 465, estimateLow: 610, estimateHigh: 930, endsInDays: 12,
  },
  {
    name: 'Emerald satin cocktail gown',
    lotCollection: 'Gowns',
    images: ['/images/lots/emerald-satin-gown.jpg'],
    description: 'Bias-cut emerald satin gown with a cowl neckline, side cut-out and a fluid skirt.',
    provenance: 'Styled for an editorial cover shoot.',
    authenticity: 'Designer label intact. Shoot credit sheet included.',
    condition: 'Very good. Worn once on set; no marks.',
    startingPrice: 250, estimateLow: 340, estimateHigh: 540, endsInDays: 16,
  },
  {
    name: 'Amethyst beaded evening gown',
    lotCollection: 'Gowns',
    images: ['/images/lots/amethyst-gown.jpg'],
    description: 'Hand-beaded amethyst bodice with a sheer lace neckline and a sculpted corset line.',
    provenance: 'Worn once at a charity gala; sold by the wearer’s stylist.',
    authenticity: 'Designer label intact. Original garment bag included.',
    condition: 'Excellent. Professionally cleaned, no missing beads.',
    startingPrice: 320, estimateLow: 430, estimateHigh: 640, endsInDays: 7,
  },
  {
    name: 'Crimson satin draped gown',
    lotCollection: 'Gowns',
    images: ['/images/lots/crimson-gown.jpg'],
    description: 'Crimson satin gown with a draped bodice, embroidered yoke and structured sleeves.',
    provenance: 'Made for a fashion-week show and kept in the designer’s archive.',
    authenticity: 'Archive tag and designer letter included.',
    condition: 'Very good. Minor steam marks near the hem.',
    startingPrice: 250, estimateLow: 340, estimateHigh: 500, endsInDays: 11,
  },
  // ---- timeless pieces ----
  {
    name: 'Classic camel trench coat',
    lotCollection: 'Timeless',
    images: ['/images/lots/camel-trench.jpg'],
    description: 'Double-breasted camel trench in gabardine with storm flap, belt and horn buttons.',
    provenance: 'Bought in the 1990s from a heritage outerwear house and well cared for since.',
    authenticity: 'Original label and care tag present.',
    condition: 'Very good. Soft patina on the cuffs, lining intact.',
    startingPrice: 195, estimateLow: 270, estimateHigh: 395, endsInDays: 5,
  },
  {
    name: 'Quilted evening bag with chain strap',
    lotCollection: 'Timeless',
    images: ['/images/lots/quilted-chain-bag.jpg'],
    description: 'Black quilted leather evening bag with a rose-gold chain strap and a signature bar clasp.',
    provenance: 'Consigned by a film costume stylist after a studio wardrobe clear-out.',
    authenticity: 'Authenticity certificate and original dust bag included.',
    condition: 'Excellent. Light wear to the chain; leather unmarked.',
    startingPrice: 215, estimateLow: 285, estimateHigh: 430, endsInDays: 2.2,
  },
  // ---- jewellery & timepieces ----
  {
    name: 'Double-strand pearl necklace',
    lotCollection: 'Jewellery box',
    images: ['/images/lots/pearl-necklace.jpg'],
    description: 'Two strands of lustrous freshwater pearls, hand-knotted on silk with a gold clasp.',
    provenance: 'Passed down through three generations of one family.',
    authenticity: 'Pearl grading report included.',
    condition: 'Excellent. Strong lustre; silk re-strung last year.',
    startingPrice: 320, estimateLow: 430, estimateHigh: 640, endsInDays: 9.5,
  },
  {
    name: 'Antique gilt casket with pearl strands',
    lotCollection: 'Jewellery box',
    images: ['/images/lots/pearl-casket.jpg'],
    description: 'Ornate gilt-metal jewellery casket, shown with several pearl strands trailing from the lid.',
    provenance: 'From a European estate sale.',
    authenticity: 'Dealer’s provenance letter included. Pearls sold with the casket.',
    condition: 'Good. Gilding rubbed on the edges, hinges sound.',
    startingPrice: 355, estimateLow: 500, estimateHigh: 750, endsInDays: 20,
  },
  {
    name: 'Diamond solitaire ring in 18k gold',
    lotCollection: 'Jewellery box',
    images: ['/images/lots/diamond-solitaire.jpg'],
    description: 'Round brilliant solitaire in a four-claw 18k gold setting, presented in its original case.',
    provenance: 'Never worn; returned from a cancelled engagement.',
    authenticity: 'Gemological report included.',
    condition: 'As new. Stone and setting unmarked.',
    startingPrice: 890, estimateLow: 1140, estimateHigh: 1710, endsInDays: 14,
  },
  {
    name: 'Peacock-eye sapphire and diamond pendant',
    lotCollection: 'Jewellery box',
    images: ['/images/lots/peacock-pendant.jpg'],
    description: 'Peacock-eye pendant set with a deep blue stone and pavé diamonds on a fine chain.',
    provenance: 'Part of a private estate collection.',
    authenticity: 'Gemological report included.',
    condition: 'Excellent. Stones secure, chain unbroken.',
    startingPrice: 430, estimateLow: 570, estimateHigh: 860, endsInDays: 19,
  },
  {
    name: 'Gold skeleton pocket watch',
    lotCollection: 'Timepieces',
    images: ['/images/lots/gold-pocket-watch.jpg'],
    description: 'Gold-cased hunter pocket watch with an open skeleton movement and roman numerals.',
    provenance: 'From a private collector of antique horology.',
    authenticity: 'Appraisal letter from an independent watchmaker included.',
    condition: 'Very good. Running; movement serviced in the last two years.',
    startingPrice: 540, estimateLow: 710, estimateHigh: 1140, endsInDays: 4.5,
  },
  // ---- stage & screen ----
  {
    name: 'Studded leather stage jacket',
    lotCollection: 'Stage & screen',
    images: ['/images/lots/studded-jacket.jpg'],
    description: 'Black leather biker jacket with silver studs, heart cut-outs and enamel pins.',
    provenance: 'Used as a stage costume on a regional concert tour.',
    authenticity: 'Tour wardrobe tag and photo-matched stills included.',
    condition: 'Good. Honest stage wear and patina on the cuffs.',
    startingPrice: 160, estimateLow: 215, estimateHigh: 340, endsInDays: 15,
  },
  {
    name: 'Cat-eye frames with gold heart clip',
    lotCollection: 'Stage & screen',
    images: ['/images/lots/cat-eye-frames.jpg'],
    description: 'Black acetate cat-eye frames shown with a gold heart clip.',
    provenance: 'From a photo-shoot styling archive.',
    authenticity: 'Maker’s mark inside the temple.',
    condition: 'Very good. No scratches to the frame.',
    startingPrice: 70, estimateLow: 100, estimateHigh: 160, endsInDays: 28,
  },
  // ---- sold archive (closed) ----
  {
    name: 'Lace-bodice tea-length gown',
    lotCollection: 'Gowns',
    images: ['/images/lots/lace-tea-gown.jpg'],
    description: 'Ivory tea-length gown with a beaded lace bodice and a full satin skirt.',
    provenance: 'From the archive of a bridal couturier.',
    authenticity: 'Atelier label intact.',
    condition: 'Excellent.',
    startingPrice: 180, estimateLow: 215, estimateHigh: 320, soldFor: 305, endsInDays: -6,
  },
  {
    name: 'Black crepe column gown',
    lotCollection: 'Gowns',
    images: ['/images/lots/black-column-gown.jpg'],
    description: 'Floor-length black crepe column gown with a low back and thin straps.',
    provenance: 'Worn to a gala dinner and sold by the wearer.',
    authenticity: 'Designer label intact.',
    condition: 'Very good.',
    startingPrice: 145, estimateLow: 180, estimateHigh: 270, soldFor: 230, endsInDays: -15,
  },
  {
    name: 'Pearl strands on silk',
    lotCollection: 'Jewellery box',
    images: ['/images/lots/pearls-on-silk.jpg'],
    description: 'A set of fine pearl strands and loose pearls, sold together.',
    provenance: 'From a private estate collection.',
    authenticity: 'Pearl grading report included.',
    condition: 'Excellent.',
    startingPrice: 105, estimateLow: 145, estimateHigh: 215, soldFor: 170, endsInDays: -22,
  },
  {
    name: 'Belted beige trench coat',
    lotCollection: 'Timeless',
    images: ['/images/lots/beige-trench.jpg'],
    description: 'Belted trench in cotton gabardine with a storm flap and a removable lining.',
    provenance: 'Bought new and worn for one season.',
    authenticity: 'Original label and care tag present.',
    condition: 'Very good.',
    startingPrice: 90, estimateLow: 115, estimateHigh: 170, soldFor: 135, endsInDays: -33,
  },
];

// Anonymous paddle numbers, like a real auction house. No real user is named, and the
// bidder ids are made up, so sample bids can never be attributed to anyone.
const increment = (c) => (c < 50 ? 1 : c < 200 ? 5 : c < 1000 ? 10 : c < 5000 ? 25 : 50);

const makeBids = (lot, doc) => {
  const open = doc.bidEndTime > new Date();
  const ceiling = open ? Math.round((lot.estimateLow || lot.startingPrice * 1.3) * 0.85) : lot.soldFor;
  const start = new Date(doc.bidStartTime).getTime();
  const stop = open ? Date.now() : new Date(doc.bidEndTime).getTime();
  const paddles = new Set();
  const nextPaddle = () => {
    let n;
    do { n = 100 + Math.floor(Math.random() * 800); } while (paddles.has(n));
    paddles.add(n);
    return n;
  };
  const wanted = open ? 3 + Math.floor(Math.random() * 6) : 6 + Math.floor(Math.random() * 4);
  const out = [];
  let amount = lot.startingPrice;
  for (let i = 0; i < wanted && amount <= ceiling; i += 1) {
    if (i > 0) amount += increment(amount) * (1 + Math.floor(Math.random() * 3));
    if (amount > ceiling) amount = ceiling;
    const at = new Date(start + ((stop - start) * (i + 1)) / (wanted + 1));
    out.push({
      productId: doc._id,
      bidderId: new mongoose.Types.ObjectId(),
      name: `Paddle ${nextPaddle()}`,
      bidAmount: amount,
      isSample: true,
      createdAt: at,
      updatedAt: at,
    });
    if (amount === ceiling) break;
  }
  // A sold lot's last bid must equal its final price.
  if (!open && out.length) out[out.length - 1].bidAmount = ceiling;
  return out;
};

const run = async () => {
  await connectDB();

  if (process.argv.includes('--replace-old')) {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const old = await BiddingProduct.find({ isSample: { $ne: true } }).lean();
    if (old.length) {
      const dir = path.join(here, '..', 'backups');
      fs.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, `auction-lots-before-replace-${new Date().toISOString().slice(0, 10)}.json`);
      fs.writeFileSync(file, JSON.stringify(old, null, 2));
      console.log(`Backed up ${old.length} existing lot(s) to ${file}`);
      const gone = await BiddingProduct.deleteMany({ isSample: { $ne: true } });
      console.log(`Deleted ${gone.deletedCount} existing lot(s).`);
    }
  }

  const removedBids = await Bid.deleteMany({ isSample: true });
  console.log(`Removed ${removedBids.deletedCount} sample bid(s).`);
  const removed = await BiddingProduct.deleteMany({ isSample: true });
  console.log(`Removed ${removed.deletedCount} existing sample lot(s).`);
  if (process.argv.includes('--remove')) {
    await mongoose.disconnect();
    return;
  }

  // Cycle lengths in days, staggered so something is always closing soon.
  const CYCLES = [3, 5, 7, 4, 9, 6, 12, 5, 8, 10, 4, 14, 6, 11, 7];
  const docs = LOTS.map(({ endsInDays, ...lot }, i) => ({
    ...lot,
    cycleDays: endsInDays > 0 ? CYCLES[i % CYCLES.length] : undefined,
    biddingModel: 'Highest Bidder',
    bidStartTime: from(Math.min(endsInDays, 0) - 7),
    bidEndTime: from(endsInDays),
    notificationsProcessed: true, // sample lots never trigger end-of-auction notifications
    isSample: true,
  }));
  const created = await BiddingProduct.insertMany(docs);
  console.log(`Added ${created.length} sample lot(s).`);

  const bids = created.flatMap((doc, i) => makeBids(LOTS[i], doc));
  if (bids.length) await Bid.collection.insertMany(bids);
  console.log(`Added ${bids.length} sample bid(s).`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
