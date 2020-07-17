import aim
from aim import Checkpoint

import pandas
from sklearn import model_selection
from sklearn.linear_model import LogisticRegression

url = "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv"
names = ['preg', 'plas', 'pres', 'skin', 'test', 'mass', 'pedi', 'age', 'class']
dataframe = pandas.read_csv(url, names=names)
array = dataframe.values
X = array[:,0:8]
Y = array[:,8]
test_size = 0.33
seed = 7
X_train, X_test, Y_train, Y_test = model_selection.train_test_split(X, Y, test_size=test_size, random_state=seed)

path = '.aim/default/index/objects/models/diabetes.aim'
loaded_model = Checkpoint.load(path)
loaded_model = loaded_model[1]

result = loaded_model.score(X_test, Y_test)
print(result)