
export const getIntegerPart=(str: string): number=> {
    const digitsOnly = str.replace(/\D/g, ""); // Remove all non-digit characters
    return parseInt(digitsOnly, 10) || 0; // Fallback to 0 if parsing fails
  }