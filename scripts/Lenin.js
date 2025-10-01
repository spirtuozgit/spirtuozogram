(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [
		{name:"Lenin_atlas_1", frames: [[0,1018,1000,1000],[1002,1018,1000,1000],[0,0,1280,1016]]},
		{name:"Lenin_atlas_2", frames: [[0,1002,1302,588],[1304,1002,715,1000],[0,0,1000,1000],[1002,0,1000,1000]]},
		{name:"Lenin_atlas_3", frames: [[752,637,776,528],[752,0,950,635],[0,0,750,950],[0,952,680,680],[682,1167,510,603]]}
];

// --- весь твой длинный код из Lenin.js остаётся без изменений ---
// (символы, классы, stage, bootstrap и т.п.)

// В самом конце, где lib.properties:
lib.properties = {
	id: 'A784D75E6B926949A3FEEC66EBE942D3',
	width: 1024,
	height: 768,
	fps: 24,
	color: "#FBEBCD",
	opacity: 1.00,
	manifest: [
		{src:"/lenin/Lenin_atlas_1.png", id:"Lenin_atlas_1"},
		{src:"/lenin/Lenin_atlas_2.png", id:"Lenin_atlas_2"},
		{src:"/lenin/Lenin_atlas_3.png", id:"Lenin_atlas_3"}
	],
	preloads: []
};

// --- конец твоего кода ---

})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;

// 🟢 init вынесено в window, чтобы Next.js мог вызвать
window.init = function() {
  var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;

  canvas = document.getElementById("canvas");
  anim_container = document.getElementById("animation_container");
  dom_overlay_container = document.getElementById("dom_overlay_container");

  var comp=AdobeAn.getComposition("A784D75E6B926949A3FEEC66EBE942D3");
  var lib=comp.getLibrary();
  var loader = new createjs.LoadQueue(false);

  loader.addEventListener("fileload", function(evt){handleFileLoad(evt,comp)});
  loader.addEventListener("complete", function(evt){handleComplete(evt,comp)});
  loader.loadManifest(lib.properties.manifest);

  function handleFileLoad(evt, comp) {
    var images=comp.getImages();	
    if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }	
  }

  function handleComplete(evt,comp) {
    var lib=comp.getLibrary();
    var ss=comp.getSpriteSheet();
    var queue = evt.target;
    var ssMetadata = lib.ssMetadata;
    for(var i=0; i<ssMetadata.length; i++) {
      ss[ssMetadata[i].name] = new createjs.SpriteSheet( {
        "images": [queue.getResult(ssMetadata[i].name)],
        "frames": ssMetadata[i].frames
      });
    }
    exportRoot = new lib.Lenin();
    stage = new lib.Stage(canvas);
    fnStartAnimation = function() {
      stage.addChild(exportRoot);
      createjs.Ticker.framerate = lib.properties.fps;
      createjs.Ticker.addEventListener("tick", stage);
    }
    AdobeAn.makeResponsive(false,'both',false,1,[canvas,anim_container,dom_overlay_container]);	
    AdobeAn.compositionLoaded(lib.properties.id);
    fnStartAnimation();
  }
}
