## Export Workflow
* Make sure the prerequisites are installed in an appropriate Python environment (Conda, virutalenv etc). There should be at least:
    - `torch`
    - `onnx`
    - `onnx-tf`
    - `tensorflowjs`
* Open a terminal and run the commands below:
    1. `python torch_to_onnx.py`
    3. `python onnx_to_tf.py`
    4. `tensorflowjs_converter --input_format=tf_saved_model exported/tfmodel exported/tfjs`