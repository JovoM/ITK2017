

var overlay = new ol.Overlay(({
  element: document.getElementById('popup'),
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
}));

 
var osm = new ol.layer.Tile({
	source: new ol.source.OSM({
		layer: 'osm',
	visible: true,
	name: 'osm'
	})
});

	
var bing = new ol.layer.Tile({
	source: new ol.source.BingMaps({
		key:'AqbyLoz35jf2t-O8ZHd-NWXjp131X1THM92O8ha6yp2B56GtpI9Xhh6tjPTBgJeh',
		imagerySet: 'Aerialwithlabels'
	}),
	visible: false,
	name: 'bing'
});

download_vector_osgl = function(layer_name){
    var url = "http://osgl.grf.bg.ac.rs/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeName="+
        layer_name+"&outputFormat=shape-zip";
    window.open(url);
}

download_vector_local = function(layer_name){
    var url = "http://localhost:8080/geoserver/wfs?service=wfs&version=2.0.0&request=GetFeature&typeName="+
        layer_name+"&outputFormat=shape-zip";
    window.open(url);
}



download_raster_osgl = function(layer_name, layer){
    var url = "http://osgl.grf.bg.ac.rs/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers="+layer_name+
        "&styles=&srs=EPSG:4326&bbox=-180,-90,180,90&format=image/geotiff"
    window.open(url);
}

var map = new ol.Map({
	layers: [osm,bing],
	overlays: [overlay],
	target: 'map',
	controls: ol.control.defaults().extend([
			new ol.control.ScaleLine(),
			new ol.control.ZoomSlider()
	]),
  view: new ol.View({
    center: [2595665.986509167, 5361249.9352637725],
	zoom: 6,
  })
});

var vms1 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
    url: 'http://osgl.grf.bg.ac.rs/geoserver/osgl_3/wms',
    params: {'LAYERS': 'osgl_3:intenziteta-475-tlo', 'TILED': true,},
    serverType: 'geoserver'
	   })
});
			
var vms2 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
    url: 'http://osgl.grf.bg.ac.rs/geoserver/osgl_3/wms',
    params: {'LAYERS': 'osgl_3:povrsina_lokalnosti_975_region', 'TILED': true,},
    serverType: 'geoserver'			
    })
});


var vms3 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
    url: 'http://osgl.grf.bg.ac.rs/geoserver/wms',
    params: {'LAYERS': 'vojvodina:RGB_tif', 'TILED': true,},
    serverType: 'geoserver'
    })
});

var vms4 = new ol.layer.Tile({
    source: new ol.source.TileWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'cite:Hidro', 'TILED': true,},
    serverType: 'geoserver'
    })
});

var vectorSourceEl = new ol.source.Vector({
  format: new ol.format.GeoJSON(),
  url: function(extent) {
    return 'http://localhost:8080/geoserver/wfs?service=WFS&' +
        'version=1.1.0&request=GetFeature&typename=cite:Hidro&' +
        'outputFormat=application/json&srsname=EPSG:3857&';
  },
  strategy: ol.loadingstrategy.all
});


var vectorEl = new ol.layer.Vector({
  source: vectorSourceEl
});


var merc = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
var utm = "+proj=utm +zone=34 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
var lamb = "+proj=lcc +lat_1=35 +lat_2=65 +lat_0=52 +lon_0=10 +x_0=4000000 +y_0=2800000 +ellps=GRS80 +units=m"
var dkg = "+proj=tmerc +lat_0=0 +lon_0=21 +k=0.9999 +x_0=7500000 +y_0=0 +ellps=bessel +towgs84=577.326,90.129,463.919,5.137,1.474,5.297,2.4232 +units=m +no_defs"


map.on('singleclick', function(evt) {
  var coordinate = evt.coordinate;

  projekcija = $('input[name=projekcija]:checked').val()
  if(projekcija == 'utm'){
    var hdms = proj4(merc, utm, coordinate);
	var LD1 =proj4(merc, "WGS84", coordinate);
	var lon = LD1[0];
	var lat = LD1[1];
	
	var lin_duz = 0.9996;
        var e_l = 0.0818191910428158;
        var sred_m = 21;
        var fi_r = parseInt(lon)*(Math.PI/180);
        var t_l = Math.tan(fi_r);
        var n_l = e_l*Math.cos(fi_r);
        var C1 = (1+Math.pow(n_l, 2))*Math.pow(Math.cos(fi_r),2)/2;
        var C2 = (5-4*Math.pow(t_l, 2))*Math.pow(Math.cos(fi_r),4)/24;
        var l = (parseInt(lat)-sred_m)*(Math.PI/180);
        var c_l = lin_duz*(1+(C1*Math.pow(l,2))+(C2*Math.pow(l,4)));
        var LD = (c_l-1);
		document.getElementById('popup-content').innerHTML = '<p id = "klik" >Pozicija klika:</p><code>' + "Koordinate su: " + hdms + " Linearna deformacija: " + LD +
      '</code>';
  overlay.setPosition(coordinate);
	
		
    }

   else if(projekcija == 'lamb'){
        var hdms = proj4(merc, lamb, coordinate);
		document.getElementById('popup-content').innerHTML = '<p id = "klik" >Pozicija klika:</p><code>' + "Koordinate su: " + hdms + 
      '</code>';
  overlay.setPosition(coordinate);
   }

   else if(projekcija == 'dks'){
    var hdms = proj4(merc, dkg, coordinate);
	var LD1 =proj4(merc, "WGS84", coordinate);
	var lon = LD1[0];
	var lat = LD1[1];
	
	var lin_duz = 0.9999;
        var e_l = 0.0816968312225275;
        var sred_m = 21;
        var fi_r = parseInt(lon)*(Math.PI/180);
        var t_l = Math.tan(fi_r);
        var n_l = e_l*Math.cos(fi_r);
        var C1 = (1+Math.pow(n_l, 2))*Math.pow(Math.cos(fi_r),2)/2;
        var C2 = (5-4*Math.pow(t_l, 2))*Math.pow(Math.cos(fi_r),4)/24;
        var l = (parseInt(lat)-sred_m)*(Math.PI/180);
        var c_l = lin_duz*(1+(C1*Math.pow(l,2))+(C2*Math.pow(l,4)));
        var LD = (c_l-1);
		document.getElementById('popup-content').innerHTML = '<p id = "klik" >Pozicija klika:</p><code>' + "Koordinate su: " + hdms + " Linearna deformacija: " + LD +
      '</code>';
  overlay.setPosition(coordinate);
   }
   else if(projekcija == 'merc'){
    var hdms = coordinate;
		document.getElementById('popup-content').innerHTML = '<p id = "klik" >Pozicija klika:</p><code>' + "Koordinate su: " + hdms + 
      '</code>';
  overlay.setPosition(coordinate);
   }
   

 
});

document.getElementById('popup-closer').onclick = function() {
  overlay.setPosition(undefined);
  document.getElementById('popup-closer').blur();
  return false;
};

$(document).ready(function() {
	
	$('#layers input[type=radio]').change(function() {
		var layer = $(this).val();

		if(layer == "osm"){
			map.getLayers().item(0).setVisible(true);
			map.getLayers().item(1).setVisible(false);
		}else{
			map.getLayers().item(0).setVisible(false);
			map.getLayers().item(1).setVisible(true);	
		}
	});

		  
	$("#l-int").change(function() {
		var ischecked= $(this).is(':checked');
		if(ischecked){
		    map.addLayer(vms1);
		} else{
		    map.removeLayer(vms1);
		};
	});

	$("#l-int-b").on('click', function() {
		download_vector_osgl('osgl_3:intenziteta-475-tlo');
	});

    $("#l-lok").change(function() {
		var ischecked= $(this).is(':checked');
		if(ischecked){
		    map.addLayer(vms2);
		} else{
		    map.removeLayer(vms2);
		};
	});
	$("#l-lok-b").on('click', function() {
		download_vector_osgl('osgl_3:povrsina_lokalnosti_975_region');
	});

	$("#l-rgbv").change(function() {
		var ischecked= $(this).is(':checked');
		if(ischecked){
		    map.addLayer(vms3);
		} else{
		    map.removeLayer(vms3);
		};
	});
	$("#l-rgbv-b").on('click', function() {
		download_raster_osgl('vojvodina:RGB_tif', vms3);
	});

	$("#l-elk").change(function() {
		var ischecked= $(this).is(':checked');
		if(ischecked){
		    map.addLayer(vms4);
		} else{
		    map.removeLayer(vms4);
		}
	});

	$("#l-elk-wfs").change(function() {
		var ischecked= $(this).is(':checked');
		if(ischecked){
		    map.addLayer(vectorEl);
		} else{
		    map.removeLayer(vectorEl);
		};
	});
	$("#l-elk-wfs-b").on('click', function() {
		download_vector_local('cite:Hidro', vms4);
	});
	
	var raster = new ol.layer.Tile({
        source: new ol.source.OSM()
      });

      var source = new ol.source.Vector({wrapX: false});

      var vector = new ol.layer.Vector({
        source: source
      });

    

      var typeSelect = document.getElementById('type');

      var draw; // global so we can remove it later
      function addInteraction() {
        var value = typeSelect.value;
        if (value !== 'None') {
          draw = new ol.interaction.Draw({
            source: source,
            type: typeSelect.value
          });
          map.addInteraction(draw);
        }
      }


      /**
       * Handle change event.
       */
      typeSelect.onchange = function() {
        map.removeInteraction(draw);
        addInteraction();
      };

      addInteraction();
	  

    


});
