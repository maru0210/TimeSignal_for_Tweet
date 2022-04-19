function logOAuthURL() {
  var twitterService = getTwitterService();
  Logger.log(twitterService.authorize());
}
function getTwitterService() {
  const prop = PropertiesService.getScriptProperties();
  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth1.createService('TimeSignal_for_Tweet')
      // Set the endpoint URLs.
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')
      // Set the consumer key and secret.
      .setConsumerKey(prop.getProperty('ConsumerKey'))
      .setConsumerSecret(prop.getProperty('ConsumerKey_Secret'))
      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')
      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties());
}
function resetTwitterService() {
    var twitterService = getTwitterService();
    twitterService.reset();
}
function authCallback(request) {
  var twitterService = getTwitterService();
  var isAuthorized = twitterService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  }
}