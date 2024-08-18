// Initializing/clearing chrome local storage.
chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
});
chrome.storage.sync.clear();

// Sets default values for all detection results, to avoid stale data.
chrome.storage.local.set(
{"blacklistCheck": false, 
"sslStatus": true,
"suspiciousIframeDetected": false,
"suspiciousFormDetected": false,
"targetBrandIdentified": false,
"targetBrand": "",
"targetBrandInfo": {},
"formMatches": {},
"iFrameMatches": {},
"urlTargetResult": false,
"websiteWhitelisted": false,
"websiteLegitimate": true,
"urlLegitimate": false})

// Event listener to trigger page analysis.
document.addEventListener('DOMContentLoaded', () => {
    chrome.runtime.sendMessage({action: "blacklistRequest"}, function(response) {
        const blacklist = response.blacklist;
        blacklistCheck(blacklist);
    });
});

// Listener to handle alert request, listens for response from background.js.
chrome.runtime.onMessage.addListener(
    function(request) {
        if (request.action === "showAlert") {
            window.alert(request.message);
        }
    }
);


// <!----------!>
// blacklistCheck
// <!----------!>

function blacklistCheck(blacklist) {
    url = getDomainFromUrl(window.location.href);
    url = normalizeUrl(url)
    const blacklisted = blacklist.includes(url);
    if (blacklisted) {
        console.log("This site is blacklisted!")
        chrome.storage.local.set({"blacklistCheck": true})
        chrome.runtime.sendMessage({action: "evaluateSite"})
    } else {
        console.log("Site not blacklisted.")
        sslCheck()
    }
}


// <!----!>
// sslCheck
// <!----!>

// SSL Checker function. Checks if SSL is present on page.
function sslCheck() {
    result = "Not Detected"
    result = window.location.protocol === "https:" ? true : false;
    console.log("Checking SSL Status...", result);
    chrome.storage.local.set({ "sslStatus": result });
    console.log("SSL Status Saved:", result);
    targetIdentifier()
}


// <!------------!>
// targetIdentifier
// <!------------!>

// Target identifier script - takes a json (loaded in the background.js script and recieved here through asyncronous messages),
// and iteratively compares both the URL and all HTML text elements against each keyword in the json file, to
// identify potential brand targets.


// Initial function to set of chain of subsequent functions. This function normalizes the url
// and then requests the "targets.json" data from the background script.
function targetIdentifier() {
    // Extracts current window URL.
    url = window.location.href;
    url = normalizeUrl(String(url));

    // This section of code is to request data from the background.js script, which has accessed the targets.json file.
    chrome.runtime.sendMessage({action: "loadTargets"}, (response) => {
        console.log("Target site data loaded");
        // Accesses data from response, stores in "targets".
        targets = response.data
        // Initiates initial check. This function also executes the further checks with checkTargets() if url is not found to be a 
        // valid domain for list of target brands, and checkTargets() also executes the calculateTotalBrandMatches() function if needed.
        initialCheck(targets, url);
    })
}

// Function to check elements found in HTML and URL against the parsed json data from targets.json.
function urlTargetIdentifier(targets) {    
    let urlTargetResult = false;
    // Begins iterating through all values in the targets.json file (stored in "targets").
    Object.keys(targets).forEach(function(key) {
        console.log(key)
        if (url.includes(key.toLowerCase())) {
            // Creates object for individual brand matches within the URL, where the brand match is the brand name.
            const urlMatchKey = 'urlMatch';
            const urlMatchDetails = {
                keyword: key,
                brand: key,
                content: url,
                timestamp: new Date().toISOString()
            };
            let urlStorageObject = {};
            urlStorageObject[urlMatchKey] = urlMatchDetails;
            chrome.storage.local.set(urlStorageObject);
            
            // Considering this is within an if statement, the local storage value for "urlTargetResult" is set to true.
            urlTargetResult = true
            chrome.storage.local.set({"urlTargetResult": true, "targetBrand": key}, () => {
                console.log("Target brand identified from url");
            });
            return false;
        }
        // Nested iterative loop for each keyword within each key found in targets.json.
        targets[key].keywords.forEach(keyword => {
            // Checks URL against each keyword to establish if URL contains any keywords associated with brands.
            if (url.includes(keyword.toLowerCase())) {
                // console.log("URL SUS:", keyword.toLowerCase());
                // console.log("Target brand:", key);
                
                // Configures "urlStorageObject" with various details about the match, including timestamp.
                const urlMatchKey = 'urlMatch';
                const urlMatchDetails = {
                    keyword: keyword,
                    brand: key,
                    content: url,
                    timestamp: new Date().toISOString()
                };
                let urlStorageObject = {};
                urlStorageObject[urlMatchKey] = urlMatchDetails;
                chrome.storage.local.set(urlStorageObject);
                
                urlTargetResult = true
                // Considering this is within an if statement, the local storage value for "urlTargetResult" is set to true.
                chrome.storage.local.set({"urlTargetResult": true, "targetBrand": key}, () => {
                    console.log("Target brand identified from url");
                });
            }
        }); 
    });
    checkTargets(targets, urlTargetResult)
}

function checkTargets(targets, urlTargetResult) {
    // Now begins iterating through HTML elements.
    // Selects all text elements within website.
    const texts = document.querySelectorAll('p, h1, h2, h3, li, a, strong');
    
    // Sets up a counter variable for later use.
    let elementCounter = 0;

    // Begins iterative loop for each text element within texts.
    texts.forEach(text => {
        // Takes content from text and changes to lower case for compatibility with other comparing functions.
        const content = text.innerText.toLowerCase();
        
        // Now a nested iterative loop to check each text element against each keyword for each brand name in targets.json.
        Object.keys(targets).forEach(function(key) {
            if (content.includes(key.toLowerCase())) {
                // Creates brand match object for each individual brand match.
                const matchKey = `brandMatch_${elementCounter++}`;
                    const matchDetails = {
                        keyword: key,
                        brand: key,
                        content: text.innerText,
                        timestamp: new Date().toISOString()
                    };

                    let storageObject = {};
                    storageObject[matchKey] = matchDetails;
                    console.log(`Brand matched: Keyword "${key}", Brand "${key}"`, storageObject);
                    chrome.storage.local.set(storageObject);
            }
            // Accesses the keywords array of each brand.
            targets[key].keywords.forEach(keyword => {
                // If content contains the keyword then a "brand match" is created.
                // This if statement sets up a similar storage object as used in the URL check, and stores it in the local storage.
                if (content === keyword.toLowerCase()) {


                    // Creates brand match object for each individual brand match.
                    const matchKey = `brandMatch_${elementCounter++}`;
                    const matchDetails = {
                        keyword: keyword,
                        brand: key,
                        content: text.innerText,
                        timestamp: new Date().toISOString()
                    };

                    let storageObject = {};
                    storageObject[matchKey] = matchDetails;
                    console.log(`Brand matched: Keyword "${keyword}", Brand "${key}"`, storageObject);

                    chrome.storage.local.set(storageObject);
                };
            });
        });
    });
    // Sets "fItems" as an empty object in preparation for calculateTotalBrandMatches() to be called, and the target brand is calculated
    // by finding the brand with the highest mentions, and checking if it has met the threshold of mentions to be deemed suspicious.
    let fItems = {};
    calculateTotalBrandMatches(targets, fItems, urlTargetResult); 
};    

function normalizeUrl(url) {
    // Removes slash at end of url, to normalize the URL and help for comparisons in blacklist/whitelist.
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    // Converts url to lower case, again to normalize and aid with comparisons.
    return url.toLowerCase();
}

// Function to perform initial check: Checks if the site URL is a valid domain for any of the target sites in targets.json.
// If so, no further checks are performed, as site is deemed legitimate.
function initialCheck(targets, url) {
    websiteFound = false;
    console.log(`Current Website Safety Status: ${websiteFound}, URL is ${url}`)
    url = getDomainFromUrl(url);
    if (url.startsWith("www.")) {
        url = url.substring(4);
    }
    console.log("FJSIFJIFJIFJIFJAIF",url)
    chrome.storage.local.set({"urlLegitimate": false})

    // Iterates through brand names, checks if url is a valid URL in the targets.json whitelist.
    Object.keys(targets).forEach(brand => {
        if (websiteFound === false) {
            brandUrls = targets[brand].url;
            brandUrls = normalizeUrl(String(brandUrls))
            if (brandUrls.includes(url)) {
                console.log(`Website is ${url}, brand found as ${brand}`);
                websiteFound = true;
                chrome.storage.local.set({"urlLegitimate": true})
                chrome.storage.local.set({"websiteWhitelisted": true}, () => {
                    console.log("Website is safe, brand confirmed as:", websiteFound)
                });
            }
        }
    });

    // Ends analysis if website is deemed to be safe/in the whitelist, continues checks if not.
    if (websiteFound === true) {
        console.log("Site is safe.")
        return false;
    } else if (websiteFound === false) {
        console.log("Website may not be safe, conducting further checks.");
        urlTargetIdentifier(targets);
    };
};

// Function used to identify the most mentioned brand, and whether it has been mentioned enough to deem it suspicious.
function calculateTotalBrandMatches(targets, fItems, urlTargetResult) {
    // This initial section of code iterates through items in chrome storage and extracts only values beginning with "brandMatch_", aka 
    // our cases of brand matches.
    const prefix = "brandMatch_";
    
    const targetBrandInfo = {}
    chrome.storage.local.set({targetBrandInfo})
    
    // Gets everything from chrome storage.
    chrome.storage.local.get(null, function(items) {
        Object.keys(items).forEach(function(key) {
            if (key.startsWith(prefix)) {
                fItems[key] = items[key];
            }
        })

        // Creates an empty object for all brand matches, and iterates through each case, adding to a counter whenever each brand is
        // mentioned. We end up with an object contaning all brands mentioned, and the number of times it was mentioned.
        let brandMatches = {};

        // Goes through each brand in targets.json and creates an entry inside brandMatches, with 0 as the initial associated value.
        Object.keys(targets).forEach(brand => {
            brandMatches[brand] = 0;
        });
        
        // Now goes through each brand match (fItems) and for each item, checks if the brand name is inside brandMatches. If so, 1 is
        // added to the counter.
        Object.values(fItems).forEach(item => {
            if (brandMatches.hasOwnProperty(item.brand)) {
                brandMatches[item.brand] += 1;
            }
        });
        console.log("Total Brand Matches:",brandMatches);

        // Now finds the brand with the most matches. This brand is to be checked against the threshold and if so, stored as the target brand.
        let max = 0;
        let targetBrand = "";
        for (let match in brandMatches) {
            if (brandMatches[match]> max) {
                max = brandMatches[match];
                targetBrand = match;
            }
        };

        // Creates an object for the most mentioned brand, contaning the brand name, and how many times it was mentioned. 
        targetBrandInfo.brand = targetBrand;
        targetBrandInfo.matches = brandMatches[targetBrand];

        // Now checks if the most mentioned brand, was mentioned more than 5 times, which is the (current) threshold. If so, a true value
        // is set for the "targetBrandIdentified" value in local storage. If not, the value is set to false, and no target brand is stored.
        if (targetBrandInfo.matches >= 5) {
            if (urlTargetResult === false) {
                chrome.storage.local.set({ "targetBrandIdentified": true }, () => {
                    console.log("Target brand possibly found in HTML elements:", targetBrandInfo.brand);
                })
                chrome.storage.local.set({targetBrandInfo}, () => {
                    console.log("Saved brand info:", targetBrandInfo)
                });
                // Stores the target brand in local storage.
                chrome.storage.local.set({ "targetBrand": targetBrand }, () => {
                console.log("Target brand saved:", targetBrand);
            });
            } else {
                console.log("Target brand already found")
            }
        }
        else {
            chrome.storage.local.set({ "targetBrandIdentified": false }, () => {
                console.log("Target brand not found in HTML elements")})
        }
    });
    featureDetector();
};


// <!-----------!>
// featureDetector
// <!-----------!>

// Suspicious feature detector function. Checks for suspicious features, including anomalous iframes, and suspicious forms.

function featureDetector() {
    // This initial section is for parsing iframe 
    // Creates a constant consisting of all iframes within the website.
    const iframes = document.querySelectorAll('iframe');
    
    let iframeCounter = 0;

    // Begins an iterative loop for each iframe within the document.
    iframes.forEach(iframe => {
        // Creates a constant within the loop and stores the contents of the "src" attribute of the iframe.
        const src = iframe.getAttribute('src');
        // Console log for debugging.
        console.log("Checking iframe URL:",src);

        // If the function (defined below) returns true, the script logs this in the console. Mainly for debugging.
        // More functionality here later, as this response will be stored in chrome.storage.local and accessed by background.js later for calculations.
        if (iFrameCheck(src)) {
            console.log('Suspicious iframe detected:', src);
            detected = true;

            // Creates match object for iframe matches.
            const susiframeKey = `susIframe_${iframeCounter++}`;
            const iframeDetails = {
                src: src,
                timestamp: new Date().toISOString()
            }

            let iframeMatch = {};
            iframeMatch[susiframeKey] = iframeDetails;
            console.log("Created suspicious iframe entry:", iframeMatch);

            // Stores result
            chrome.storage.local.set({ "suspiciousIframeDetected": detected }, function() {
                console.log("Suspicious iframe result saved:", detected);
            });
            chrome.storage.local.set(iframeMatch)
        // Logs if not detected, mainly for debugging. 
        } else {     
                console.log("No Suspicious iFrames Detected.");
        }
    });
    
    // Separate section for form destination evaluation.
    // Defines constant of "forms" as any form element present in the HTML code.
    const forms = document.querySelectorAll('form');
    // Again sets the detected status of forms as false, used for the popup.js check.
    let formDetected = false;
    chrome.storage.local.set({ "suspiciousFormDetected": formDetected });

    let formCounter = 0;

    // Now begins the iterative loop through each form in "forms".
    forms.forEach(form => {
        // Gets the "action" tag from each form.
        const action = form.getAttribute('action');
        // Creates a constant for the absolute URL of the action URL.
        // Uses the same "URL" object as before, and evaluates the action tag's domain aganist the current window's base URL.

        // const absoluteActionUrl = new URL(action, window.location.href)
        
        // Console log, mainly for debugging.
        console.log('Form action:', action);
        
        // Checks the response from the function, defined later, to evaluate whether the absolute, or base URL, of the form action in question is suspicious.
        if (formCheck(action)) {
            // Sets the formDetected constant to true.
            formDetected = true;
            // Console logs for debugging.
            // Stores the formDetected value in local chrome storage.
            chrome.storage.local.set({ "suspiciousFormDetected": formDetected });

            // Creates match object for form matches.
            const susFormKey = `susForm_${formCounter++}`;
            const formDetails = {
                src: action,
                timestamp: new Date().toISOString()
            }

            let formMatch = {};
            formMatch[susFormKey] = formDetails;
            console.log("Created suspicious form entry:", formMatch);

            chrome.storage.local.set(formMatch)

        }
        else {
            console.log("No Suspicious Forms Detected.")
        }
    });

    // Prepares constants and sets for the iterative check below.
    const prefix1 = "susIframe_";
    const prefix2 = "susForm_"
    let fItems1 = {};
    let fItems2 = {};


    // This functionality is essentially filtering chrome storage items down to only form or iframe matches, to count the number of each.
    // Gets everything from chrome storage.
    chrome.storage.local.get(null, function(items) {
        Object.keys(items).forEach(function(key) {
            if (key.startsWith(prefix1)) {
                fItems1[key] = items[key];
            }
        })
        let iFrameMatches = {};
        iFrameMatches = fItems1;
        chrome.storage.local.set({"iFrameMatches": iFrameMatches}, () => {
            console.log("Suspicious iFrames Saved:", iFrameMatches)
        });

        Object.keys(items).forEach(function(key) {
            if (key.startsWith(prefix2)) {
                fItems2[key] = items[key];
            }
        })
        let formMatches= {};
        formMatches = fItems2;
        chrome.storage.local.set({"formMatches": formMatches}, () => {
            console.log("Suspicious Forms Saved:", formMatches)
        });
    });
    chrome.runtime.sendMessage({action: "evaluateSite"})
}

// Function for parsing domain from the source of an iframe. "src" is the parameter parsed into it by other functions.
function getDomainFromUrl(src) {
    try {
        // Creates constant, and creates a new object "URL", which comprises of the "src" parameter, and the current window's "base" URL, which is used as a comparison.
        // "base" URL is the root address of a site, e.g. in "barclays.com/support", "barclays.com" is the base URL. "window.location.href" gets the base URL and 
        // ignores the subsequent relative URL locations.
        // "URL" is a JS object which stores considerable amounts of data parsed from the given parameters.

        // Some functionality to ensure URL passed into the URL Object is a valid URL.
        // Also strips the base url of "www." to make it compatible with the urls in targets.json.
        base = src
        if (!base.startsWith('http://') && !base.startsWith('https://')) {
            base = 'https://' + base;
        }


        const urlObject = new URL(base);
        base = urlObject.hostname;

        // Returns the base URL from urlObject.
        return base;
    // Error debugging.
    } catch (error) {
        console.error('Invalid URL:', src, error);
        return null;
    }
}

// Function for checking if an iframe is suspicious. Achieves this by comparing the "iframeSrc" parameter, which is obtained using getDomainFromUrl() 
// and stored in constant "iframeDomain".
function iFrameCheck(iframeSrc) {
    // Parses full domain name from current window URL.
    const currentPageDomain = getDomainFromUrl(window.location.hostname);
    const iframeDomain = getDomainFromUrl(iframeSrc);

    // Console log for debugging.
    // console.log(iframeDomain);
    // console.log(currentPageDomain);
    // Performs comparison.
    if (currentPageDomain !== iframeDomain) {
        // This response is used by the if statement earlier to check if the iframe source is suspicious.
        return true;
    }
    else {
        return false;
    }
}

// Function for checking if a form is suspicious. Near identical fashion to the previous function for iframes.
function formCheck(formActionUrl) {
    // Defines a constant, then uses the getDomainFromUrl function to get the base URL from the parameter, which is the form's action tag.
    const formActionDomain = getDomainFromUrl(formActionUrl);
    const currentPageDomain = getDomainFromUrl(window.location.hostname);

    // Compares the currentPageDomain, with the base URL of the form action (formActionDomain).
    // Returns true if they do not match.

    // console.log("Page URL:", currentPageDomain, "Form action:", formActionDomain)
    if (currentPageDomain !== formActionDomain) {
        return true;

    }
    else {
        return false;
    }
}

