* Before trying out TF.js, I tried using ONNX.js but apparently some opsets were not supported. ONNX.js 
* More info: [Link 1](https://github.com/gnsmrky/pytorch-fast-neural-style-onnxjs/), [Link 2](https://twitter.com/safijari/status/1251650525826740225)
* The error below is encountered:

>A simple benchmark to test the U2 model on ONNX.js.
The error below is encountered, probably due to unsupported opsets.
Uncaught (in promise) TypeError: cannot resolve operator 'MaxPool' with opsets: ai.onnx v11
    at Object.e.resolveOperator (onnx.min.js:1)
    at t.resolve (onnx.min.js:14)
    at e.initializeOps (onnx.min.js:14)
    at onnx.min.js:14
    at t.event (onnx.min.js:1)
    at e.initialize (onnx.min.js:14)
    at e.<anonymous> (onnx.min.js:14)
    at onnx.min.js:14
    at Object.next (onnx.min.js:14)
    at a (onnx.min.js:14)
