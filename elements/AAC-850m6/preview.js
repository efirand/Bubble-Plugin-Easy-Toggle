function(instance, properties) {

    var previewWidth = properties.bubble.width() + 'px'
    var previewHeight = properties.bubble.height() + 'px'
    
    
let divPreivew = `<div style="width: ${previewWidth}; height: ${previewHeight}; background-image: url('https://meta-q.cdn.bubble.io/f1718123024270x928186442858206300/toggle-off-switch-svgrepo-com.svg'); background-size: cover; background-position: center;"></div>`;
    
instance.canvas.append(divPreivew);

}