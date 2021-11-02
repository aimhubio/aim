from aim.web.api import create_app

app = create_app()


if __name__ == '__main__':
    import uvicorn
    import os
    from aim.web.configs import AIM_ENV_MODE_KEY, AIM_UI_MOUNTED_REPO_PATH

    os.environ[AIM_ENV_MODE_KEY] = 'dev'
    os.environ[AIM_UI_MOUNTED_REPO_PATH] = '/Users/alberttorosyan/aimhub/logs/ru_en/.aim'
    uvicorn.run('aim.web.run:app', port=33800, reload=True,
                reload_dirs='/Users/alberttorosyan/aimhub/src/aim/aim', log_level='debug')
