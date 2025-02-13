"""
This code is taken from https://github.com/sunhailin-Leo/fastapi_profiler
Credits to the author of the repo.
"""

import json
import os.path
import time

from logging import getLogger
from typing import Optional

from starlette.requests import Request
from starlette.routing import Router
from starlette.types import ASGIApp, Message, Receive, Scope, Send


logger = getLogger('profiler')


class PyInstrumentProfilerMiddleware:
    def __init__(
        self,
        app: ASGIApp,
        *,
        server_app: Optional[Router] = None,
        profiler_interval: float = 0.0001,
        repo_path=None,
        **profiler_kwargs,
    ):
        try:
            from pyinstrument import Profiler, __version__

            if tuple(map(int, __version__.split('.'))) < (3,):
                raise ImportError
        except ImportError:
            raise RuntimeError(
                "This contrib module requires 'pyinstrument' to be installed. "
                "Please install it with command: \n pip install 'pyinstrument>=3.0.0'"
            )

        self.profiler = Profiler
        self.app = app

        self._server_app = server_app
        self._profiler_kwargs: dict = profiler_kwargs

        self._profiler_interval = profiler_interval
        self._profiler_timestamp = str(time.time())
        self._profiler_log_path = os.path.join(repo_path, 'profiler', self._profiler_timestamp)
        os.makedirs(self._profiler_log_path, exist_ok=True)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope['type'] != 'http':
            await self.app(scope, receive, send)
            return

        request = Request(scope, receive=receive)

        request_time = time.time()
        profiler = self.profiler(interval=self._profiler_interval)
        try:
            profiler.start()
        except:  # noqa: E722
            skip_profiling = True
        else:
            skip_profiling = False

        # Default status code used when the application does not return a valid response
        # or an unhandled exception occurs.
        status_code = 500

        async def wrapped_send(message: Message) -> None:
            if message['type'] == 'http.response.start':
                nonlocal status_code
                status_code = message['status']
            await send(message)

        try:
            await self.app(scope, receive, wrapped_send)
        finally:
            if skip_profiling:
                return

            profiler.stop()

            method = request.method
            path = request.url.path
            params = dict(request.query_params)

            file_name = '{timestamp}_{method}_{path}'.format(
                timestamp=request_time, method=method.lower(), path='_'.join(path.strip('/').split('/')).lower()
            )
            request_data = json.dumps({'path': path, 'method': method, 'params': params}, separators=(',', ':'))

            # inject request data
            html_output = profiler.output_html(**self._profiler_kwargs)
            body_tag = '<body>'
            body_tag_idx_end = html_output.find(body_tag) + len(body_tag)
            html_output = (
                f'{html_output[:body_tag_idx_end]}'
                f'<pre><code>{request_data}</code></pre>'
                f'{html_output[body_tag_idx_end:]}'
            )

            with open(os.path.join(self._profiler_log_path, f'{file_name}.html'), 'w') as fp:
                fp.write(html_output)
