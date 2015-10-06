giphyToken = "dc6zaTOxFJmzC"

Slack = require("slack-client")
giphy = require("giphy")(giphyToken)
var events = require('events');

Gifbot = function(slackToken) {
	this.users = {}
		// see link below...
	events.EventEmitter.call(this)
	this.slackToken = slackToken
	this.slack = new Slack(slackToken, false, true)

	this.slack.login()
	this.slack.on("error", function(err) {
		// console.log(err);
		msg = err
		if (err == "invalid_auth") {
			msg = "Invalid slack API token: " + this.slackToken
		}
		this.emit("error", msg)
	}.bind(this))

	this.dmGif = function(searchTerms, userId, channelId) {
		// scrub search terms
		console.log(searchTerms.replace(/:/, "").trim());

		giphy.random({
			tag: searchTerms,
			rating: "pg-13"
		}, function(err, gif, res) {
			// 2. direct message it to the user
			dm = this.slack.getDMByName(this.slack.getUserByID(userId).name)
			if (gif.data.length == 0) {
				dm.send("I couldn't find any gifs of `" + searchTerms + "` :(")
			}
			else {
				dm.send("> How does this one look? Respond with `yes` or `no`\n> " + gif.data.url)
				this.users[userId] = {
					"search": searchTerms,
					"latestGif": gif.data.url,
					"channelId": channelId
				}
			}
		}.bind(this))
	}

	this.slack.on("message", function(message) {
		var channel = this.slack.getChannelGroupOrDMByID(message.channel);
		var user = this.slack.getUserByID(message.user);
		// If a user mentions gifbot in a channel...
		if (message.type === 'message' && !("subtype" in message) && isMention(this.slack.self.id, message.text)) {
			searchTerms = message.text.replace(makeMention(this.slack.self.id), "")
			this.dmGif(searchTerms, user.id, channel.id)
		}
		// If the user isn't gifbot...
		else if ((message.user != this.slack.self.id) && !("subtype" in message) && isDirect(message.channel)) {
			if (this.users[message.user] == null) {
				return
			} else if (message.text == "yes") {
				// post the latest gif for the user into the channel
				this.slack.getChannelGroupOrDMByID(this.users[message.user].channelId).send(this.users[message.user].latestGif)
			} else {
				this.dmGif(this.users[message.user].search, user.id, this.users[message.user].channelId)
			}
		}
	}.bind(this))
}

// ???
// http://www.sitepoint.com/nodejs-events-and-eventemitter/
Gifbot.prototype.__proto__ = events.EventEmitter.prototype

makeMention = function(userId) {
	// wraps userid in slack tag
	return '<@' + userId + '>';
};

isDirect = function (channel) {
	return (channel[0] == 'D')
}

isMention = function(userId, messageText) {
	var userTag = makeMention(userId);

	return (messageText.indexOf(userTag) != -1)
};

module.exports = Gifbot
