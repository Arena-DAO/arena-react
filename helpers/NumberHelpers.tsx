export function convertPercentageToUint128(percent: number): bigint {
  const uint128Value = BigInt(percent + "0000000000000000");
  return uint128Value;
}
