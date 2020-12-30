# U²Net on Tensorflow.js

- [1. Pytorch to ONNX](#1-pytorch-to-onnx)
- [2. ONNX to Tensorflow's SavedModel](#2-onnx-to-tensorflows-savedmodel)
- [3. Tensorflow's SavedModel to Tensorflow.js](#3-tensorflows-savedmodel-to-tensorflowjs)
- [Results](#results)
- [Testing the webpage locally](#testing-the-webpage-locally)

***

* A simple attempt to run [U²Net](https://github.com/NathanUA/U-2-Net) on the browser with Tensorflow.js
* A demo can be found [here](https://fongyoong.github.io/u2net-tfjs/).

***

## 1. Pytorch to ONNX
* Based on [this](https://pytorch.org/tutorials/advanced/super_resolution_with_onnxruntime.html#codecell3).
* [ONNX](https://github.com/onnx/onnx) must be installed first. Tested with `onnx=1.8.0`
* `export/saved_models/u2netp/u2netp.pth` is a lightweight, pre-trained Pytorch model obtained from [here](https://drive.google.com/file/d/1rbSTGKAE-MTxBYHd-51l2hMOQPT_7EPy/view).
* `export/torch_to_onnx.py` converts the `.pth` file into `.onnx`. It is found that `opset_version=10` is the most suitable. Lower/higher opset versions may result in compatibility issues later on.

***

## 2. ONNX to Tensorflow's SavedModel
* Based on [this](https://github.com/onnx/onnx-tensorflow/blob/master/example/onnx_to_tf.py).
* Tested with `onnx-tf=1.7.0`
* `export/onnx_to_tf.py` converts the `.onnx` file into Tensorflow's SavedModel format. By default, it is a folder named `tfmodel`.

***

## 3. Tensorflow's SavedModel to Tensorflow.js
* Based on [this](https://www.tensorflow.org/js/guide/conversion) and especially [this](https://www.tensorflow.org/js/tutorials/conversion/import_saved_model).
* Tested with `tensorflowjs=2.8.1`
    1. Open a terminal and `cd` into the `export` folder.
    2. Run the line below to obtain the Tensorflow.js model:
`tensorflowjs_converter --input_format=tf_saved_model exported/tfmodel exported/tfjs`
    3. The model's folder name is `tfjs` by default. It can be loaded by TF.js on the browser as described [here](https://www.tensorflow.org/js/guide/save_load).

***

## Results
* So far, the results bear resemblance to the expected output but are not good enough for practical use.

![image](https://i.imgur.com/eQcJwOz.jpg).

***

## Testing the webpage locally
1. Open a terminal and `cd` into the `web` folder.
2. `npm install` to install Express
3. `npm run start` to view the webpage on `localhost:3000`