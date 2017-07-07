'use strict';

module.exports = function(Tweets) {
    var Twitter = require('twitter');

    var client = new Twitter({
      consumer_key: 'Z1KcGsxT1ooUAcid2v6br2jIX',
      consumer_secret: 'zPRgFgIDjXinSz6HT4jNJ2Fgjr7ntbHeC63bl4VJ6Fna45udn8',
      access_token_key: '440617400-xvWNMYcsIeCDUj4Fi5G9Dh3spbpTLnTsgyVddXPf',
      access_token_secret: 'jGIseW1t6uEQtoGgnJ8xDNld9S0JLdx4m1pZwNOQ6IDzx'
    });

    var startDate = new Date("2017-04-03");
    var endDate = new Date("2017-05-29");
    var last_id = 0;
    var last_date = null;
    var tweets = [];
    
    var registerTweets = function() {
        var backupTweets = tweets;
        tweets = [];
        backupTweets.forEach(function(tweet) {
            var tweet_date = new Date(tweet.created_at);
            if(tweet_date > startDate && tweet_date < endDate) {
                tweets.push(tweet);
            }
        });
        console.log("At the range we have: ",tweets.length);
    };

    var mining = function(last_id, last_date, screen_name, first_time) {
        var urlString = "https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name="+screen_name+"&count=200";
        if(!first_time) {
            urlString += "&max_id="+last_id;
        }
        client.get(urlString,{})
        .catch(function(err) {
        })
        .then(function(data) {
            data.forEach(function(data_item){
                var newData = {
                    text: data_item.text,
                    created_at: data_item.created_at,
                    retweet_count: data_item.retweet_count,
                    favorite_count: data_item.favorite_count
                };
                tweets.push(newData);
            });
            last_id = data[data.length-1].id_str;
            last_date = new Date(data[data.length-1].created_at);
            if(last_date > startDate ){
                mining(last_id, last_date, screen_name, false);
            } else {
                console.log("We finish searching of !! ",screen_name);
                console.log("We found :",tweets.length);
                registerTweets();
            }
        });
    };

    Tweets.getProfile = function(screen_name, cb) {
        if(!screen_name) {
            cb("Error! no tengo el nombre para buscar el perfil");
        }
        var stringUrl = "https://api.twitter.com/1.1/users/show.json?screen_name=" + screen_name;
        client.get(stringUrl, {})
        .catch(function(err){
            cb("!Hubo un error al obtener el perfil del usuario!");
        })
        .then(function(response){
            console.log("Enviamos el perfil de : ",response.screen_name);
            cb(null,response);
        });
    };

    Tweets.getTweets = function(screen_name,start_date, end_date, cb){
        if(!screen_name){
            cb("El screen_name del usuario a buscar es requerido!");
        }
        var last_id = 0;
        var last_date = null;
        tweets = [];
        var first_time = true;
        mining(last_id, last_date, screen_name, first_time);
        setTimeout(function(){
            if(tweets.length > 0) {
            cb(null, tweets);

            } else {
                cb(null, "No hay tweets");
            }
        }, 10000);
    };

    Tweets.remoteMethod('getTweets', {
        http: {
            verb: 'GET',
            path: '/getTweets/:screen_name/:start_date/:end_date'
        },
        accepts:[
            {arg: 'screen_name', type: 'string', required: true},
            {arg: 'start_date', type: 'string', required: false},
            {arg: 'end_date', type: 'string', required: false}
        ],
        returns : {
            type: 'object',
            root: true
        },
        description: 'Get tweets from a username given by the user'
    });

    Tweets.remoteMethod('getProfile',{
        http: {
            verb: 'GET',
            path: '/getProfile/:screen_name'
        },
        accepts: {
            arg: 'screen_name', type: 'string', required: true
        },
        returns: {
            type: 'object',
            root: true
        },
        description: 'Get profile information by an username given'
    });

};
