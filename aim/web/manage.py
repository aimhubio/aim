from flask_script import Manager
from flask_migrate import MigrateCommand

from aim.web.app import App

# Set up the app
app = App()

# Set up manager
manager = Manager(app.api)

# adds the python manage.py db init, db migrate, db upgrade commands
manager.add_command('db', MigrateCommand)


if __name__ == "__main__":
    manager.run()
