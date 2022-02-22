FROM python:3.9.10-slim

ARG AIM_VERSION
RUN pip install aim==$AIM_VERSION

WORKDIR /opt/aim
ENTRYPOINT ["aim"]
CMD ["up"]