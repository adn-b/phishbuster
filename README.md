Note: This project is a browser extension, and is optimized for Google Chrome (as outlined in report), so when loading and testing, please use the most updated version of Google Chrome, which can be found here: https://www.google.com/intl/en_uk/chrome/

These instructions are written for Windows 10/11.

Instructions to install/load extension:
1. Load newest version of Google Chrome
2. Navigate to the "Extensions" icon at the top right of the screen, which looks like a puzzle piece.
3. Click "Manage Extensions".
4. Click and enable the "Developer mode" button at the top right of the extensions page.
5. A button labelled "Load unpacked" will appear at the top left of the page. Click this button, and a file browser will appear.
6. Navigate to the "PhishBuster" folder, which contains the "manifest.json" file. You must select this folder, no level higher. Select it and click "Select Folder".
7. The extension will be loaded and added to your browser. If it is not automatically enabled, please enable it on the extensions page. While enabled, it will run detection algorithms whenever a page is loaded, and alert you if it flags a page as suspicious. 
8. To access the pop-up GUI, click the puzzle piece icon at the top right and click on the PhishBuster extension.


Instructions to test datasets:
1. Run "evaluation.py"
2. A CLI window will open, asking you to choose a dataset to test. Type either "1", "2", or "3", and the results will be printed.
3. You should run the file from an existing CLI window rather than double clicking the evaluation.py file, as the window will close after the results are printed.

Library/resource requirements to fully run and test code:
- Working internet connection.
- Windows 10/11.

- Javascript - https://learn.microsoft.com/en-us/windows/dev-environment/javascript/
- Python - https://www.python.org/downloads/
- JSON (Python Library - comes installed with Python)
- Pandas - https://pandas.pydata.org/docs/getting_started/install.html
- Numpy - https://numpy.org/
- Scipy.io (arff) https://pypi.org/project/scipy/
- Scikit Random Forest Classifier - https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html
- Scikit Logistic Regression Classifier - https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html
- XGBoost - https://xgboost.readthedocs.io/en/stable/python/


Websites I surveyed data from for dataset generation:
- Note that most are now offline due to website admins taking them down, however the domains can be found on PhishTank.com.
- https://jfn.pages.dev/
- http://delightfulflavours.com/
- https://ev.lo-app.com.au/options/account/signin/?applieIdKey?=U2FsdGVkX19tj25sRZYCmdiy8tfynO+fJOqf1E63GJw=
- https://uspsn.top/
- https://onedriveoo.pages.dev/
- https://vds50.pages.dev/
- https://tools.usps-trackxmqiiws.top/
- https://cloudflare-ipfs.com/ipfs/bafybeibgr6jwv2vtekh5dd33c3k3zezc2vg7e3wfcdjoxuj2f5z23obsra/ewqa/login.htm
- https://cloudflare-ipfs.com/ipfs/bafkreihnrjdcl5zkic5dek7notbdhncrgxpaliqwdeow5b5d57bofvgwiq
- https://onedrive-lsuhvhx6.pages.dev/
- https://www.att.com/
- https://www.amazon.com/
- https://www.paypal.com/
- https://www.apple.com/
- https://www.microsoft.com/en-gb/
- https://csgoempire.com/
- https://hellcase.com/en
- https://fullypaidldn.com/
- https://hoodrichuk.com/
- https://tempure.co/