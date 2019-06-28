FROM python:3.7

WORKDIR /usr/src/app

COPY requirements.txt ./
COPY {{onnx_model}} ./model.onnx
COPY app.py ./

RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# TODO: consider potentially running some kind of CMAKE+Build here

CMD ["python", "app.py"]
