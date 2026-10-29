import { PhoneNumberUtil, PhoneNumberFormat, PhoneNumberType } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export interface PhoneNormalizationResult {
  isValid: boolean;
  rawInput: string;
  e164: string;
  nationalFormatted: string;
  countryCode?: string;
  lineType: 'MOBILE' | 'FIXED_LINE' | 'VOIP' | 'TOLL_FREE' | 'PREMIUM_RATE' | 'SHARED_COST' | 'UNKNOWN';
  error?: string;
}

/**
 * Normalizes any raw phone input to E.164 format and classifies line type.
 * Default country is 'DE' (Germany).
 */
export function normalizePhoneNumber(
  rawPhone: string,
  defaultCountry: string = 'DE',
): PhoneNormalizationResult {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      rawInput: rawPhone || '',
      e164: '',
      nationalFormatted: '',
      lineType: 'UNKNOWN',
      error: 'Phone number is empty or not a string',
    };
  }

  // Clean obvious whitespace / formatting characters
  const trimmed = rawPhone.trim();

  try {
    const parsedNumber = phoneUtil.parseAndKeepRawInput(trimmed, defaultCountry.toUpperCase());
    const isValid = phoneUtil.isValidNumber(parsedNumber);

    if (!isValid) {
      return {
        isValid: false,
        rawInput: trimmed,
        e164: '',
        nationalFormatted: '',
        lineType: 'UNKNOWN',
        error: 'Phone number is invalid according to E.164 telecom rules',
      };
    }

    const e164 = phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);
    const nationalFormatted = phoneUtil.format(parsedNumber, PhoneNumberFormat.NATIONAL);
    const countryCode = phoneUtil.getRegionCodeForNumber(parsedNumber) || defaultCountry;

    const numberType = phoneUtil.getNumberType(parsedNumber);
    let lineType: PhoneNormalizationResult['lineType'] = 'UNKNOWN';

    switch (numberType) {
      case PhoneNumberType.MOBILE:
        lineType = 'MOBILE';
        break;
      case PhoneNumberType.FIXED_LINE:
      case PhoneNumberType.FIXED_LINE_OR_MOBILE:
        lineType = 'FIXED_LINE';
        break;
      case PhoneNumberType.VOIP:
        lineType = 'VOIP';
        break;
      case PhoneNumberType.TOLL_FREE:
        lineType = 'TOLL_FREE';
        break;
      case PhoneNumberType.PREMIUM_RATE:
        lineType = 'PREMIUM_RATE';
        break;
      case PhoneNumberType.SHARED_COST:
        lineType = 'SHARED_COST';
        break;
      default:
        lineType = 'UNKNOWN';
        break;
    }

    return {
      isValid: true,
      rawInput: trimmed,
      e164,
      nationalFormatted,
      countryCode,
      lineType,
    };
  } catch (err: any) {
    return {
      isValid: false,
      rawInput: trimmed,
      e164: '',
      nationalFormatted: '',
      lineType: 'UNKNOWN',
      error: err?.message || 'Failed to parse phone number',
    };
  }
}
