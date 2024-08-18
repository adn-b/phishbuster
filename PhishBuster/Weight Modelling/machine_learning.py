from xgboost import XGBClassifier
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression

# Creates dataframe from dataset JSON file.
df = pd.read_json("Weight Modelling/dataset1.json")
# Transposes, or flips the orientation of the dataframe, so the columns, or X axis, are the attributes.
df = df.transpose()
df = df * 1

# print(df.columns)

# Puts the "Phishing" value on the Y axis so that the algorithms can evaluate 
# the other attributes against the phishing value, and find their importances.
X = df.drop("Phishing", axis=1)
y = df["Phishing"]

# Imports random forest, uses seed 35, fits it to the dataframe, and extracts the importances.
rf = RandomForestClassifier(random_state=35)
rf.fit(X, y)
rf_results = rf.feature_importances_
# Returns results as percentages for easy interpretation.
rf_results_sum = np.sum(rf_results)
rf_results_percentage = (rf_results / rf_results_sum) * 100

# Imports logistic regression, uses seed 35, fits it to the dataframe, and extracts the importances.
lr = LogisticRegression(random_state=35, penalty="l1", solver="liblinear")
lr.fit(X, y)
lr_results = lr.coef_[0]
# Returns results as percentages for easy interpretation.
lr_results_sum = np.sum(np.abs(lr_results))
lr_results_percentage = (np.abs(lr_results) / lr_results_sum) * 100

# Imports XGBoost, fits it to the dataframe, and extracts the importances.
xgb = XGBClassifier(use_label_encoder=False, eval_metric="logloss")
xgb.fit(X, y)
xgb_results = xgb.feature_importances_
# Returns results as percentages for easy interpretation.
xgb_results_sum = np.sum(xgb_results)
xgb_results_percentage = (xgb_results / xgb_results_sum) * 100

# Uses pandas "Series" function, which creates an array consisting of the 
# importances and associates them with their respective attribute, to output results
rf_results = pd.Series(rf.feature_importances_, index=X.columns)
lr_results = pd.Series(abs(lr.coef_[0]), index=X.columns)
xgb_results = pd.Series(xgb.feature_importances_, index=X.columns)

# Prints results
print("Random Forest:\n", rf_results,"\n",rf_results_percentage,"\n")
print("Logistic Regression:\n", lr_results,"\n",lr_results_percentage,"\n")
print("XGBoost:\n", xgb_results,"\n",xgb_results_percentage,"\n")