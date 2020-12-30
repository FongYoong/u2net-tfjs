import onnx
from onnx_tf.backend import prepare

model_name='u2netp'
# Load the ONNX file
model = onnx.load("exported/onnx/{}.onnx".format(model_name))

# Import the ONNX model to Tensorflow
tf_rep = prepare(model)
tf_rep.export_graph("exported/tfmodel")  # export the model