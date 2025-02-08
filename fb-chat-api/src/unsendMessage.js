"use strict";

const utils = require("../utils");
const log = require("npmlog");

module.exports = function (defaultFuncs, api, ctx) {
  return function unsendMessage(messageID, callback) {
    let resolveFunc = function () {};
    let rejectFunc = function () {};
    const returnPromise = new Promise(function (resolve, reject) {
      resolveFunc = resolve;
      rejectFunc = reject;
    });

    if (!callback) {
      callback = function (err) {
        if (err) return rejectFunc(err);
        resolveFunc();
      };
    }

    // Add validation for messageID
    if (!messageID) {
      callback({ error: "Message ID cannot be empty" });
      return returnPromise;
    }

    const form = {
      message_id: messageID,
      source: "source:messenger:web",
    };

    defaultFuncs
      .post("https://www.facebook.com/messaging/unsend_message/", ctx.jar, form)
      .then(utils.parseAndCheckLogin(ctx, defaultFuncs))
      .then(function (resData) {
        if (resData.error) {
          throw resData;
        }
        return callback();
      })
      .catch(function (err) {
        log.error("unsendMessage", err);
        if (err.error === 1511951) {
          // Message already unsent or too old
          callback({
            error: "Message cannot be unsent - too old or already deleted",
          });
        } else {
          callback(err);
        }
      });

    return returnPromise;
  };
};
