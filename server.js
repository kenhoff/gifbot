// TODO
// remove punctuation
// ignore blank replies

slackToken = "xoxb-7232792789-hyoYDRsPRkTKmLyIQbkYkGNp"
giphyToken = "dc6zaTOxFJmzC"

Slack = require("slack-client")
giphy = require("giphy")(giphyToken)

slack = new Slack(slackToken, true, true)

slack.on("open", function () {
    console.log("opened!")
    // console.log(slack)
})


makeMention = function(userId) {
    // wraps userid in slack tag

    return '<@' + userId + '>';
};

isDirect = function(userId, messageText) {
    var userTag = makeMention(userId);

    return (messageText.indexOf(userTag) != -1)
};




slack.on("message", function (message) {
    // console.log(message);
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    // console.log(channel)
    if (message.type === 'message' && !("subtype" in message) && isDirect(slack.self.id, message.text)) {
        searchTerms = message.text.replace(makeMention(slack.self.id), "")
        // 1. grab a random gif from the giphy api
        giphy.random({tag: searchTerms, rating: "pg-13"}, function (err, gif, res) {
            // 2. direct message it to the user
            dm = slack.getDMByName(user.name)
            dm.send("> How does this one look? \n> " + gif.data.url)
            users[user.id] = searchTerms
            console.log(users);
        })
        // 3. if the user responds "yes", post the gif to the channel
        // 4. if the user responds "no", goto step 1
    }

    if (channel.is_im) {
        console.log("got a dm");
        if (message.text == "yes") {
            console.log("posting gif");
        }
        else {
            console.log("finding new gif");
        }
    }

})

users = {}

//
//
//

slack.login()
