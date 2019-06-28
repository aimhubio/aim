from flask import Flask, jsonify, request
from flask_restplus import Api, Resource
from flask_cors import CORS
import json
import onnxruntime
import numpy

application = Flask(__name__)
CORS(application)
api = Api(application,
          version='0.1',
          title='Our sample API',
          description='This is our sample API')


@api.route('/infer', methods=['POST'])
class Infer(Resource):
    def post(self, **kwargs):
        print(request.get_data())
        payload = request.get_json()
        payload_dict = json.loads(payload)
        sess = onnxruntime.InferenceSession('/usr/src/app/model.onnx')
        input_name = sess.get_inputs()[0].name
        label_name = sess.get_outputs()[0].name
        X_input = numpy.array(payload_dict['input'])
        pred_onx = sess.run([label_name],
            {input_name: X_input.astype(numpy.float32)})[0]
        return jsonify({'pred': pred_onx})


if __name__ == '__main__':
    application.run(host='0.0.0.0', debug=True)
