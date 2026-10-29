export interface PiiTokenMap {
  [token: string]: string;
}

export interface MaskResult {
  maskedData: any;
  tokenMap: PiiTokenMap;
}

export class PiiMasker {
  private static readonly EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
  private static readonly PHONE_REGEX = /(?:\+49|0049|0)[1-9][0-9\s/.-]{6,15}/g;
  private static readonly POSTAL_REGEX = /\b\d{5}\b/g;

  /**
   * Masks PII in structured objects or strings, returning anonymized data and the token map.
   */
  public static mask(input: any, knownPii?: { firstName?: string; lastName?: string; phone?: string; email?: string; street?: string; city?: string; postalCode?: string }): MaskResult {
    const tokenMap: PiiTokenMap = {};
    let nameCounter = 1;
    let phoneCounter = 1;
    let emailCounter = 1;
    let streetCounter = 1;
    let cityCounter = 1;
    let postalCounter = 1;

    // Register known fields first
    if (knownPii?.firstName && knownPii.firstName.trim().length > 1) {
      const token = `[FIRST_NAME_${nameCounter++}]`;
      tokenMap[token] = knownPii.firstName.trim();
    }
    if (knownPii?.lastName && knownPii.lastName.trim().length > 1) {
      const token = `[LAST_NAME_${nameCounter++}]`;
      tokenMap[token] = knownPii.lastName.trim();
    }
    if (knownPii?.phone) {
      const token = `[PHONE_${phoneCounter++}]`;
      tokenMap[token] = knownPii.phone.trim();
    }
    if (knownPii?.email) {
      const token = `[EMAIL_${emailCounter++}]`;
      tokenMap[token] = knownPii.email.trim();
    }
    if (knownPii?.street) {
      const token = `[STREET_${streetCounter++}]`;
      tokenMap[token] = knownPii.street.trim();
    }
    if (knownPii?.city) {
      const token = `[CITY_${cityCounter++}]`;
      tokenMap[token] = knownPii.city.trim();
    }
    if (knownPii?.postalCode) {
      const token = `[POSTAL_${postalCounter++}]`;
      tokenMap[token] = knownPii.postalCode.trim();
    }

    const maskString = (text: string): string => {
      let result = text;

      // 1. Replace known values
      for (const [token, original] of Object.entries(tokenMap)) {
        if (original && original.length > 2) {
          result = result.split(original).join(token);
        }
      }

      // 2. Discover emails
      result = result.replace(PiiMasker.EMAIL_REGEX, (match) => {
        for (const [t, orig] of Object.entries(tokenMap)) {
          if (orig === match) return t;
        }
        const token = `[EMAIL_${emailCounter++}]`;
        tokenMap[token] = match;
        return token;
      });

      // 3. Discover phones
      result = result.replace(PiiMasker.PHONE_REGEX, (match) => {
        const cleaned = match.replace(/\s+/g, '');
        if (cleaned.length < 8) return match;
        for (const [t, orig] of Object.entries(tokenMap)) {
          if (orig === match) return t;
        }
        const token = `[PHONE_${phoneCounter++}]`;
        tokenMap[token] = match;
        return token;
      });

      return result;
    };

    const traverse = (obj: any): any => {
      if (typeof obj === 'string') {
        return maskString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(traverse);
      }
      if (obj !== null && typeof obj === 'object') {
        const copy: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          // Explicit field replacement
          if (k.toLowerCase().includes('first_name') || k === 'firstName') {
            const token = `[FIRST_NAME_${nameCounter++}]`;
            tokenMap[token] = String(v);
            copy[k] = token;
          } else if (k.toLowerCase().includes('last_name') || k === 'lastName') {
            const token = `[LAST_NAME_${nameCounter++}]`;
            tokenMap[token] = String(v);
            copy[k] = token;
          } else if (k.toLowerCase().includes('phone') || k === 'phoneE164' || k === 'phoneRaw') {
            const token = `[PHONE_${phoneCounter++}]`;
            tokenMap[token] = String(v);
            copy[k] = token;
          } else if (k.toLowerCase().includes('email')) {
            const token = `[EMAIL_${emailCounter++}]`;
            tokenMap[token] = String(v);
            copy[k] = token;
          } else if (k.toLowerCase().includes('street') || k === 'houseNumber') {
            const token = `[STREET_${streetCounter++}]`;
            tokenMap[token] = String(v);
            copy[k] = token;
          } else {
            copy[k] = traverse(v);
          }
        }
        return copy;
      }
      return obj;
    };

    const maskedData = traverse(input);
    return { maskedData, tokenMap };
  }

  /**
   * Restores anonymized tokens back to original values in a text string.
   */
  public static unmask(text: string, tokenMap: PiiTokenMap): string {
    let result = text;
    for (const [token, original] of Object.entries(tokenMap)) {
      result = result.split(token).join(original);
    }
    return result;
  }
}
