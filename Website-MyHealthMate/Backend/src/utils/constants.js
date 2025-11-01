const WEBSITE_DOMAIN = process.env.NODE_ENV === 'production'
  ? process.env.WEBSITE_DOMAIN_PRODUCTION
  : process.env.WEBSITE_DOMAIN_DEVELOPMENT

export { WEBSITE_DOMAIN
 }
