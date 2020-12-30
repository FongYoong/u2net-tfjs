////////////////////////////////////
// Obtain scripts and show progress
//
const upload_container = document.getElementById('upload-container');
upload_container.style.display = "none";
const main_container = document.getElementById('main-container');
main_container.style.display = "none";
const start_container = document.getElementById('start-container');
const script_name = document.getElementById('script-name');
const start_progress = document.getElementById('start-progress');

// Terminate if WebGL texture size too small, common among mobile devices.
let blank_canvas = document.getElementById('blank_canvas');
let gl = blank_canvas.getContext('webgl');
let max_tex_size = gl.getParameter(gl.MAX_TEXTURE_SIZE);
let min_tex_size = 5431;
console.log("MAX_TEXTURE_SIZE:", max_tex_size);

if (max_tex_size < min_tex_size){
    script_name.innerHTML = "GPU unsupported ☹: WebGL max texture size is " + max_tex_size + " < " + min_tex_size;
    start_progress.value = 0;
    throw Error("GPU unsupported!");
}

function load_script(url){
    let req = new XMLHttpRequest();
    script_name.innerHTML = "Loading " + url;
    // report progress events
    req.addEventListener("progress", function(event) {
        if (event.lengthComputable) {
            let percentComplete = event.loaded / event.total * 100;
            start_progress.value = percentComplete;
        } else {
            // Unable to compute progress information since the total size is unknown
            console.log("Error loading:", url);
        }
    }, false);

    // load responseText into a new script element
    req.addEventListener("load", function(event) {
        let e = event.target;
        let s = document.createElement("script");
        s.innerHTML = e.responseText;
        document.body.appendChild(s);
        console.log("Downloaded " + url);
        if (url == script_urls[script_urls.length - 1]){
            load_model();
        }
    }, false);

    req.open("GET", url);
    req.send();
}
//"https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js"
//"https://docs.opencv.org/3.4.0/opencv.js"
//const script_urls = ["https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@2.0.0/dist/tf.min.js", "https://docs.opencv.org/3.4.0/opencv.js"];
const script_urls = ["js/tf.min.js", "js/opencv/3.3.1/opencv.js"];
script_urls.forEach(load_script);

////////////////////////////////////////
//Load and run the U2Net model on TF.js
//
const upload_button_label = document.getElementById('upload_button_label');
const upload_button = document.getElementById('upload_button');
upload_button.onchange = e => { 
    let file = e.target.files[0];
    if(file.type.includes('image')){
        var fr = new FileReader();
        fr.onload = function(){
            originalImageElement.src = fr.result;
            originalImageElement.style.display = "initial";
            predict_button.style.display = "initial";
            main_container.style.display = "none";
        };
        fr.readAsDataURL(file);
    }
    else{
        window.alert("Please choose a valid image file.");
        upload_button.value = null;
    }
}
const predict_button = document.getElementById('predict_button');
predict_button.style.display = "none";
const predict_progress = document.getElementById('predict_progress');
predict_progress.style.display = "none";
const originalImageElement = document.getElementById('original_canvas');
originalImageElement.style.display = "none";
const resized_canvas = document.getElementById('resized_canvas');
const mask_canvas = document.getElementById('mask_canvas');
const mask2_canvas = document.getElementById('mask2_canvas');
const output_canvas = document.getElementById('output_canvas');

// Create Web Worker
const blob = new Blob([document.getElementById('worker1').innerHTML]);
//const worker = new Worker('js/web_worker.js');
const worker = new Worker(window.URL.createObjectURL(blob));
worker.postMessage({type:"load_scripts", url: JSON.parse(JSON.stringify(document.location))});

// Listen to worker if any message is there
worker.addEventListener("message", (event) => {
    if(event.data.type == "load_model_done"){
        start_progress.value = 100;
        document.getElementById('tf_backend').innerHTML = "U²Net model on TF.js using " + event.data.backend;
        upload_container.style.display = "initial";
        start_container.style.display = "none";
        predict_button.onclick = () => {
            predict_model();
        }
    }
    else if(event.data.type == "load_progress"){
        start_progress.value = event.data.progress * 3 / 4;
    }
    else if(event.data.type == "predict_done"){
        predict_progress.style.display = "none";
        let pred = event.data.prediction;
        pred = tf.tensor(pred);
        const pred_max = pred.max();
        const pred_min = pred.min();
        pred = pred.sub(pred_min).div(pred_max.sub(pred_min));
        pred = pred.squeeze();
        tf.browser.toPixels(pred, mask_canvas).then(()=>{
            pred.dispose();
            // Create mask
            const ori_cv = cv.imread(originalImageElement);
            let mask = cv.imread(mask_canvas);

            // Apply threshold
            cv.threshold(mask, mask, 80, 255, cv.THRESH_BINARY);
            cv.imshow(mask2_canvas, mask);

            // Upscale mask
            let upscaled_mask = new cv.Mat();
            const ori_tf = tf.browser.fromPixels(originalImageElement);
            cv.resize(mask, upscaled_mask, {height : ori_tf.shape[0], width : ori_tf.shape[1]}, interpolation = cv.INTER_AREA);

            // Apply mask
            let masked = new cv.Mat();
            cv.bitwise_and(upscaled_mask, ori_cv, masked);
            
            output_canvas.width = masked.size().width;
            output_canvas.height = masked.size().height;
            cv.imshow(output_canvas, masked);
            ori_cv.delete();
            mask.delete();
            upscaled_mask.delete();
            masked.delete();

            upload_button_label.style.display = "initial";
            predict_button.style.display = "initial";
            main_container.style.display = "initial";
            output_canvas.scrollIntoView({behavior: 'smooth'});
        });
    }
    
});

function load_model(){
    // Initialize the tf.model
    script_name.innerHTML = "Warming up the U²Net model";
    worker.postMessage({type:"load_model"});

}
function predict_model(){
    upload_button_label.style.display = "none";
    predict_button.style.display = "none";
    predict_progress.style.display = "initial";
    main_container.style.display = "none";

    // Resize image
    console.log("Resize Image");
    const ori_tf = tf.browser.fromPixels(originalImageElement);
    const resizedImage = ori_tf.resizeNearestNeighbor([320, 320]).toFloat().div(tf.scalar(255));

    tf.browser.toPixels(resizedImage, resized_canvas);
    const norm = resizedImage.div(resizedImage.max());
    const adj = norm.sub(tf.scalar(0.485)).div(tf.scalar(0.229));
    const finalInput = adj.transpose([2,0,1]).expandDims(0);
    //worker.postMessage({type:"predict", originalImageElement:originalImageElement, resized_canvas:resized_canvas});
    worker.postMessage({type:"predict", finalInput:finalInput.arraySync()});
}