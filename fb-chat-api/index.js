"use strict";

const utils = require("./utils");
const log = require("npmlog");
const fs = require('fs');
const path = require('path');

let checkVerified = null;

const defaultLogRecordSize = 100;
log.maxRecordSize = defaultLogRecordSize;

function setOptions(globalOptions, options) {
	Object.keys(options).map(function (key) {
		switch (key) {
			case 'online':
				globalOptions.online = Boolean(options.online);
				break;
			case 'logLevel':
				log.level = options.logLevel;
				globalOptions.logLevel = options.logLevel;
				break;
			case 'logRecordSize':
				log.maxRecordSize = options.logRecordSize;
				globalOptions.logRecordSize = options.logRecordSize;
				break;
			case 'selfListen':
				globalOptions.selfListen = Boolean(options.selfListen);
				break;
			case 'selfListenEvent':
				globalOptions.selfListenEvent = options.selfListenEvent;
				break;
			case 'listenEvents':
				globalOptions.listenEvents = Boolean(options.listenEvents);
				break;
			case 'pageID':
				globalOptions.pageID = options.pageID.toString();
				break;
			case 'updatePresence':
				globalOptions.updatePresence = Boolean(options.updatePresence);
				break;
			case 'forceLogin':
				globalOptions.forceLogin = Boolean(options.forceLogin);
				break;
			case 'userAgent':
				globalOptions.userAgent = options.userAgent;
				break;
			case 'autoMarkDelivery':
				globalOptions.autoMarkDelivery = Boolean(options.autoMarkDelivery);
				break;
			case 'autoMarkRead':
				globalOptions.autoMarkRead = Boolean(options.autoMarkRead);
				break;
			case 'listenTyping':
				globalOptions.listenTyping = Boolean(options.listenTyping);
				break;
			case 'proxy':
				if (typeof options.proxy != "string") {
					delete globalOptions.proxy;
					utils.setProxy();
				} else {
					globalOptions.proxy = options.proxy;
					utils.setProxy(globalOptions.proxy);
				}
				break;
			case 'autoReconnect':
				globalOptions.autoReconnect = Boolean(options.autoReconnect);
				break;
			case 'emitReady':
				globalOptions.emitReady = Boolean(options.emitReady);
				break;
			default:
				log.warn("setOptions", "Unrecognized option given to setOptions: " + key);
				break;
		}
	});
}

//new update...
const configPath = process.cwd() + '/ryuuFca.json';  
let bypassEnabled = false;

if (!fs.existsSync(configPath)) {
    const defaultConfig = { "AutoBypass": true };
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 4), 'utf8');
} 

try {
    const config = require(configPath);
    bypassEnabled = config.AutoBypass || false;
} catch (error) {
    bypassEnabled = false;
}

function BypassAutomationNotification(resp, jar, globalOptions, appstate, ID) {
    if (!bypassEnabled) {
        log.info("login", "Bypass Currently Disabled.");
        return resp;
    } else {
        log.info("login", "Bypass Currently Enabled.");
    }
    
    try {
        let UID;
        if (ID) UID = ID
        else {
            UID = (appstate.find(i => i.key == 'c_user') || appstate.find(i => i.key == 'i_user'))
            UID = UID.value;
        }
        if (resp !== undefined) {
            if (resp.request.uri && resp.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
                if (resp.request.uri.href.includes('601051028565049')) {
                    const fb_dtsg = utils.getFrom(resp.body, '["DTSGInitData",[],{"token":"', '","');
                    const jazoest = utils.getFrom(resp.body, 'jazoest=', '",');
                    const lsd = utils.getFrom(resp.body, "[\"LSD\",[],{\"token\":\"", "\"}");

                    const FormBypass = {
                        av: UID,
                        fb_dtsg, jazoest, lsd,
                        fb_api_caller_class: "RelayModern",
                        fb_api_req_friendly_name: "FBScrapingWarningMutation",
                        variables: JSON.stringify({}),
                        server_timestamps: true,
                        doc_id: 6339492849481770
                    }
                    return utils.post("https://www.facebook.com/api/graphql/", jar, FormBypass, globalOptions)
                    .then(utils.saveCookies(jar)).then(function(res) {
                        log.warn("login", "Checkpoint detected. Bypass done...");
                        return process.exit(1);                    
                    });
                }
                else {
                    return resp;
                }
            }
            else {
                return resp
            }
        }
        else {
            return utils.get('https://www.facebook.com/', jar, null, globalOptions).then(function(res) {
                if (res.request.uri && res.request.uri.href.includes("https://www.facebook.com/checkpoint/")) {
                    if (res.request.uri.href.includes('601051028565049')) return { Status: true, Body: res.body }
                    else return { Status: false, Body: res.body }
                }
                else return { Status: false, Body: res.body }
            }).then(function(res) {
                if (res.Status === true) {
                    const fb_dtsg = utils.getFrom(res.Body, '["DTSGInitData",[],{"token":"', '","');
                    const jazoest = utils.getFrom(res.Body, 'jazoest=', '",');
                    const lsd = utils.getFrom(res.Body, "[\"LSD\",[],{\"token\":\"", "\"}");

                    const FormBypass = {
                        av: UID,
                        fb_dtsg, jazoest, lsd,
                        fb_api_caller_class: "RelayModern",
                        fb_api_req_friendly_name: "FBScrapingWarningMutation",
                        variables: JSON.stringify({}),
                        server_timestamps: true,
                        doc_id: 6339492849481770
                    }
                return utils.post("https://www.facebook.com/api/graphql/", jar, FormBypass, globalOptions).then(utils.saveCookies(jar))
                    .then(res => {
                        log.warn("login", "Checkpoint detected. Bypass done.....");
                        return res
                    })
                }
                else return res;

            })
            .then(function(res) {
                return utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true }).then(utils.saveCookies(jar))
            })
            .then(function(res) {
                return process.exit(1)
            })
        }
    }
    catch (e) {
        console.log(e)
    }
}


function buildAPI(globalOptions, html, jar) {
    const fb_dtsg = utils.getFroms(html, '["DTSGInitData",[],{"token":"', '","')[0]; //my brain is not braining on here.

    const maybeCookie = jar.getCookies("https://www.facebook.com").filter(function(val) {
        return val.cookieString().split("=")[0] === "c_user";
    });

    if (maybeCookie.length === 0) throw { error: "Error retrieving userID. This can be caused by a lot of things, including getting blocked by Facebook for logging in from an unknown location. Try logging in with a browser to verify." };

    if (html.indexOf("/checkpoint/block/?next") > -1) log.warn("login", "Checkpoint detected. Please log in with a browser to verify.");

    const userID = maybeCookie[0].cookieString().split("=")[1].toString();
    log.info("login", `Logged in as ${userID}`);
    
    try {
        clearInterval(checkVerified);
    } catch (_) { }

    const clientID = (Math.random() * 2147483648 | 0).toString(16);

        const CHECK_MQTT = {
            oldFBMQTTMatch: html.match(/irisSeqID:"(.+?)",appID:219994525426954,endpoint:"(.+?)"/),
            newFBMQTTMatch: html.match(/{"app_id":"219994525426954","endpoint":"(.+?)","iris_seq_id":"(.+?)"}/),
            legacyFBMQTTMatch: html.match(/\["MqttWebConfig",\[\],{"fbid":"(.*?)","appID":219994525426954,"endpoint":"(.*?)","pollingEndpoint":"(.*?)"/)
        }

        // all available regions =))
        /**
         * PRN = Pacific Northwest Region
         * VLL = Valley Region
         * ASH = Ashburn Region
         * DFW = Dallas/Fort Worth Region
         * LLA = Los Angeles Region
         * FRA = Frankfurt
         * SIN = Singapore 
         * NRT = Tokyo (Japan)
         * HKG = Hong Kong
         * SYD = Sydney
         */

        let Slot = Object.keys(CHECK_MQTT);
        var mqttEndpoint,region,irisSeqID;
        Object.keys(CHECK_MQTT).map(function(MQTT) {
            if (CHECK_MQTT[MQTT] && !region) {
                switch (Slot.indexOf(MQTT)) {
                    case 0: {
                        irisSeqID = CHECK_MQTT[MQTT][1];
                            mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\//g, "/");
                            region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                        return;
                    }
                    case 1: {
                        irisSeqID = CHECK_MQTT[MQTT][2];
                            mqttEndpoint = CHECK_MQTT[MQTT][1].replace(/\\\//g, "/");
                            region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                        return;
                    }
                    case 2: {
                        mqttEndpoint = CHECK_MQTT[MQTT][2].replace(/\\\//g, "/"); //this really important.
                            region = new URL(mqttEndpoint).searchParams.get("region").toUpperCase();
                        return;
                    }
                }
            return;
            }
        });   

        const regions = [
            {
                code: "PRN",
                name: "Pacific Northwest Region",
                location: "Khu vực Tây Bắc Thái Bình Dương"
            },
            {
                code: "VLL",
                name: "Valley Region",
                location: "Valley"
            },
            {
                code: "ASH",
                name: "Ashburn Region",
                location: "Ashburn"
            },
            {
                code: "DFW",
                name: "Dallas/Fort Worth Region",
                location: "Dallas/Fort Worth"
            },
            {
                code: "LLA",
                name: "Los Angeles Region",
                location: "Los Angeles"
            },
            {
                code: "FRA",
                name: "Frankfurt",
                location: "Frankfurt"
            },
            {
                code: "SIN",
                name: "Singapore",
                location: "Singapore"
            },
            {
                code: "NRT",
                name: "Tokyo",
                location: "Japan"
            },
            {
                code: "HKG",
                name: "Hong Kong",
                location: "Hong Kong"
            },
            {
                code: "SYD",
                name: "Sydney",
                location: "Sydney"
            },
            {
                code: "PNB",
                name: "Pacific Northwest - Beta",
                location: "Pacific Northwest "
            }
        ];

        if (!region) {
            region = ['prn',"pnb","vll","hkg","sin"][Math.random()*5|0];
            
        }
        if (!mqttEndpoint) {
            mqttEndpoint = "wss://edge-chat.facebook.com/chat?region=" + region;
        }
        log.info('login', `Sever region ${region}`);
    
        const Location = regions.find(r => r.code === region.toUpperCase());
    
        const ctx = {
            userID: userID,
            jar: jar,
            clientID: clientID,
            globalOptions: globalOptions,
            loggedIn: true,
            access_token: 'NONE',
            clientMutationId: 0,
            mqttClient: undefined,
            lastSeqId: irisSeqID,
            syncToken: undefined,
            mqttEndpoint: mqttEndpoint,
            region: region,
            firstListen: true,
            req_ID: 0,
            callback_Task: {},
            fb_dtsg
        };

    const api = {
        setOptions: setOptions.bind(null, globalOptions),
        getAppState: function getAppState() {
            return appState.filter((item, index, self) => self.findIndex((t) => { return t.key === item.key }) === index);
        }
    };

    const defaultFuncs = utils.makeDefaults(html, userID, ctx);

    // Load handlers from src directory
    require('fs').readdirSync(__dirname + '/src/')
      .filter((v) => v.endsWith('.js'))
      .map((v) => {
        const functionName = v.replace('.js', '');
        api[functionName] = require('./src/' + v)(defaultFuncs, api, ctx);
      });

    return {
      ctx: ctx,
      defaultFuncs: defaultFuncs,
      api: api
    };
}

// unfortunately login via credentials no longer works,so instead of login via credentials, use login via appstate intead.
function loginHelper(appState, email, password, globalOptions, callback, prCallback) {
    const jar = utils.getJar();

    // Better appstate validation and handling
    if (!appState || !Array.isArray(appState)) {
        callback({ error: "Appstate must be a valid array" });
        return;
    }

    try {
        // Convert and validate cookies
        appState.forEach(cookie => {
            // Skip invalid cookies
            if (!cookie.key && !cookie.name) return;

            const cookieStr = (cookie.key || cookie.name) + "=" + cookie.value + 
                "; expires=" + (cookie.expires || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString()) +
                "; domain=" + (cookie.domain || ".facebook.com") + 
                "; path=" + (cookie.path || "/");

            jar.setCookie(cookieStr, "http://" + (cookie.domain || "facebook.com"));
        });

        // Initial page load
        return utils.get('https://www.facebook.com/', jar, null, globalOptions, { noRef: true })
            .then(utils.saveCookies(jar))
            .then(res => {
                // Check if we got a valid response
                if (!res.body) {
                    throw { error: "Invalid response from facebook" };
                }

                // Build API
                const html = res.body;
                const buildResult = buildAPI(globalOptions, html, jar);
                
                // Return API through callback
                callback(null, buildResult.api);
            })
            .catch(err => {
                log.error("login", err);
                callback(err);
            });

    } catch (e) {
        log.error("login", e);
        callback({ error: "Failed to parse appstate: " + e.message });
    }
}

function login(loginData, options, callback) {
    if (utils.getType(options) === 'Function' || utils.getType(options) === 'AsyncFunction') {
        callback = options;
        options = {};
    }

    const globalOptions = {
        selfListen: false,
        listenEvents: true,
        listenTyping: false,
        updatePresence: false,
        forceLogin: false,
        autoMarkDelivery: true,
        autoMarkRead: false,
        autoReconnect: true,
        logRecordSize: defaultLogRecordSize,
        online: true,
        emitReady: false,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.7; rv:132.0) Gecko/20100101 Firefox/132.0"
    };

    setOptions(globalOptions, options);

    let prCallback = null;
    if (utils.getType(callback) !== "Function" && utils.getType(callback) !== "AsyncFunction") {
        let rejectFunc = null;
        let resolveFunc = null;
        var returnPromise = new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });
        prCallback = function(error, api) {
            if (error) return rejectFunc(error);
            return resolveFunc(api);
        };
        callback = prCallback;
    }

    // Validate loginData
    if (!loginData || !loginData.appState) {
        callback({ error: "Please provide appstate in loginData" });
        return returnPromise;
    }

    loginHelper(loginData.appState, loginData.email, loginData.password, globalOptions, callback, prCallback);
    return returnPromise;
}

module.exports = login;
