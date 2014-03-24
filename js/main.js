navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;


  var video = document.querySelector('video');
  var canvas = document.querySelector('canvas');
  var ctx = canvas.getContext('2d');
  var localMediaStream = null;
  var videoSource = null;
var UPC_SET = {
        "3211": '0',
        "2221": '1',
        "2122": '2',
        "1411": '3',
        "1132": '4',
        "1231": '5',
        "1114": '6',
        "1312": '7',
        "1213": '8',
        "3112": '9'
    };
	
	var i = 0;

video.addEventListener('loadeddata', function() {
    video.currentTime = i;
	setInterval(loopCapture,500);
}, false);

 function loopCapture(){
 snapshot();
 var result = getBarcodeFromImage(document.getElementById('barcode'));
 if(result != false)
	 {
		alert(result);
	 }
 }
	
function gotSources(sourceInfos) {
  alert(sourceInfos.length);
  for (var i = 0; i != sourceInfos.length; ++i) {
    var sourceInfo = sourceInfos[i];
   if (sourceInfo.kind === 'video') {
     alert(sourceInfo.id);
      videoSource = sourceInfo.id;
    } 
  }
}

  function snapshot() {
    if (localMediaStream) {
	var sourceX = 150;
        var sourceY = 0;
        var sourceWidth = 640;
        var sourceHeight = 480;
        var destWidth = 150;
        var destHeight = 300;
        var destX = 0;
        var destY = 0;
		
      ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
      // "image/webp" works in Chrome.
      // Other browsers will fall back to image/png.
      document.querySelector('img').src = canvas.toDataURL('image/webp');
     // alert(getBarcodeFromImage(canvas.toDataURL('image/webp')));
    }
  }

  video.addEventListener('click', snapshot, false);

  //MediaStreamTrack.getSources(gotSources);

  var constraints = {video: {
    mandatory: {
      maxWidth: 320,
      maxHeight: 240
    },
    optional: [{sourceId: videoSource}]
  }};

  // Not showing vendor prefixes or code that works cross-browser.
  navigator.getUserMedia(constraints, function(stream) {
    video.src = window.URL.createObjectURL(stream);
    localMediaStream = stream;
  }, errorCallback);
  

  
//function successCallback(stream) {
//  window.stream = stream; // stream available to console
//  if (window.URL) {
//    video.src = window.URL.createObjectURL(stream);
//  } else {
//    video.src = stream;
//  }
//  video.play();
//}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}


    
    
    function getBarcodeFromImage(imgOrId){
        var doc = document,
            img = "object" == typeof imgOrId ? imgOrId : doc.getElementById(imgOrId),
            canvas = doc.createElement("canvas"),
            width = img.width,
            height = img.height,
            ctx = canvas.getContext("2d"),
            spoints = [1, 9, 2, 8, 3, 7, 4, 6, 5],
            numLines = spoints.length,
            slineStep = height / (numLines + 1),
            round = Math.round;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0);
        while(numLines--){
            console.log(spoints[numLines]);
            var pxLine = ctx.getImageData(0, slineStep * spoints[numLines], width, 2).data,
                sum = [],
                min = 0,
                max = 0;
            for(var row = 0; row < 2; row++){
                for(var col = 0; col < width; col++){
                    var i = ((row * width) + col) * 4,
                        g = ((pxLine[i] * 3) + (pxLine[i + 1] * 4) + (pxLine[i + 2] * 2)) / 9,
                        s = sum[col];
                    pxLine[i] = pxLine[i + 1] = pxLine[i + 2] = g;
                    sum[col] = g + (undefined == s ? 0 : s);
                }
            }
            for(var i = 0; i < width; i++){
                var s = sum[i] = sum[i] / 2;
                if(s < min){ min = s; }
                if(s > max){ max = s; }
            }
            var pivot = min + ((max - min) / 2),
                bmp = [];
            for(var col = 0; col < width; col++){
                var matches = 0;
                for(var row = 0; row < 2; row++){
                    if(pxLine[((row * width) + col) * 4] > pivot){ matches++; }
                }
                bmp.push(matches > 1);
            }
            var curr = bmp[0],
                count = 1,
                lines = [];
            for(var col = 0; col < width; col++){
                if(bmp[col] == curr){ count++; }
                else{
                    lines.push(count);
                    count = 1;
                    curr = bmp[col];
                }
            }
            var code = '',
                bar = ~~((lines[1] + lines[2] + lines[3]) / 3),
                u = UPC_SET;
            for(var i = 1, l = lines.length; i < l; i++){
                if(code.length < 6){ var group = lines.slice(i * 4, (i * 4) + 4); }
                else{ var group = lines.slice((i * 4 ) + 5, (i * 4) + 9); }
                var digits = [
                    round(group[0] / bar),
                    round(group[1] / bar),
                    round(group[2] / bar),
                    round(group[3] / bar)
                ];
                code += u[digits.join('')] || u[digits.reverse().join('')] || 'X';
                if(12 == code.length){ return code; break; }
            }
            if(-1 == code.indexOf('X')){ return code || false; }
        }
        return false;
    }
