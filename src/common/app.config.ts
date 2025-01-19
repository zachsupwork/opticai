/**
 * Application Identity (Brand)
 *
 * Also note that the 'Brand' is used in the following places:
 *  - README.md               all over
 *  - package.json            app-slug and version
 *  - [public/manifest.json]  name, short_name, description, theme_color, background_color
 */
export const Brand = {
  Title: {
    Base: 'AdvancedAI',
    Common: (process.env.NODE_ENV === 'development' ? '[DEV] ' : '') + 'big-AGI',
  },
  Meta: {
    Description: 'Launch AdvancedAI to unlock the full potential of AI, with precise control over your data and models. Voice interface, AI personas, advanced features, and fun UX.',
    SiteName: 'AdvancedAI | Precision AI for You',
    ThemeColor: '#32383E',
    TwitterSite: '@enricoros',
  },
  URIs: {
    Home: 'https://AdvancedAI.com',
    // App: 'https://get.AdvancedAI.com',
    CardImage: 'https://AdvancedAI.com/icons/card-dark-1200.png',
    OpenRepo: 'https://github.com/enricoros/AdvancedAI',
    OpenProject: 'https://github.com/users/enricoros/projects/4',
    SupportInvite: 'https://discord.gg/MkH4qj2Jp9',
    // Twitter: 'https://www.twitter.com/enricoros',
    PrivacyPolicy: 'https://AdvancedAI.com/privacy',
    TermsOfService: 'https://AdvancedAI.com/terms',
  },
  Docs: {
    Public: (docPage: string) => `https://AdvancedAI.com/docs/${docPage}`,
  }
} as const;