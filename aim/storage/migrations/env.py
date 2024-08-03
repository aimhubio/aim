import os

from logging.config import fileConfig

from aim.storage.structured.sql_engine.models import Base
from aim.web.configs import AIM_ENV_MODE_KEY
from alembic import context
from alembic.config import Config
from sqlalchemy import create_engine


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

if os.getenv(AIM_ENV_MODE_KEY, 'prod') != 'prod':
    here = os.path.abspath(os.path.dirname(__file__))
    config = Config(os.path.join(here, 'alembic_dev.ini'))

# Interpret the config file for Python logging.
# This line sets up loggers basically.
fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline():
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    sqlalchemy_url = os.environ.get('AIM_RUN_META_DATA_DB_URL')
    context.configure(
        url=sqlalchemy_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    sqlalchemy_url = os.environ.get('AIM_RUN_META_DATA_DB_URL')
    connectable = create_engine(sqlalchemy_url)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
