from aim.web.utils import get_root_path


class Config:
    """
    Base Configuration
    """
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    """
    Development Configuration - default config
    """
    SQLALCHEMY_ECHO = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///{}/.aim/aim_db'.format(get_root_path())
    DEBUG = True


class ProductionConfig(Config):
    """
    Production Configuration
    """
    SQLALCHEMY_ECHO = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///{}/.aim/aim_db'.format(get_root_path())
    DEBUG = False


config = {
    'dev': DevelopmentConfig,
    'prod': ProductionConfig,
}
