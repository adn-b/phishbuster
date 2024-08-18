// JS for popup window. Mainly requests data from content and background scripts.

// <-------->
// sslChecker
// <-------->
// Executes function when page is loaded.
document.addEventListener('DOMContentLoaded', function() {
    console.log("SSL:")
    chrome.storage.local.get(["sslStatus"], function(result) {
        console.log("SSL:", result)
        if (result.sslStatus === true ) {
            document.getElementById('sslResult').textContent = "Secure (HTTPS)";
            document.getElementById('sslResult').style.color = "green"
            console.log("Site has SSL encryption.");
        }
        else if (result.sslStatus === false) {
            document.getElementById('sslResult').textContent = "Not Secure (HTTP)";
            document.getElementById('sslResult').style.color = "red"
            console.log("Site does not have SSL encryption.");
        }
    })
});

// <-------------->
// blacklistChecker
// <-------------->
// Executes function when page is loaded.
document.addEventListener('DOMContentLoaded', function() {
    // Gets "blacklistCheck" item from chrome.storage.local.
    chrome.storage.local.get(["blacklistCheck"], function(result) {
        let blacklistResult = result.blacklistCheck
        console.log(blacklistResult)
        // If the site is blacklisted
        if (blacklistResult === true) {
            document.getElementById('blacklistResult').textContent = "This site is blacklisted.";
            document.getElementById('blacklistResult').style.color = "red"
            console.log("Site blacklisted.");
        // If the site is not blacklisted
        } else if (blacklistResult === false) {
            document.getElementById('blacklistResult').textContent = "This site is not blacklisted.";
            document.getElementById('blacklistResult').style.color = "green"
            console.log("Site not blacklisted.");
        }
    });
});

// <------------->
// featureDetector
// <------------->
// Iframe detector.
// Runs on page load.
document.addEventListener('DOMContentLoaded', function() {
    // Retrieves "suspiciousIframeDetected" from local browser storage.
    chrome.storage.local.get(["suspiciousIframeDetected"], function(result) {
        let featureResult = result.suspiciousIframeDetected;
        // Logs result into console.
        console.log("iFrame Result:", featureResult);
        // If the value stored in the result is "true", changes element on popup.html.
        if (featureResult === true) {
            document.getElementById('featureDetectionResult').textContent = "Suspicious Features Detected";
            document.getElementById('featureDetectionResult').style.color = "red";
            console.log("Detected:", featureResult);
        // Does the same if the result is "false".
        } else if (featureResult === false) {
            document.getElementById('featureDetectionResult').textContent = "Suspicious Features Not Detected";
            document.getElementById('featureDetectionResult').style.color = "green";
            console.log("Not Detected", featureResult);
        }
    });
});

// Form destination checker.
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(["suspiciousFormDetected"], function(result) {
        let formResult = result.suspiciousFormDetected;
        console.log("Form Result:", formResult);
        if (formResult === true) {
            document.getElementById('formDetectionResult').textContent = "Suspicious Features Detected";
            document.getElementById('formDetectionResult').style.color = "red";
            console.log("Suspicious Form Detected", formResult);
            } else if (formResult === false) {
            document.getElementById('formDetectionResult').textContent = "Suspicious Features Not Detected";
            document.getElementById('formDetectionResult').style.color = "green";
            console.log("Suspicious Form Not Detected", formResult);
        }
    })
})

// <-------------->
// targetIdentifier
// <-------------->
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(["targetBrandIdentified", "targetBrand", "urlTargetResult"], function(result) {
        urlTargetBrandResult = result.urlTargetResult;
        console.log("URL:",urlTargetBrandResult);
        targetBrandResult = result.targetBrandIdentified;
        targetBrand = result.targetBrand;
        console.log(targetBrand);
        if (targetBrandResult === true || urlTargetBrandResult === true) {
            document.getElementById('targetBrandResult').textContent = `Target Brand Found (${targetBrand})`;
            document.getElementById('targetBrandResult').style.color = "red";
            console.log("Target Brand Found:", targetBrand);
        } 
        // else if (targetBrand) {
        //     document.getElementById('targetBrand').textContent = targetBrand;
        // } 
        else {
            document.getElementById('targetBrandResult').textContent = "Target Brand Not Found";
            document.getElementById('targetBrandResult').style.color = "green";
            console.log("Target Brand Not Found", targetBrand);
        };
    });
});

// <----------------------->
// totalScore and targetSite
// <----------------------->
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(["websiteLegitimate", "targetBrand"], function(result) {
        finalResult = result.websiteLegitimate
        console.log("Final Result:", finalResult);
        if (finalResult === false) {
            console.log("Website is not legitimate.")
            document.getElementById('siteResult').textContent = "Not Trusted";
            document.getElementById('siteResult').style.color = "red";
        }
        else if (finalResult === true) {
            console.log("Website is legitimate.")
            document.getElementById('siteResult').textContent = "Trusted";
            document.getElementById('siteResult').style.color = "green";
        }
        targetBrand = result.targetBrand;
        console.log("Target:", targetBrand);
        if (targetBrand) {
            console.log("FSJAIGJGIJG", targetBrand)
            document.getElementById('targetSite').textContent = targetBrand;
            document.getElementById('targetSite').style.color = "red";
        }
        else {
            console.log("no target")
        }
    })
})


// <----------->
// OpenAI Prompts
// <----------->

// These are individual listeners which send different prompts to the background.js script corresponding to which button was pressed on the GUI.
// background.js then sends these prompts to the gpt-3.5 API.

document.getElementById('send-prompt-target').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "sendPrompt", prompt: "You are an AI tool built in to a browser extension, which is used to detect phishing websites, and also educate users on why each feature has been flagged. This prompt has been sent after the user has asked for more information on what a target brand is in this context, and why it may have been detected. Please send a short generic but informative response (less than 50 words) explaining what a target brand would be in the context of a phishing website."}, function(response) {
        if (response && response.response) {
            const container = document.getElementById('response');
            const text = response.response
            container.innerHTML = "";
            // let i = 0;
            // const speed = 20;
            // function textEffect() {
            //     if (i < text.length) {
            //         container.innerHTML += text.charAt(i);
            //         i++;
            //         setTimeout(textEffect, speed);
            //     }
            // }
            // textEffect();
            container.innerHTML += text
        } else {
            document.getElementById('response').innerText = 'No response text received.';
        }
    });
});

document.getElementById('send-prompt-ssl').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "sendPrompt", prompt: "You are an AI tool built in to a browser extension, which is used to detect phishing websites, and also educate users on why each feature has been flagged. This prompt has been sent after the user has asked for more information on SSL certificates in this context, and why an SSL certificate is important or significant for detecting phishing websites. Please send a short generic but informative response (less than 50 words) explaining what the significance of an SSL certificate would be in the context of a phishing website."}, function(response) {
        if (response && response.response) {
            const container = document.getElementById('response');
            const text = response.response
            container.innerHTML = "";
            // let i = 0;
            // const speed = 20;
            // function textEffect() {
            //     if (i < text.length) {
            //         container.innerHTML += text.charAt(i);
            //         i++;
            //         setTimeout(textEffect, speed);
            //     }
            // }
            // textEffect();
            container.innerHTML += text
        } else {
            document.getElementById('response').innerText = 'No response text received.';
        }
    });
});

document.getElementById('send-prompt-blacklist').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "sendPrompt", prompt: "You are an AI tool built in to a browser extension, which is used to detect phishing websites, and also educate users on why each feature has been flagged. This prompt has been sent after the user has asked for more information on website blacklists in this context, and why they are important or significant for detecting phishing websites. Please send a short generic but informative response (less than 50 words) explaining why a website might have been blacklisted, and what this means in the context of phishing websites."}, function(response) {
        if (response && response.response) {
            const container = document.getElementById('response');
            const text = response.response
            container.innerHTML = "";
            // let i = 0;
            // const speed = 20;
            // function textEffect() {
            //     if (i < text.length) {
            //         container.innerHTML += text.charAt(i);
            //         i++;
            //         setTimeout(textEffect, speed);
            //     }
            // }
            // textEffect();
            container.innerHTML += text
        } else {
            document.getElementById('response').innerText = 'No response text received.';
        }
    });
});

document.getElementById('send-prompt-iframe').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "sendPrompt", prompt: "You are an AI tool built in to a browser extension, which is used to detect phishing websites, and also educate users on why each feature has been flagged. This prompt has been sent after the user has asked for more information on iframes which have been deemed suspicious because the source domain is foreign, or does not match the base domain of the website it is used on. Please send a short generic but informative response (less than 50 words) explaining why this might be considered suspicious, and what this means in the context of phishing websites."}, function(response) {
        if (response && response.response) {
            const container = document.getElementById('response');
            const text = response.response
            container.innerHTML = "";
            // let i = 0;
            // const speed = 20;
            // function textEffect() {
            //     if (i < text.length) {
            //         container.innerHTML += text.charAt(i);
            //         i++;
            //         setTimeout(textEffect, speed);
            //     }
            // }
            // textEffect();
            container.innerHTML += text
        } else {
            document.getElementById('response').innerText = 'No response text received.';
        }
    });
});

document.getElementById('send-prompt-form').addEventListener('click', function() {
    chrome.runtime.sendMessage({action: "sendPrompt", prompt: "You are an AI tool built in to a browser extension, which is used to detect phishing websites, and also educate users on why each feature has been flagged. This prompt has been sent after the user has asked for more information on form destinations which have been deemed suspicious because the destination domain is foreign, or does not match the base domain of the website it is used on. Please send a short generic but informative response (less than 50 words) explaining why this might be considered suspicious, and what this means in the context of phishing websites."}, function(response) {
        if (response && response.response) {
            const container = document.getElementById('response');
            const text = response.response
            container.innerHTML = "";
            // let i = 0;
            // const speed = 20;
            // function textEffect() {
            //     if (i < text.length) {
            //         container.innerHTML += text.charAt(i);
            //         i++;
            //         setTimeout(textEffect, speed);
            //     }
            // }
            // textEffect();
            container.innerHTML += text
        } else {
            document.getElementById('response').innerText = 'No response text received.';
        }
    });
});