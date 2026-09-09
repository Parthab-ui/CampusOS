import { MerchantIntelligence, TransactionCategory } from '../core/types';

interface KnownMerchantRule {
  pattern: RegExp;
  canonicalName: string;
  domain: string;
  category: TransactionCategory;
  isSubscriptionVendor: boolean;
}

export class MerchantNormalizer {
  private static readonly KNOWN_MERCHANTS: KnownMerchantRule[] = [
    {
      pattern: /netflix/i,
      canonicalName: 'Netflix',
      domain: 'netflix.com',
      category: 'streaming_media',
      isSubscriptionVendor: true,
    },
    {
      pattern: /spotify/i,
      canonicalName: 'Spotify',
      domain: 'spotify.com',
      category: 'streaming_media',
      isSubscriptionVendor: true,
    },
    {
      pattern: /(aws|amazon web services|amzn.*cloud)/i,
      canonicalName: 'Amazon Web Services',
      domain: 'aws.amazon.com',
      category: 'cloud_infrastructure',
      isSubscriptionVendor: true,
    },
    {
      pattern: /figma/i,
      canonicalName: 'Figma',
      domain: 'figma.com',
      category: 'productivity',
      isSubscriptionVendor: true,
    },
    {
      pattern: /github/i,
      canonicalName: 'GitHub',
      domain: 'github.com',
      category: 'developer_tools',
      isSubscriptionVendor: true,
    },
    {
      pattern: /(openai|chatgpt)/i,
      canonicalName: 'OpenAI',
      domain: 'openai.com',
      category: 'ai_tools',
      isSubscriptionVendor: true,
    },
    {
      pattern: /anthropic|claude/i,
      canonicalName: 'Anthropic Claude',
      domain: 'anthropic.com',
      category: 'ai_tools',
      isSubscriptionVendor: true,
    },
    {
      pattern: /dropbox/i,
      canonicalName: 'Dropbox',
      domain: 'dropbox.com',
      category: 'productivity',
      isSubscriptionVendor: true,
    },
    {
      pattern: /google.*(storage|one|workspace|cloud)/i,
      canonicalName: 'Google One',
      domain: 'one.google.com',
      category: 'productivity',
      isSubscriptionVendor: true,
    },
    {
      pattern: /1password|agilebits/i,
      canonicalName: '1Password',
      domain: '1password.com',
      category: 'cybersecurity',
      isSubscriptionVendor: true,
    },
    {
      pattern: /zoom(\.us)?/i,
      canonicalName: 'Zoom',
      domain: 'zoom.us',
      category: 'productivity',
      isSubscriptionVendor: true,
    },
    {
      pattern: /apple(\.com)?/i,
      canonicalName: 'Apple',
      domain: 'apple.com',
      category: 'developer_tools',
      isSubscriptionVendor: false,
    },
    {
      pattern: /cloudflare/i,
      canonicalName: 'Cloudflare',
      domain: 'cloudflare.com',
      category: 'cybersecurity',
      isSubscriptionVendor: true,
    },
    {
      pattern: /vercel/i,
      canonicalName: 'Vercel',
      domain: 'vercel.com',
      category: 'cloud_infrastructure',
      isSubscriptionVendor: true,
    },
    {
      pattern: /datadog/i,
      canonicalName: 'Datadog',
      domain: 'datadoghq.com',
      category: 'developer_tools',
      isSubscriptionVendor: true,
    },
    {
      pattern: /slack/i,
      canonicalName: 'Slack',
      domain: 'slack.com',
      category: 'productivity',
      isSubscriptionVendor: true,
    },
    {
      pattern: /notion/i,
      canonicalName: 'Notion',
      domain: 'notion.so',
      category: 'productivity',
      isSubscriptionVendor: true,
    },
  ];

  /**
   * Normalizes a raw statement description into a clean MerchantIntelligence object
   */
  static normalize(rawDescription: string, fallbackCategory: TransactionCategory = 'software_saas'): MerchantIntelligence {
    if (!rawDescription) {
      return {
        canonicalName: 'Unknown Merchant',
        category: fallbackCategory,
        isKnownSubscriptionVendor: false,
      };
    }

    // 1. Check against known merchant registry
    for (const rule of this.KNOWN_MERCHANTS) {
      if (rule.pattern.test(rawDescription)) {
        return {
          canonicalName: rule.canonicalName,
          domain: rule.domain,
          cleanLogoSlug: rule.domain.split('.')[0],
          category: rule.category,
          isKnownSubscriptionVendor: rule.isSubscriptionVendor,
        };
      }
    }

    // 2. Heuristic cleansing for uncatalogued merchants
    const cleaned = this.cleanNoiseTokens(rawDescription);

    return {
      canonicalName: cleaned,
      category: fallbackCategory,
      isKnownSubscriptionVendor: /sub|recurring|monthly|membership/i.test(rawDescription),
    };
  }

  /**
   * Remove typical bank/card statement noise (phone numbers, card prefixes, state codes, invoice tags)
   */
  static cleanNoiseTokens(raw: string): string {
    let text = raw;

    // Remove payment gateway prefixes (e.g. PAYPAL *, STRIPE *, SQ *)
    text = text.replace(/^(paypal\s*\*|stripe\s*\*|sq\s*\*|tst\s*\*)/i, '');

    // Remove phone numbers (e.g., 800-123-4567, 866-579-7172)
    text = text.replace(/\b\d{3}[-.\s]??\d{3}[-.\s]??\d{4}\b/g, '');

    // Remove invoice references and ticket numbers (e.g. INV-12345, #901844, *PRO 3TB)
    text = text.replace(/(inv|ref|trn|ord)[-:\s]*\w+/gi, '');
    text = text.replace(/#\w+/g, '');

    // Remove common billing location artifacts
    text = text.replace(/\b(san francisco|los gatos|new york|san jose|seattle|toronto|boston|london|austin)\b/gi, '');
    text = text.replace(/\b(ca|ny|wa|ma|tx|il|fl|on|us|usa)\b/gi, '');

    // Remove business entity suffixes
    text = text.replace(/\b(inc|llc|corp|ltd|co|gmbh|sa)\b/gi, '');

    // Remove asterisks, dashes, dots, and trailing symbols
    text = text.replace(/[*#]/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();

    // Capitalize properly
    if (text.length > 0) {
      return text
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }

    return 'Miscellaneous Merchant';
  }
}
