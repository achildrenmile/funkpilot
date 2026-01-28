// NATO Phonetic Alphabet
export const PHONETIC_ALPHABET: Record<string, string> = {
  'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta',
  'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel',
  'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima',
  'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa',
  'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango',
  'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-Ray',
  'Y': 'Yankee', 'Z': 'Zulu',
  '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
  '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
  '/': 'Stroke',
};

/**
 * Convert a callsign to NATO phonetic alphabet
 * Example: "OE8YML" → "Oscar Echo Eight Yankee Mike Lima"
 */
export function callToPhonetic(call: string): string {
  return call.toUpperCase()
    .split('')
    .map(char => PHONETIC_ALPHABET[char] || char)
    .join(' ');
}

/**
 * Convert a number to spoken form with proper spacing
 * Example: "599" → "Five Nine Nine"
 */
export function numberToSpoken(num: string): string {
  return num
    .split('')
    .map(char => PHONETIC_ALPHABET[char] || char)
    .join(' ');
}

/**
 * Process a phrase template with variables
 */
export function processTemplate(
  template: string,
  variables: Record<string, string>,
  usePhonetic: boolean = true
): string {
  let result = template;

  // Replace {CALL_PHONETIC} with phonetic callsign
  if (variables.CALL) {
    result = result.replace(
      /{CALL_PHONETIC}/g,
      usePhonetic ? callToPhonetic(variables.CALL) : variables.CALL
    );
    result = result.replace(/{CALL}/g, variables.CALL);
  }

  // Replace {RST} with spoken RST
  if (variables.RST) {
    result = result.replace(/{RST}/g, numberToSpoken(variables.RST));
  }

  // Replace {ZONE} with spoken zone
  if (variables.ZONE) {
    result = result.replace(/{ZONE}/g, numberToSpoken(variables.ZONE));
  }

  // Replace {SERIAL} with spoken serial number
  if (variables.SERIAL) {
    result = result.replace(/{SERIAL}/g, numberToSpoken(variables.SERIAL));
  }

  // Replace any other variables
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    result = result.replace(regex, value);
  }

  return result;
}
