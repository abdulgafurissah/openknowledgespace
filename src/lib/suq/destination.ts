/**
 * Open Suq Destination & Fulfilment Routing Utilities
 * Helps classify orders into Local (Ghana), African (Self-Fulfilment / Local Print),
 * and International (Prodigi Print-on-Demand).
 */

export const AFRICAN_COUNTRY_CODES = new Set([
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CD', 'CG', 'CI',
  'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN', 'GW', 'KE', 'LS', 'LR',
  'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN',
  'SC', 'SL', 'SO', 'ZA', 'SS', 'SD', 'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW'
]);

export interface OrderDestinationInfo {
  type: 'local' | 'african' | 'international';
  label: string;
  countryCode: string;
  recommendedFulfilment: 'self_print' | 'prodigi';
  badgeStyle: {
    background: string;
    color: string;
    border: string;
  };
}

export function getOrderDestination(countryCode?: string | null): OrderDestinationInfo {
  const code = (countryCode || 'GH').toUpperCase().trim();

  if (code === 'GH') {
    return {
      type: 'local',
      label: 'Local (Ghana)',
      countryCode: 'GH',
      recommendedFulfilment: 'self_print',
      badgeStyle: {
        background: '#ecfdf5',
        color: '#065f46',
        border: '1px solid #a7f3d0',
      },
    };
  }

  if (AFRICAN_COUNTRY_CODES.has(code)) {
    return {
      type: 'african',
      label: `Africa (${code})`,
      countryCode: code,
      recommendedFulfilment: 'self_print',
      badgeStyle: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fde68a',
      },
    };
  }

  return {
    type: 'international',
    label: `International (${code})`,
    countryCode: code,
    recommendedFulfilment: 'prodigi',
    badgeStyle: {
      background: '#eff6ff',
      color: '#1e40af',
      border: '1px solid #bfdbfe',
    },
  };
}
