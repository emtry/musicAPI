var url = require('url');
var util = require('util');
const express = require('express');
const request = require('request');
var async = require('async');


const api = express();
var qqapi = 'http://127.0.0.1:1326'
var netapi = 'http://127.0.0.1:6824'

api.use(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });

    var pathname = url.parse(req.url, true).pathname;
    var params = url.parse(req.url, true).query;

    if (pathname == "/search") {
        async.parallel({
                qq: function(callback) {
                    qqsearch(params.key, params.pageSize, function(data) {

                        callback(null, data);
                    });
                },
                net: function(callback) {
                    netsearch(params.key, params.pageSize, function(data) {

                        callback(null, data);
                    });
                }
            },
            function(err, result) {
                for (var i = 0, l = result.qq.length; i < l; i++) {
                    for (var j = 0, k = result.net.length; j < k; j++)
                        if (result.qq[i].albumname == result.net[j].albumname && result.qq[i].songname == result.net[j].songname && result.qq[i].singer == result.net[j].singer) {
                            result.net.splice(j, 1);
                            k--;
                        }
                }
                mix(result.qq, result.net, function(data) {

                    //res.end(util.inspect(data))
                    res.end(JSON.stringify(data))
                });
            }
        )
    } else if (pathname == "/preview") {
        async.parallel({
                qq: function(callback) {
                    qqsearch(params.key, params.pageSize, function(data) {
                        var ids = "";
                        for (var i = 0, l = data.length; i < l; i++) {
                            ids += data[i].id + ",";
                        }
                        qqgetURL(ids, function(result) {
                            if (result.result == 301) {
                                res.end(util.inspect(result))
                            } else {
                                for (var i = 0, l = data.length; i < l; i++) {
                                    data[i].url = result.data[data[i].id];
                                }

                                callback(null, data);
                            }
                        });
                    });
                },
                net: function(callback) {
                    netsearch(params.key, params.pageSize, function(data) {
                        var ids = "";
                        for (var i = 0, l = data.length; i < l; i++) {
                            ids += data[i].id + ",";
                        }
                        ids = ids.substr(0, ids.length - 1);
                        netgetURL(ids, function(result) {
                            for (var i = 0, l = data.length; i < l; i++) {
                                for (var j = 0, k = result.data.length; j < k; j++)
                                    if (data[i].id == result.data[j].id) {
                                        data[i].url = result.data[j].url;
                                    }
                            }

                            callback(null, data);
                        });
                    });
                }
            },
            function(err, result) {
                for (var i = 0, l = result.qq.length; i < l; i++) {
                    for (var j = 0, k = result.net.length; j < k; j++)
                        if (result.qq[i].albumname == result.net[j].albumname && result.qq[i].songname == result.net[j].songname && result.qq[i].singer == result.net[j].singer) {
                            result.net.splice(j, 1);
                            k--;
                        }
                }
                mix(result.qq, result.net, function(data) {

                    res.end(util.inspect(data))
                });
            }
        )
    } else if (pathname == "/song/url") {
        if (params.type == "qq") {
            qqgetURL(params.id, function(data) {

                res.end(JSON.stringify(data))
            });
        } else if (params.type == "net") {
            qqgetURL(params.id, function(data) {

                res.end(JSON.stringify(data))
            });
        }
    } else if (pathname == "/user/detail") {
        qq = params.id || '';
        qqdetail(qq, function(data) {

            res.end(JSON.stringify(data))
        });

    } else if (pathname == "/user/setCookie") {
        var post = '';

        req.on('data', function(chunk) {
            post += chunk.toString();
        });
        req.on('end', function() {
            qqsetcookie(post, function(data) {

                res.end(JSON.stringify(data))
            });
        });
    } else {

        res.end(pathname + "\n" + util.inspect(params));
    }

});

function qqsearch(key, pageSize, callback) {
    var data = [];
    pageSize = pageSize || 10;

    var temp_url = qqapi + "/search?key=" + encodeURI(key) + "&pageSize=" + pageSize;
    request(temp_url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var temp_result = JSON.parse(body);

            for (var i = 0, l = temp_result.data.list.length; i < l; i++) {
                var result = {};
                result.albumname = temp_result.data.list[i].albumname;
                result.songname = temp_result.data.list[i].songname;
                result.singer = temp_result.data.list[i].singer[0].name;
                result.id = temp_result.data.list[i].songmid;
                result.type = "qq";
                result.url = "";
                data.push(result);
            }

            callback(data);
        }
    });
}

function qqgetURL(id, callback) {
    qqdetail(12345, function(data) {
        if (data.result == 301) {

            callback(data);
        } else {
            var temp_url = qqapi + "/song/urls?id=" + id;
            request(temp_url, function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    var data = JSON.parse(body);

                    callback(data);
                }
            });
        }
    });
}

function qqdetail(qq, callback) {
    var temp_url = qqapi + "/user/detail?id=" + qq;
    request(temp_url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);

            callback(data);
        }
    });
}

function qqsetcookie(cookie, callback) {
    var temp_url = qqapi + "/user/setCookie";

    request({
        url: temp_url,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.parse(cookie)
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {

            callback(body)
        }
    });
}

function netsearch(key, pageSize, callback) {
    var data = [];
    limit = pageSize || 10;


    var temp_url = netapi + "/search?type=1&keywords=" + encodeURI(key) + "&limit=" + limit;
    request(temp_url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var temp_result = JSON.parse(body);

            for (var i = 0, l = temp_result.result.songs.length; i < l; i++) {
                var result = {};
                result.albumname = temp_result.result.songs[i].album.name;
                result.songname = temp_result.result.songs[i].name;
                result.singer = temp_result.result.songs[i].artists[0].name;
                result.id = temp_result.result.songs[i].id;
                result.type = "net";
                result.url = "";
                data.push(result);
            }

            callback(data);
        }
    });
}

function netgetURL(id, callback) {
    var temp_url = netapi + "/song/url?id=" + id;
    request(temp_url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);

            callback(data);
        }
    });
}

function mix(qq, net, callback) {
    var tol = [];
    for (let j = 0; j < qq.length; j++) {
        if (qq[j]) tol.push(qq[j]);
        if (net[j]) tol.push(net[j]);
    }

    callback(tol);
}

module.exports = api;