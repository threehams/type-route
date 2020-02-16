export function isNumeric(value: string | string[]): value is string {
  return (
    !Array.isArray(value) &&
    !isNaN(parseFloat(value)) &&
    /\-?\d*\.?\d*/.test(value)
  );
}
