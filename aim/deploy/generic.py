

class DeployFromPath:
    def __init__(self, model_path):
        self.model_path = model_path

    def generate_docker(self, container_name):
        return True

# import onnxruntime
# import numpy

# img_bytes = open(
# '/Users/gevorg/repos/sgevorg/mnist-debug/data/train_pngs/testing/7/111.png', 'r')

# sess = onnxruntime.InferenceSession(
#     "/Users/gevorg/repos/sgevorg/aim/.aim/temp-onnx/mnist-test-1.onnx")
# input_name = sess.get_inputs()[0].name
# label_name = sess.get_outputs()[0].name

# print(input_name)
# print(label_name)

# X_input = numpy.random.rand(1, 1, 28, 28)

# pred_onx = sess.run([label_name],
#     {input_name: X_input.astype(numpy.float32)})[0]

# print(pred_onx)
