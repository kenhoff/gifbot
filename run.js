#!/usr/bin/env node

Gifbot = require("./gifbot.js")
console.log(process.env.SLACK_TOKEN)
if (process.env.SLACK_TOKEN) {
	newGifbot = new Gifbot(process.env.SLACK_TOKEN)
} else {
	console.log("No Slack token found in process.env.SLACK_TOKEN!!!");
	console.log("Run gifbot with a command like:")
	console.log("================================================")
	console.log("SLACK_TOKEN=your-slack-token-here nodemon run.js")
	console.log("================================================")
}
