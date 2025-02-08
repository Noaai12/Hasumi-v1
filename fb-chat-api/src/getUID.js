/* eslint-disable linebreak-style */
"use strict";

const axios = require('axios');
const FormData = require('form-data');
const { URL } = require('url');
const log = require('npmlog');

module.exports = function (defaultFuncs, api, ctx) {
    async function tryMultipleEndpoints(url) {
        // Array of different API endpoints to try
        const endpoints = [
            {
                url: 'https://id.traodoisub.com/api.php',
                handler: async (formData) => {
                    const { data } = await axios.post(endpoints[0].url, formData);
                    return data.id;
                }
            },
            {
                url: 'https://api.findids.net/api/get-uid-from-username',
                handler: async (formData) => {
                    const { data } = await axios.post(endpoints[1].url, formData);
                    return data.data?.id;
                }
            }
        ];

        let lastError = null;
        
        // Try each endpoint until one works
        for (const endpoint of endpoints) {
            try {
                const formData = new FormData();
                formData.append(endpoint.url.includes('traodoisub') ? 'link' : 'username', url);
                
                const result = await endpoint.handler(formData);
                if (result && !isNaN(result)) {
                    return result;
                }
            } catch (err) {
                lastError = err;
                continue;
            }
        }
        
        throw lastError || new Error('Could not retrieve UID from any endpoint');
    }

    return function getUID(link, callback) {
        let resolveFunc = function() {};
        let rejectFunc = function() {};
        const returnPromise = new Promise(function(resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        if (!callback) {
            callback = function(err, uid) {
                if (err) return rejectFunc(err);
                resolveFunc(uid);
            };
        }

        // Validate and format the URL
        try {
            let fbUrl = link;
            if (typeof link !== 'string') {
                throw new Error('Invalid link format');
            }

            // Handle different URL formats
            if (link.includes('profile.php?id=')) {
                const uid = link.split('id=')[1]?.split('&')[0];
                if (uid && !isNaN(uid)) {
                    callback(null, uid);
                    return returnPromise;
                }
            }

            // Clean and format the URL
            if (!link.startsWith('http')) {
                fbUrl = `https://www.facebook.com/${link}`;
            }
            
            const url = new URL(fbUrl);
            if (!url.hostname.includes('facebook.com')) {
                throw new Error('Not a Facebook URL');
            }

            // Get the username/ID from the path
            const pathParts = url.pathname.split('/').filter(Boolean);
            if (pathParts.length === 0) {
                throw new Error('Invalid Facebook URL format');
            }

            // Try to get UID using multiple methods
            tryMultipleEndpoints(fbUrl)
                .then(uid => callback(null, uid))
                .catch(err => {
                    log.error('getUID', err);
                    callback(err);
                });

        } catch (err) {
            log.error('getUID', err);
            callback(err);
        }

        return returnPromise;
    };
};

