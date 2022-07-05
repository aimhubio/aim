
import random
import plotly.express as px
import aim

runs_count = 5
step_count = 10
seed_count = 3
experiments = ['Fig 1', 'Fig 2']
subsets = ['train', 'val', 'test']

learning_rates = ['0.00001', '0.01', '0.002', '0,3']
batch_sizes = [16, 32, 64, 128]

for seed in range(seed_count):
    for i in range(runs_count):
        batch_size = random.choice(batch_sizes)
        learning_rate = random.choice(learning_rates)
        experiment = random.choice(experiments)

        run = aim.Run(experiment=experiment)

        run['hparams'] = {
            "batch_size": batch_size,
            "learning_rate": learning_rate
        }

        run['seed'] = seed
        for subset in subsets:
            context = {
                subset: subset
            }
            for step in range(step_count):
               # Track plotly figures
                df = px.data.iris()
                fig = px.scatter(df, x="sepal_width", y="sepal_length", color="species",
                             size='petal_length', hover_data=['petal_width'])

                run.track(aim.Figure(fig), name='fig', context=context)


