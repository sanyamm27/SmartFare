export function calculateTotalFare({
  baseFare,
  passengerCount,
  addonsPrice,
  isRoundTrip
}: {
  baseFare: number;
  passengerCount: number;
  addonsPrice: number;
  isRoundTrip: boolean;
}) {
  const taxesPerLeg = 840;
  
  // Passenger Multiplier is applied to the core prices!
  const totalTaxes = isRoundTrip ? (taxesPerLeg * 2 * passengerCount) : (taxesPerLeg * passengerCount);
  const flightCost = baseFare * passengerCount;
  
  // If it's a round trip, we cleanly double the Add-ons per the Quick-Fix explicitly!
  const finalAddonsPrice = isRoundTrip ? (addonsPrice * 2) : addonsPrice;

  const totalWithoutFee = flightCost + totalTaxes + finalAddonsPrice;
  const grandTotal = totalWithoutFee + 250; // Standard nominal platform fee

  return {
    flightCost,
    totalTaxes,
    finalAddonsPrice,
    totalWithoutFee,
    grandTotal
  };
}
