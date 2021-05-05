import os
from tornado import web, ioloop, autoreload

from aim.web.services.ws.handlers import *


class Application(web.Application):
    def __init__(self):
        handlers = [
            (r'/live/insight', InsightSocketHandler),
        ]
        settings = dict(
            debug=os.environ.get('TORNADO_ENV', 'dev') == 'dev',
        )
        super(Application, self).__init__(handlers, **settings)


def start():
    app = Application()
    app.listen(43802)

    if os.environ.get('TORNADO_ENV', 'dev') == 'dev':
        autoreload.start()

    ioloop.IOLoop.current().start()
