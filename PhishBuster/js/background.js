// Console log for debugging - checking if service worker/background script is being executed.
console.log("Service Worker Working!");

// <!------------!>
// blacklistChecker
// <!------------!>

// Blacklist loader function.
let blacklist = [];
function loadBlacklist() {
    fetch("blacklist.json")
        .then(response => response.json())
        .then(data => {
            blacklist = data.blacklistedSites;
            console.log("Blacklist loaded:", blacklist)
        })
        .catch(error => console.error('Error:', error))
};

loadBlacklist();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "blacklistRequest") {
        sendResponse({blacklist: blacklist});
        return true;
    }
});


// <!------------!>
// targetIdentifier
// <!------------!>
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "loadTargets") {
        fetch(chrome.runtime.getURL('json/targets.json'))
            .then(response => response.json())
            .then(data => sendResponse({data: data}))
            .catch(error => console.error("Failed to load targets", error));
        return true;
    }
});


// <!--------------!>
// Trusted Calculator
// <!--------------!>


function sendAlert() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "showAlert", message: "Site May Be Phishing!"});
    });

}

function thresholdCheck(totalScore) {
    let websiteLegitimate = true;
    const threshold = 100;
    console.log(threshold, totalScore)
    if (totalScore >= threshold) {
        websiteLegitimate = false
        chrome.storage.local.set({websiteLegitimate})
        sendAlert();
    }
    else {
        console.log("Site is legitimate so far...")
        chrome.storage.local.set({websiteLegitimate})
        return false
    }
}

// "Timeout" function for use in the evaluateSite() function below. Takes number of milliseconds as parameter.
function timeout(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}


// Initalizing variables and objects.
var sslStatusScore = 0;
var formScore = 0;
var iframeScore = 0;
var brandScore = 0;
var brandMatchesScore = 0;
var formMatchesScore = 0;
var iFrameMatchesScore = 0;
let targetBrandInfo = {};
let iFrameMatches = {};
let formMatches = {};
let urlTargetScore = 0;

// Site evaluation function.
// Function assigns weights to the result of each check, and performs a sum calculation to give the website
// an overall "score", which is then checked against a given threshold. If exceeded, the site is deemed untrusted, and
// element in popup.html is updated.

function evaluateSite() {
    timeout(1000).then(() => {
        // CALCULATIONS
        let allResults = {}
        chrome.storage.local.get(null, function(items) {
            var totalScore = 0;
            allResults = items;
            console.log(allResults)
            iFrameMatches = allResults["iFrameMatches"];
            formMatches = allResults["formMatches"];
            targetBrandInfo = allResults["targetBrandInfo"];

            // console.log(allResults)
            // console.log(allResults["alertSent"])

                console.log("Beginnning check")
                if (allResults["blacklistCheck"] === true) {
                    totalScore = 100;
                    thresholdCheck(totalScore);
                    return false;
                } else if (allResults["blacklistCheck"] === false) {
                    if (allResults["urlLegitimate"] === true) {
                        let totalScore = 0;
                        chrome.storage.local.set({totalScore});
                        return false;
                    } else if (allResults["urlLegitimate"] === false) {
                        if (allResults["urlTargetResult"] === false) {
                            urlTargetScore = 0;
                        }
                        else if (allResults["urlTargetResult"] === true) {
                            urlTargetScore = 50;
                            console.log("FJAISFJAIFJIFJ", allResults["urlTargetResult"])
                        }
                        if (allResults["sslStatus"] === false ) {
                            sslStatusScore = 50;
                        } else if (allResults["sslStatus"] === true) {
                            sslStatusScore = 0
                        } 
                        if (allResults["suspiciousFormDetected"] === true) {
                            formScore = 20;
                        } else {
                            formScore = 0;
                        }
                        if (allResults["suspiciousIframeDetected"] === true) {
                            iframeScore = 5
                        } else {
                            iframeScore = 0;
                        }
                        if (allResults["targetBrandIdentified"] === true) {
                            if (allResults["targetBrand"] === "") {
                                brandScore = 0;
                            } else {
                                console.log(allResults["targetBrand"]);
                                brandScore = 70;
                            }
                        } else {
                            brandScore = 0;
                        }
                        if (Object.keys(targetBrandInfo).length === 0) {
                            brandMatchesScore = 0;
                        } else {
                            if (targetBrandInfo.matches >= 5) {
                                brandMatchesScore = targetBrandInfo.matches
                            } else {
                                brandMatchesScore = 0 
                            }
                        }
                        if (Object.keys(iFrameMatches).length === 0) {
                            iFrameMatchesScore = 0;
                        } else {
                            iFrameMatchesScore = Object.keys(iFrameMatches).length
                        }
                        if (Object.keys(formMatches).length === 0) {
                            formMatchesScore = 0;
                        } else {
                            formMatchesScore = Object.keys(formMatches).length
                        }
                    }
                }
                
                console.log(sslStatusScore, iframeScore, formScore, brandScore, brandMatchesScore, iFrameMatchesScore, formMatchesScore, urlTargetScore)
                var totalScore = sslStatusScore + iframeScore + formScore + brandScore + brandMatchesScore + iFrameMatchesScore + formMatchesScore + urlTargetScore
                console.log(totalScore)
                if (allResults["websiteWhitelisted"] === true) {
                    totalScore = 0;
                } else {
                    thresholdCheck(totalScore)
                }
            })
    })
}

// Listener for message to evaluate website once detection algorithms have finished running.
chrome.runtime.onMessage.addListener(function(request) {
    if (request.action === "evaluateSite") {
        evaluateSite()
    }
})


// <----------->
// OpenAI Prompt
// <----------->

// Listens for requests to send the prompt, takes the prompt from the request content and inserts it into the gpt-3.5 request body.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "sendPrompt") {
        console.log(request.prompt)
        const prompt = request.prompt
        fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Insert your key here."
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                temperature: 0.7,
                max_tokens: 150,
                messages: [{
                    role: "user",
                    content: prompt,
                }]
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)

        // Logic to return the response content back to popup.js so that it can be displayed on the GUI.
        if (data.choices && data.choices.length > 0) {
            const responseContent = data.choices[0].message.content;
            sendResponse({response: responseContent});
            console.log("Message:", responseContent)
        // Error handling in case of empty response or some sort of error.
        } else {
            console.error('No choices found in response:', data);
            sendResponse({response: 'No response from API or unexpected structure.'});
        }
        })
    // Keeps the messaging "channel" open for response from gpt-3.5.
    return true;
    };
});