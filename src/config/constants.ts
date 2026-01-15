export const TRANSACTION_TYPES: {
  [key: string]: { name: string; sign: string };
} = {
  inc: { name: '수입', sign: '+' },
  exp: { name: '지출', sign: '-' },
};
