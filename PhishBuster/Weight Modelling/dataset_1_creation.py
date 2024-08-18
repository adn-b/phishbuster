import random
import json

sites = {}

# Generates random value within a set percentage range, as specified by the "percentage" parameter.
def generate_value(percentage):
    return random.random() < (percentage / 100.0)

# Generates entries in dataset using the amount of entries/sites, the percentage for each attribute, and the start index.
def generate_entries(sites_total, percentages, start_index=1):
    # Iterative loop to generate set amount of entries.
    for i in range(start_index, start_index + sites_total):
        # Increments the entry/site id each time.
        site_id = f"Site{i+1}"
        # Generates entry for each attribute at random using the defined percentages.
        attributes = {attr: generate_value(percentage) for attr, percentage in percentages.items()}
        sites[site_id] = attributes
    return sites

# Percentages for each attribute.
phishing_percentages = {'TargetIdentified': 100, 'NoSSL': 65, 'SusiFrames': 9, 'SusForms': 20, 
'TargetInUrl': 60, 'Phishing': 100}

legitimate_percentages = {'TargetIdentified': 0, 'NoSSL': 0, 'SusiFrames': 20, 'SusForms': 80,
'TargetInUrl': 0, 'Phishing': 0}

# Generates phishing and legitimate entries using function above.
sites1 = generate_entries(500, phishing_percentages, 0)
sites2 = generate_entries(500, legitimate_percentages, 500)

# Combines both entry types.
combined_dataset = {**sites1, **sites2}

with open('Weight Modelling/dataset1.json', 'w') as file:
    json.dump(combined_dataset, file, indent=4)
