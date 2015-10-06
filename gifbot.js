// TODO
// remove punctuation
// ignore blank replies
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
		this.emit("error", err)
	}.bind(this))

	this.dmGif = function(searchTerms, userId, channelId) {
		giphy.random({
			tag: searchTerms,
			rating: "pg-13"
		}, function(err, gif, res) {
			// 2. direct message it to the user
			dm = this.slack.getDMByName(this.slack.getUserByID(userId).name)
			dm.send("> How does this one look? \n> " + gif.data.url)
			users[userId] = {
					"search": searchTerms,
					"latestGif": gif.data.url,
					"channelId": channelId
				}
				// console.log(users);
		})
	}

	this.slack.on("message", function(message) {
		// console.log(message);
		// console.log(this.users)
		var channel = this.slack.getChannelGroupOrDMByID(message.channel);
		var user = this.slack.getUserByID(message.user);
		// console.log(channel)


		// If a user mentions gifbot in a channel...
		if (message.type === 'message' && !("subtype" in message) && isDirect(this.slack.self.id, message.text)) {
			searchTerms = message.text.replace(makeMention(this.slack.self.id), "")
				// 1. grab a random gif from the giphy api
			this.dmGif(searchTerms, user.id, channel.id)
				// 3. if the user responds "yes", post the gif to the channel
				// 4. if the user responds "no", goto step 1
		}



		// If the user isn't gifbot...
		// ignore message events sent by posting to the DM channel
		else if ((message.user != this.slack.self.id) && !("subtype" in message)) {
			if (this.users[message.user] == null) {
				return
			} else if (message.text == "yes") {
				// console.log("posting gif");
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

module.exports = Gifbot



// this.slack.on("open", function() {
// 	// console.log("opened!")
// 	// console.log(slack)
// })


makeMention = function(userId) {
	// wraps userid in slack tag
	return '<@' + userId + '>';
};

isDirect = function(userId, messageText) {
	var userTag = makeMention(userId);

	return (messageText.indexOf(userTag) != -1)
};
