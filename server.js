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

    // console.log((messageText.indexOf(userTag) != -1))

    return (messageText.indexOf(userTag) != -1)
};




slack.on("message", function (message) {
    // console.log(message)
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);
    // console.log(user)
    if (message.type === 'message' && !("subtype" in message) && isDirect(slack.self.id, message.text)) {
        // console.log (message.text)
        // channel.send("hello!")

        searchTerms = message.text.replace(makeMention(slack.self.id), "")

        // channel.send("i'm gonna try to find a gif with the terms: " + searchTerms)

        // 1. grab a random gif from the giphy api

        giphy.random({tag: searchTerms, rating: "pg-13"}, function (err, gif, res) {

            // console.log(gif)

            // 2. direct message it to the user

            dm = slack.getDMByName(user.name)

            dm.send("> How does this one look? \n> " + gif.data.url)
            // dm.send("> " + gif.data.url)

            // dm.send("hello!")

        })

        // 3. if the user responds "yes", post the gif to the channel
        // 4. if the user responds "no", goto step 1


    }

})




slack.login()
