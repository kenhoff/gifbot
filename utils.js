module.exports = {
	makeMention: function(userId) {
		// wraps userid in slack tag
		return '<@' + userId + '>';
	},

	isDirect: function (channel) {
		return (channel[0] == 'D')
	},

	isMention: function(userId, messageText) {
		var userTag = this.makeMention(userId);

		return (messageText.indexOf(userTag) != -1)
	},

	containsUser: function (messageText) {
		// e.g. "<@U078S7E81>"
		regex = /<@(U.*?)>/
		result = regex.exec(messageText)
		console.log(result);
		if (result) {
			return result[1]
		}
		else {
			return null
		}
	},

	containsChannel: function (messageText) {
		// e.g. "<#C078S7E81>"
		regex = /<#(C.*?)>/
		result = regex.exec(messageText)
		if (result) {
			return result[1]
		}
		else {
			return null
		}
	},

	makeChannel: function (channelId) {
		return '<#' + channelId + '>';
	},

	// formatSearchTerms: function (searchTerms) {
	scrubSearchString: function (searchString) {
		// scrub channels
		searchString = searchString.replace(/<#(C.*?)>/g, "")

		// scrub users
		searchString = searchString.replace(/<@(U.*?)>/g, "")

		// scrub all punctuation
		searchString = searchString.replace(/[.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"")

		// remove all extraneous whitespace
		searchString = searchString.replace(/\s{2,}/g," ")

		return searchString
	}
}
