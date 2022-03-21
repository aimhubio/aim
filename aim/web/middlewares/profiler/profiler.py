"""
This code is taken from https://github.com/sunhailin-Leo/fastapi_profiler
Credits to the author of the repo.
"""

import json
import os.path
import time
from typing import Optional
from logging import getLogger

from starlette.routing import Router
from starlette.requests import Request
from starlette.types import ASGIApp, Message, Receive, Scope, Send

logger = getLogger("profiler")


class PyInstrumentProfilerMiddleware:

    def __init__(
            self, app: ASGIApp,
            *,
            server_app: Optional[Router] = None,
            profiler_interval: float = 0.0001,
            repo_path=None,
            **profiler_kwargs
    ):
        try:
            from pyinstrument import Profiler
        except ImportError:
            raise RuntimeError('Please install "pyinstrument" module to use enable api profiler.')

        self.app = app
        self._profiler = Profiler(interval=profiler_interval)

        self._server_app = server_app
        self._profiler_kwargs: dict = profiler_kwargs

        self._profiler_timestamp = str(time.time())
        self._profiler_log_path = os.path.join(repo_path, "profiler", self._profiler_timestamp)
        os.makedirs(self._profiler_log_path, exist_ok=True)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        if self._profiler.is_running:
            should_stop = False
        else:
            should_stop = True
            self._profiler.start()

        request = Request(scope, receive=receive)
        method = request.method
        path = request.url.path
        params = dict(request.query_params)

        try:
            body = await request.json()
        except json.decoder.JSONDecodeError:
            body = None

        file_name = (
            '{timestamp}_{method}_{path}'.format(
                timestamp=time.time(),
                method=method.lower(),
                path='_'.join(path.strip('/').split('/')).lower()
            )
        )

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
            if scope["type"] == "http" and should_stop:
                self._profiler.stop()

                request_data = json.dumps({
                    "path": path,
                    "body": body,
                    "method": method,
                    "params": params
                }, separators=(',', ':'))

                html_output = self._profiler.output_html(**self._profiler_kwargs)

                # inject request data
                body_tag_idx_end = html_output.find('<body>') + 6
                html_output = (
                    f'{html_output[:body_tag_idx_end]}'
                    f'<pre><code>{request_data}</code></pre>'
                    f'{html_output[body_tag_idx_end:]}'
                )

                with open(os.path.join(self._profiler_log_path, f'{file_name}.html'), 'w') as fp:
                    fp.write(html_output)
