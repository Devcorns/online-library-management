/**
 * Generate a unique receipt number: RCP-YYYYMMDD-XXXXX
 */
const generateReceiptNumber = () => {
  const date = new Date();
  const ymd =
    date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `RCP-${ymd}-${random}`;
};

module.exports = { generateReceiptNumber };
