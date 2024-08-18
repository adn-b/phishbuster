import json

def urls_to_json_individual(file_path):
    try:
        # Open the text file containing the URLs
        with open(file_path, 'r') as file:
            # Read URLs into a list, stripping newline characters
            urls = [line.strip() for line in file.readlines()]
        
        # Convert the list of URLs into a JSON format, with each URL as an individual item
        urls_json = json.dumps({"url": urls}, indent=4)
        
        # Optionally, output the JSON to a file
        with open('urls_individual.json', 'w') as json_file:
            json_file.write(urls_json)
        
        return urls_json
    except Exception as e:
        return str(e)

file_path = 'PhishBuster (Manifest V3)/urls.txt'
urls_json = urls_to_json_individual(file_path)
print(urls_json)