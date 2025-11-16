/**
 * JSDoc typedefs for runtime-free type hints (converted from TypeScript interfaces)
 * These are for editor/IDE documentation only and do not affect runtime.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} [age]
 * @property {string} [gender]
 * @property {string} [avatar]
 * @property {'user'|'admin'} [role]
 */

/**
 * @typedef {Object} PredictionAnswer
 * @property {number} questionId
 * @property {string} answer
 */

/**
 * @typedef {Object} PredictionResult
 * @property {string} id
 * @property {string} userId
 * @property {string} date
 * @property {'low'|'medium'|'high'} riskLevel
 * @property {number} probability
 * @property {PredictionAnswer[]} answers
 */

/**
 * @typedef {Object} ArticleSection
 * @property {string} title
 * @property {string[]} content
 * @property {string} [image]
 */

/**
 * @typedef {Object} ArticleAuthor
 * @property {string} name
 * @property {string} title
 * @property {string} avatar
 */

/**
 * @typedef {Object} Article
 * @property {string} id
 * @property {string} title
 * @property {string} excerpt
 * @property {'nutrition'|'lifestyle'|'testing'|'education'} category
 * @property {string} imageUrl
 * @property {string} readTime
 * @property {boolean} [featured]
 * @property {ArticleAuthor} [author]
 * @property {string} [publishDate]
 * @property {number} [views]
 * @property {{introduction:string,sections:ArticleSection[],conclusion:string,highlight?:string}} [content]
 */

/**
 * @typedef {Object} Comment
 * @property {string} id
 * @property {string} articleId
 * @property {string} userId
 * @property {string} userName
 * @property {string} [userAvatar]
 * @property {string} content
 * @property {string} timestamp
 * @property {number} likes
 */

/**
 * @typedef {Object} Question
 * @property {number} id
 * @property {string} text
 * @property {string[]} options
 * @property {number} riskWeight
 */

// No runtime exports necessary — this file provides JSDoc typedefs for editors.