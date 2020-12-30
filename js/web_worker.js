importScripts("tf.min.js");

let model;
self.addEventListener("message", function(e) {
    // the passed-in data is available via e.data
    if(e.data.type == "load_model"){
        tf.enableProdMode();
        model = tf.loadGraphModel('../tfjs/model.json', {onProgress:function(progress){
            self.postMessage({type:"load_progress", progress: progress * 100});
        }});
        model.then((res)=>{
            model = res;
            const warmupResult = model.predict(tf.zeros([1, 3, 320, 320]));
            warmupResult.forEach((i)=>i.dataSync());
            warmupResult.forEach((i)=>i.dispose());
            self.postMessage({type:"load_model_done", backend:tf.getBackend()});
        });
    }
    else if (e.data.type == "predict"){
        /*
        let originalImageElement = e.data.originalImageElement;
        let resized_canvas = e.data.resized_canvas;
        // Resize image
        console.log("Resize Image");
        const ori_tf = tf.browser.fromPixels(originalImageElement);
        const resizedImage = ori_tf.resizeNearestNeighbor([320, 320]).toFloat().div(tf.scalar(255));
        tf.browser.toPixels(resizedImage, resized_canvas);
        const norm = resizedImage.div(resizedImage.max());
        const adj = norm.sub(tf.scalar(0.485)).div(tf.scalar(0.229));
        const finalInput = adj.transpose([2,0,1]).expandDims(0);
        */
        let finalInput = e.data.finalInput;
        console.log("Predict!");
        finalInput = tf.tensor(finalInput);
        const predictions = model.predict(finalInput);
        console.log("Done!");
        self.postMessage({type:"predict_done", predictions: predictions.arraySync()});
        predictions.forEach(function(p, i){
            if(i != 0){
              p.dispose();
            }
        });
    }
}, false);