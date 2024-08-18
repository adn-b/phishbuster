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
phishing_percentages = {'Phishing': 100, 'Blacklisted': 50, 'urlLegitimate': 0, 
'TargetInUrl': 50, 'NoSSL': 55, 'SusiFrames': 15, 'SusForms': 15, 'TargetIdentified': 100}

legitimate_percentages = {'Phishing': 0, 'Blacklisted': 0, 'urlLegitimate': 55,
'TargetInUrl': 0, 'NoSSL': 5, 'SusiFrames': 25, 'SusForms': 75, 'TargetIdentified': 65}

brand_matches_percentages_phishing = {(0, 5): 75, (6, 20): 10,(20, 50): 15}
iframe_total_percentages_phishing = {(0, 0): 80, (1, 5): 20}
form_total_percentages_phishing = {(0, 0): 70, (1, 1): 30,}

brand_matches_percentages_safe = {(0, 0): 60, (1, 6): 40}
iframe_total_percentages_safe = {(0, 0): 75, (1, 2): 25}
form_total_percentages_safe = {(0, 0): 70, (1, 2): 30}

# Generates entries in dataset using the amount of entries/sites, the percentage for each attribute, and the start index.
def generate_dataset_entries_phishing(num_entries, percentages_bool, start_index=0):
    entries = {}
    # Iterative loop to generate set amount of entries.
    for i in range(start_index, start_index + num_entries):
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
def generate_dataset_entries_safe(num_entries, percentages_bool, start_index=0):
    entries = {}
    for i in range(start_index, start_index + num_entries):
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
sites_1 = generate_dataset_entries_phishing(500, phishing_percentages)
sites_2 = generate_dataset_entries_safe(500, legitimate_percentages, 500)

# Combines both entry types.
combined_dataset = {**sites_1, **sites_2}

with open('Weight Modelling/dataset3.json', 'w') as json_file:
    json.dump(combined_dataset, json_file, indent=4)
