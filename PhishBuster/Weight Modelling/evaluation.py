import json

# Evaluation algorithm equipped with my modified & optimal weight model.
def process(data):
    totalScore = 0
    for key in data:
        value = data[key]
        if key == "Phishing":
            phishingResult = value
        elif key == "Blacklisted" and value == True:
            totalScore = 100
            break
        else:
            if key == "urlLegitimate" and value == True:
                totalScore = 0
                break
            else:
                if key == "TargetInUrl":
                    urlTargetScore = 50 if value else 0
                    totalScore += urlTargetScore
                if key == "NoSSL":
                    sslStatusScore = 50 if value else 0
                    totalScore += sslStatusScore
                if key == "SusForms":
                    formScore = 20 if value else 0
                    totalScore += formScore
                if key == "SusiFrames":
                    iframeScore = 5 if value else 0
                    totalScore += iframeScore
                if key == "TargetIdentified":
                    brandScore = 50 if value else 0
                    totalScore += brandScore
                if key == "Brand Matches":
                    brandMatchesScore = value if value >= 10 else 0
                    totalScore += brandMatchesScore
                if key == "Suspicious iFrames Found":
                    iFrameMatchesScore = value
                    totalScore += iFrameMatchesScore
                if key == "Suspicious Forms Found":
                    formMatchesScore = value
                    totalScore += formMatchesScore
    return totalScore, phishingResult


# Evaluation algorithm equipped with weight model interpreted from the "Random Forest" importance results.
def process_RF(data):
    totalScore = 0
    for key in data:
        value = data[key]
        if key == "Phishing":
            phishingResult = value
        elif key == "Blacklisted" and value == True:
            totalScore = 100
            break
        else:
            if key == "urlLegitimate" and value == True:
                totalScore = 0
            else:
                if key == "TargetInUrl":
                    urlTargetScore = 16 if value else 0
                    totalScore += urlTargetScore
                if key == "NoSSL":
                    sslStatusScore = 17 if value else 0
                    totalScore += sslStatusScore
                if key == "SusForms":
                    formScore = 7 if value else 0
                    totalScore += formScore
                if key == "SusiFrames":
                    iframeScore = 1 if value else 0
                    totalScore += iframeScore
                if key == "TargetIdentified":
                    brandScore = 59 if value else 0
                    totalScore += brandScore
                if key == "Brand Matches":
                    brandMatchesScore = value if value >= 5 else 0
                    totalScore += brandMatchesScore
                if key == "Suspicious iFrames Found":
                    iFrameMatchesScore = value
                    totalScore += iFrameMatchesScore
                if key == "Suspicious Forms Found":
                    formMatchesScore = value
                    totalScore += formMatchesScore
    return totalScore, phishingResult

# Evaluation algorithm equipped with weight model interpreted from the "Logistic Regression" importance results. 
def process_LR(data):
    totalScore = 0
    for key in data:
        value = data[key]
        if key == "Phishing":
            phishingResult = value
        elif key == "Blacklisted" and value == True:
            totalScore = 100
            break
        else:
            if key == "urlLegitimate" and value == True:
                totalScore = 0
            else:
                if key == "TargetInUrl":
                    urlTargetScore = 0 if value else 0
                    totalScore += urlTargetScore
                if key == "NoSSL":
                    sslStatusScore = 0 if value else 0
                    totalScore += sslStatusScore
                if key == "SusForms":
                    formScore = 7 if value else 0
                    totalScore += formScore
                if key == "SusiFrames":
                    iframeScore = 0 if value else 0
                    totalScore += iframeScore
                if key == "TargetIdentified":
                    brandScore = 93 if value else 0
                    totalScore += brandScore
                if key == "Brand Matches":
                    brandMatchesScore = value if value >= 5 else 0
                    totalScore += brandMatchesScore
                if key == "Suspicious iFrames Found":
                    iFrameMatchesScore = value
                    totalScore += iFrameMatchesScore
                if key == "Suspicious Forms Found":
                    formMatchesScore = value
                    totalScore += formMatchesScore
    return totalScore, phishingResult

# Evaluation algorithm equipped with weight model interpreted from the "XGradient Boost" importance results.
def process_XGB(data):
    totalScore = 0
    for key in data:
        value = data[key]
        if key == "Phishing":
            phishingResult = value
        elif key == "Blacklisted" and value == True:
            totalScore = 100
            break
        else:
            if key == "urlLegitimate" and value == True:
                totalScore = 0
            else:
                if key == "TargetInUrl":
                    urlTargetScore = 0 if value else 0
                    totalScore += urlTargetScore
                if key == "NoSSL":
                    sslStatusScore = 0 if value else 0
                    totalScore += sslStatusScore
                if key == "SusForms":
                    formScore = 0 if value else 0
                    totalScore += formScore
                if key == "SusiFrames":
                    iframeScore = 0 if value else 0
                    totalScore += iframeScore
                if key == "TargetIdentified":
                    brandScore = 100 if value else 0
                    totalScore += brandScore
                if key == "Brand Matches":
                    brandMatchesScore = value if value >= 5 else 0
                    totalScore += brandMatchesScore
                if key == "Suspicious iFrames Found":
                    iFrameMatchesScore = value
                    totalScore += iFrameMatchesScore
                if key == "Suspicious Forms Found":
                    formMatchesScore = value
                    totalScore += formMatchesScore
    return totalScore, phishingResult

# Set of functions which execute the "evaluate" function on a dataset as per the user's request.
def dataset1():
    with open("Weight Modelling/dataset1.json", "r") as file:
        data = json.load(file)
        evaluate(data)

def dataset2():
    with open("Weight Modelling/dataset2.json", "r") as file:
        data = json.load(file)
        evaluate(data)

def dataset3():
    with open("Weight Modelling/dataset3.json", "r") as file:
        data = json.load(file)
        evaluate(data)

# Function to evaluate algorithm on specified dataset, passed through "data" parameter.
def evaluate(data):
    passes,passes_RF,passes_LR,passes_XGB = 0,0,0,0
    misses, misses_RF, misses_LR, misses_XGB = 0,0,0,0
    falseflags, falseflags_RF, falseflags_LR, falseflags_XGB = 0,0,0,0

    for parent_key, nested_dict in data.items():
        # For each dataset entry, accesses the score evaluated by the algorithm, and the actual phishing/not phishing result.
        parent_score = int(process(nested_dict)[0])
        parent_score_RF = int(process_RF(nested_dict)[0])
        parent_score_LR = int(process_LR(nested_dict)[0])
        parent_score_XGB = int(process_XGB(nested_dict)[0])
        realPhishingValue = process(nested_dict)[1]
        realPhishingValue_RF = process_RF(nested_dict)[1]
        realPhishingValue_LR = process_LR(nested_dict)[1]
        realPhishingValue_XGB = process_XGB(nested_dict)[1]   

        # Decides whether the algorithm was correct or incorrect for each dataset entry.
        if parent_score >= 100:
            phishingValue = True
        else:
            phishingValue = False
        if phishingValue == realPhishingValue:
            passes += 1
        else:
            if phishingValue == True:
                falseflags += 1
            elif phishingValue == False:
                misses += 1

        if parent_score_RF >= 100:
            phishingValue_RF = True
        else:
            phishingValue_RF = False
        if phishingValue_RF == realPhishingValue_RF:
            passes_RF += 1
        else:
            if phishingValue_RF == True:
                falseflags_RF += 1
            elif phishingValue_RF == False:
                misses_RF += 1

        if parent_score_LR >= 100:
            phishingValue_LR = True
        else:
            phishingValue_LR = False
        if phishingValue_LR == realPhishingValue_LR:
            passes_LR += 1
        else:
            if phishingValue_LR == True:
                falseflags_LR += 1
            elif phishingValue_LR == False:
                misses_LR += 1

        if parent_score_XGB >= 100:
            phishingValue_XGB = True
        else:
            phishingValue_XGB = False
        if phishingValue_XGB == realPhishingValue_XGB:
            passes_XGB += 1
        else:
            if phishingValue_XGB == True:
                falseflags_XGB += 1
            elif phishingValue_XGB == False:
                misses_XGB += 1

    # Prints results.
    print(f"Mine - Passes: {passes}, Misses: {misses}, False Flags: {falseflags}")
    print(f"RF - Passes: {passes_RF}, Misses: {misses_RF}, False Flags: {falseflags_RF}")
    print(f"LR - Passes: {passes_LR}, Misses: {misses_LR}, False Flags: {falseflags_LR}")
    print(f"XGB - Passes: {passes_XGB}, Misses: {misses_XGB}, False Flags: {falseflags_XGB}")

# Tests evaluation algorithm on the user's requested dataset.
input = input("Which datset would you like to test? Choose '1', '2', or '3'.\n")
if input:
    if input == "1":
        dataset1()
    elif input == "2":
        dataset2()
    elif input == "3":
        dataset3()
else:
    print("Please input a datset number.")