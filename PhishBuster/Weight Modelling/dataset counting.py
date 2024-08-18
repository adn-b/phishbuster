import pandas as pd
from scipy.io import arff

# Loads file
data, meta = arff.loadarff('Weight Modelling/dataset/dataset.arff')
df = pd.DataFrame(data)

# Selects features 8, 23, and 31 from the dataset, as these are the SSL, iFrame, and Blacklist attributes (I did not end up using this iFrame or Blacklist data in my dataset).
# Integer location indexer
ssl = df.iloc[:, 7]
iframe = df.iloc[:, 22]
blacklist = df.iloc[:, 30]

# Counts number of each (-1,0,1) for all 3 attributes, allowing me to create a % for each.
totalSSL = ssl.value_counts().to_dict()
totaliFrame = iframe.value_counts().to_dict()
totalBlacklist = blacklist.value_counts().to_dict()

# Prints count of each
print(f"Total SSL: {totalSSL}")
print(f"Total iFrame: {totaliFrame}")
print(f"Total Blacklist: {totalBlacklist}")
