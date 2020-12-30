* The `opencv` contains two versions of OpenCV.js. Version 3.3.1 is used because its size is much smaller (~50 % smaller).
* `tf.min.js` contains the minimised version of TF.js 2.0
* The `tfjs` folder contains the TF.js variant of the U²Net model obtained.
* WebGL should be the default backend. For WASM, other supporting .js files must be included.
* `web_worker.js` is not relevant in this release because the inline Web Worker is used instead.
* `main.js` handles the webpage's interactivity.