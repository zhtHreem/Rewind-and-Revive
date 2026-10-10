// Editorial photos (Pexels, free for commercial use; see public/images/people/CREDITS.txt).
// `pos` keeps faces and key details inside the crop.
const photo = (file, name, pos = 'center') => ({
  image: `/images/people/${file}.jpg`,
  name,
  pos,
});

export const HERO_PHOTOS = [
  { ...photo('thrift-chest', 'Rummaging through a thrift chest', '50% 30%'), kind: 'find', to: '/catalogue', label: 'The thrill of the find' },
  { ...photo('tag-rack', 'Checking the tag on a pre-loved piece', '50% 40%'), kind: 'tag', to: '/catalogue', label: 'Every tag has a story' },
  { ...photo('sherpa-denim', 'Man in a sherpa-lined denim jacket', '50% 30%'), kind: 'menswear', to: '/catalogue', label: 'Vintage menswear' },
  { ...photo('scarf-shades', 'Woman in a silk scarf, sunglasses and bracelets', '50% 35%'), kind: 'accessories', to: '/catalogue', label: 'Scarves, shades & jewellery' },
  { ...photo('hanger-smile', 'Smiling woman holding a shirt on a hanger', '50% 38%'), kind: 'swap', to: '/catalogue', label: 'Swap, share, style' },
];

export const ROW_PHOTOS = [
  photo('friends-swap', 'Friends swapping clothes', '50% 30%'),
  photo('two-women', 'Two friends browsing a thrift shop', '50% 35%'),
  photo('denim-jacket', 'Denim jacket street style', '50% 25%'),
  photo('earring', 'Gold earring close-up', '40% 30%'),
  photo('rack-woman', 'Woman at a clothes rack', '50% 30%'),
  photo('gold-necklace', 'Gold necklace portrait', '50% 30%'),
  photo('mirror-fitting', 'Trying on clothes in a thrift fitting room', '50% 30%'),
  photo('cameo', 'Cameo necklace', '50% 55%'),
].map((p) => ({ ...p, to: '/catalogue' }));
