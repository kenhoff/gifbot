#!/usr/bin/env node

Gifbot = require("./gifbot.js")
console.log(process.env.SLACK_TOKEN)
if (process.env.SLACK_TOKEN) {
	newGifbot = new Gifbot(process.env.SLACK_TOKEN)
	newGifbot.on("error", function (err) {
		console.log("Gifbot error:\n", err);
		process.exit(1)
	})
} else {
	console.log("No Slack token found in process.env.SLACK_TOKEN!!!");
	console.log("Run gifbot with:")
	console.log("===============================================")
	console.log("SLACK_TOKEN=insert-your-slack-token-here gifbot")
	console.log("===============================================")
}
