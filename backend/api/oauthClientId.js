const querystring = require('querystring')
const oauthApi = require('./oauthApi')

const config = require('../config')
const logger = require('../log')

const getClientCredentialsTokens = async () => {
  const oauthRequest = querystring.stringify({ grant_type: 'client_credentials' })

  const oauthResult = oauthApi
    .oauthApiFactory({
      clientId: config.apis.oauth2.systemClientId,
      clientSecret: config.apis.oauth2.systemClientSecret,
      url: config.apis.oauth2.url,
    })
    .makeTokenRequest(oauthRequest, 'PSH-client_credentials')

  logger.debug(`Oauth request for grant type '${oauthRequest.grant_type}', result status: ${oauthResult.status}`)
  return oauthResult
}

module.exports = {
  getClientCredentialsTokens,
}