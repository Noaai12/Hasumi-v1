"use strict";

const utils = require("../utils");
const log = require("npmlog");

function formatData(data) {
    if (!data) return null;
    return {
        userID: data.uid ? utils.formatID(data.uid.toString()) : null,
        photoUrl: data.photo,
        indexRank: data.index_rank,
        name: data.text,
        isVerified: data.is_verified,
        profileUrl: data.path,
        category: data.category,
        score: data.score,
        type: data.type
    };
}

module.exports = function(defaultFuncs, api, ctx) {
    return function getUserID(name, callback) {
        let resolveFunc = function() {};
        let rejectFunc = function() {};
        const returnPromise = new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            callback = function(err, data) {
                if (err) return rejectFunc(err);
                resolveFunc(data);
            };
        }

        // Validate input
        if (!name || typeof name !== 'string') {
            callback({error: 'Please provide a valid name to search'});
            return returnPromise;
        }

        const form = {
            value: name.toLowerCase(),
            viewer: ctx.userID,
            rsp: "search",
            context: "search",
            path: "/home.php",
            request_id: utils.getGUID(),
            search_one: true // Add this to improve search accuracy
        };

        defaultFuncs
            .get("https://www.facebook.com/ajax/typeahead/search.php", ctx.jar, form)
            .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
            .then(function(resData) {
                if (resData.error) throw resData;

                const data = resData.payload.entries;
                
                // Filter out invalid or empty results
                const validData = data
                    .filter(entry => entry && entry.uid)
                    .map(formatData)
                    .filter(item => item !== null);

                if (validData.length === 0) {
                    throw {error: "No users found"};
                }

                callback(null, validData);
            })
            .catch(function(err) {
                log.error("getUserID", err);
                callback(err);
            });

        return returnPromise;
    };
};
