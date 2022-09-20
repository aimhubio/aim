FROM python:3.9.10-slim

ARG AIM_VERSION
RUN pip install Cython==3.0.0a9
RUN pip install aim==$AIM_VERSION

WORKDIR /opt/aim
RUN aim init
ENTRYPOINT ["aim"]
CMD ["up"]
