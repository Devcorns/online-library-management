/**
 * Fine Calculation Service
 *
 * Fine is ONLY on late membership fee payment, NOT on late book return.
 *
 * Formula:
 *   If (currentDate > feeDueDate + gracePeriodDays)
 *     fine = (currentDate – feeDueDate – gracePeriodDays) × finePerDay
 *   Else
 *     fine = 0
 */

/**
 * Calculate the fine for a subscription at a given point in time.
 *
 * @param {Object} params
 * @param {Date}   params.feeDueDate       – the date the fee was due
 * @param {Number} params.gracePeriodDays   – configurable grace period
 * @param {Number} params.finePerDay        – rupees/currency per day
 * @param {Date}   [params.asOfDate=now]    – the date to compute fine against
 * @returns {{ fine: Number, daysLate: Number, isOverdue: Boolean }}
 */
const calculateFine = ({
  feeDueDate,
  gracePeriodDays,
  finePerDay,
  asOfDate = new Date(),
}) => {
  const due = new Date(feeDueDate);
  const now = new Date(asOfDate);

  // Deadline including grace
  const graceDeadline = new Date(due);
  graceDeadline.setDate(graceDeadline.getDate() + gracePeriodDays);

  if (now <= graceDeadline) {
    return { fine: 0, daysLate: 0, isOverdue: false };
  }

  // Calculate days after grace has elapsed
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLate = Math.floor((now - graceDeadline) / msPerDay);
  const fine = daysLate * finePerDay;

  return { fine, daysLate, isOverdue: true };
};

module.exports = { calculateFine };
