apiToken = "xoxb-7232792789-hyoYDRsPRkTKmLyIQbkYkGNp"

Slack = require("slack-client")

slack = new Slack(apiToken, true, true)

slack.on("open", function () {
    console.log("opened!")
    // console.log(slack.channels)
})


makeMention = function(userId) {
    // wraps userid in slack tag

    return '<@' + userId + '>';
};

isDirect = function(userId, messageText) {
    var userTag = makeMention(userId);

    // console.log((messageText.indexOf(userTag) != -1))

    return (messageText.indexOf(userTag) != -1)
};




slack.on("message", function (message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    if (message.type === 'message' && isDirect(slack.self.id, message.text)) {
        console.log (message.text)
        // channel.send("hello!")
    }

})




slack.login()
