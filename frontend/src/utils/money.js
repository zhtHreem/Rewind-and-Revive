// Every price in the app is stored and charged in US dollars.
export const formatMoney = (n) => {
  const value = Number(n || 0);
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
};

// Smallest sensible raise for a lot at the given current bid.
export const bidIncrement = (current) => {
  const c = Number(current || 0);
  if (c < 50) return 1;
  if (c < 200) return 5;
  if (c < 1000) return 10;
  if (c < 5000) return 25;
  return 50;
};
