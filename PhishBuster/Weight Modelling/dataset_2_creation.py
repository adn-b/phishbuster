import random
import json

# Generates random value within a set percentage range, as specified by the "percentage" parameter.
def generate_value(percentage):
    return random.random() < (percentage / 100.0)

# Generates random number within a percentage range as defined later.
def generate_number(percentage_ranges):
    # Obtains random value.
    rand_percentage = random.random() * 100
    cumulative_percentage = 0
    # Loops through each percentage range and ensures that the percentage is not higher than the range limit for that attribute.
    for range_limits, percentage in percentage_ranges.items():
        cumulative_percentage += percentage
        if rand_percentage < cumulative_percentage:
            return random.randint(*range_limits)
    return 1

# Percentages for each attribute.
phishing_percentages = {'Phishing': 100, 'Blacklisted': 55, 'urlLegitimate': 0, 
'TargetInUrl': 60, 'NoSSL': 65, 'SusiFrames': 9, 'SusForms': 20, 'TargetIdentified': 100}

legitimate_percentages = {'Phishing': 0, 'Blacklisted': 0, 'urlLegitimate': 50, 
'TargetInUrl': 0, 'NoSSL': 0, 'SusiFrames': 20, 'SusForms': 80, 'TargetIdentified': 70}

brand_matches_percentages_phishing = {(0, 5): 70, (6, 20): 10,(20, 50): 20}
iframe_total_percentages_phishing = {(0, 0): 90, (1, 5): 10}
form_total_percentages_phishing = {(0, 0): 80, (1, 1): 20,}

brand_matches_percentages_safe = {(0, 0): 70, (1, 6): 30}
iframe_total_percentages_safe = {(0, 0): 85, (1, 2): 15}
form_total_percentages_safe = {(0, 0): 80, (1, 2): 20}

# Generates entries in dataset using the amount of entries/sites, the percentage for each attribute, and the start index.
def generate_dataset_entries_phishing(sites_total, percentages_bool, start_index=0):
    entries = {}    
    # Iterative loop to generate set amount of entries.
    for i in range(start_index, start_index + sites_total):
        # Increments the entry/site id each time.
        site_id = f"Site{i+1}"
        # Generates entry for each attribute at random using the defined percentages.
        attributes = {attr: generate_value(percentage) for attr, percentage in percentages_bool.items()}
        attributes['Brand Matches'] = generate_number(brand_matches_percentages_phishing)
        attributes['Suspicious iFrames Found'] = generate_number(iframe_total_percentages_phishing)
        attributes['Suspicious Forms Found'] = generate_number(form_total_percentages_phishing)
        entries[site_id] = attributes
    return entries

# Generates entries in dataset using the amount of entries/sites, the percentage for each attribute, and the start index.
def generate_dataset_entries_safe(sites_total, percentages_bool, start_index=0):
    entries = {}
    for i in range(start_index, start_index + sites_total):
        # Increments the entry/site id each time.
        site_id = f"Site{i+1}"
        # Generates entry for each attribute at random using the defined percentages.
        attributes = {attr: generate_value(percentage) for attr, percentage in percentages_bool.items()}
        attributes['Brand Matches'] = generate_number(brand_matches_percentages_safe)
        attributes['Suspicious iFrames Found'] = generate_number(iframe_total_percentages_safe)
        attributes['Suspicious Forms Found'] = generate_number(form_total_percentages_safe)
        entries[site_id] = attributes
    return entries

# Generates phishing and legitimate entries using function above.
sites1 = generate_dataset_entries_phishing(500, phishing_percentages)
sites2 = generate_dataset_entries_safe(500, legitimate_percentages, 500)

# Combines both entry types.
combined_dataset = {**sites1, **sites2}

with open('Weight Modelling/dataset2.json', 'w') as json_file:
    json.dump(combined_dataset, json_file, indent=4)
