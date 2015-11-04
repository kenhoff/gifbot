giphyToken = "dc6zaTOxFJmzC"

Slack = require("slack-client")
giphy = require("giphy")(giphyToken)
var sentiment = require('sentiment');
var events = require('events');
var utils = require('./utils');

Gifbot = function(slackToken) {
	this.users = {}

	// see link below...
	events.EventEmitter.call(this)

	this.slackToken = slackToken
	this.slack = new Slack(slackToken, false, true)

	this.slack.login()

	this.slack.on("open", function () {
		console.log("Connected at", new Date());
	})

	this.slack.on("error", function(err) {
		console.log(err);
		msg = err
		if (err.msg == "invalid channel id") {
			console.log("invalid channel");
			return
		}

		if (err == "invalid_auth") {
			msg = "Invalid slack API token: " + this.slackToken
		}

		this.emit("error", msg)
	}.bind(this))

	this.dmGif = function(searchTerms, userId, channelId) {

		searchTerms = utils.scrubSearchString(searchTerms)

		giphy.random({
			tag: searchTerms,
			rating: "pg-13"
		}, function(err, gif, res) {
			// 2. direct message it to the user
			dm = this.slack.getDMByName(this.slack.getUserByID(userId).name)
			if (gif.data.length == 0) {
				console.log("Gifbot couldn't find any gifs for", userId, "in", channelId, "with search terms:", searchTerms);
				dm.send("I couldn't find any gifs of `" + searchTerms + "` :(")
			}
			else {
				console.log("Gifbot suggested", gif.data.url, "for", userId, "in", channelId, "with search terms:", searchTerms);
				dm.send("> How does this one look?\n> " + gif.data.url)
				this.users[userId] = {
					"search": searchTerms,
					"latestGif": gif.data.url,
					"channelId": channelId,
					"isSearching": true,
					"datetime": new Date()
				}
			}
		}.bind(this))
	}

	this.slack.on("message", function(message) {
		var channel = this.slack.getChannelGroupOrDMByID(message.channel);
		var user = this.slack.getUserByID(message.user);

		searchTerms = message.text

		// If a user mentions gifbot in a channel...
		if (message.type === 'message' && !("subtype" in message) && utils.isMention(this.slack.self.id, message.text)) {
			console.log(message.user, "requested a gif for", searchTerms, "in", message.channel);
			this.dmGif(searchTerms, user.id, channel.id)
		}

		// If the user isn't gifbot, and the message is a direct message...
		else if ((message.user != this.slack.self.id) && !("subtype" in message) && utils.isDirect(message.channel)) {

			// If the message contains a reference to a channel, then start suggesting a gif
			targetChannel = utils.containsChannel(message.text)
			if (targetChannel) {
				console.log(message.user, "requested a gif for", searchTerms, "in", targetChannel);
				this.dmGif(searchTerms, user.id, targetChannel)
			}

			// If we've never seen this user before, ignore it
			else if (this.users[message.user] == null) {
				return
			}

			// ......do we actually need this?
			//  this user isn't currently searching for a gif, ignore it
			// else if (this.users[message.user]["isSearching"] == false) {
			// 	return
			// }

			// If the user says something like "yes", post the latest gif we sent them
			else if (sentiment(message.text).score > "0") {
				// post the latest gif for the user into the channel
				console.log(message.user, "accepted and posted gif", this.users[message.user].latestGif, "to", message.channel, "with search terms:", searchTerms);
				this.slack.getChannelGroupOrDMByID(this.users[message.user].channelId).send(this.users[message.user].latestGif)
				// this.users[message.user]["isSearching"] = false
				delete this.users[message.user]
			}

			// If the user says something like "no", find a new gif for them
			else if (sentiment(message.text).score < "0") {
				console.log(message.user, "rejected gif", this.users[message.user].latestGif, "for", message.channel, "with search terms:", searchTerms);
				this.dmGif(this.users[message.user].search, user.id, this.users[message.user].channelId)
			}

			// If we didn't understand what the user just said, let the user know that they should try again
			else {
				dm = this.slack.getDMByName(this.slack.getUserByID(user.id).name)
				dm.send("I didn't quite understand that :( try again? Maybe try responding with `yes` or `no`.")
			}
		}
	}.bind(this))
}

// ???
// http://www.sitepoint.com/nodejs-events-and-eventemitter/
Gifbot.prototype.__proto__ = events.EventEmitter.prototype

module.exports = Gifbot
