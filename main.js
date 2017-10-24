var cartolayer, sltfeature, drawnItems, lyrs, mkrInicial, lyrRadio, maps, objlayerBase, highlight, dehighlight, select, layerbase, paramlayerbase, parammapbase, viz, vizparam, el, layers, user, api_key, clickCircle5, clickCircle8;
var geomTools;
var drawControl;
var layerbase = 'https://{s}.base.maps.api.here.com/maptile/2.1/maptile/newest/normal.day.grey/{z}/{x}/{y}/256/png8?lg=eng&token=A7tBPacePg9Mj_zghvKt9Q&app_id=KuYppsdXZznpffJsKT24';
var paramlayerbase = {
    minZoom: 0,
    maxZoom: 20,
    subdomains:"1234",
    attribution: "&copy;2017 HERE <a href='http://here.net/services/terms' target='_blank'>Terms of use</a>"
};
 
var parammapbase = {
    center: new L.LatLng(19.33123050921937,-99.09942626953125),
    zoom : 10,
    minZoom: 0,
    maxZoom: 20,
    attribution: "CARTO",
}

var mapdiv =  'map';

var param = {user : 'finanzasdf-admin',};

var viz = "https://finanzasdf.carto.com/u/finanzasdf-admin/api/v2/viz/57d594e1-98b7-4db3-9bc7-426e584834d2/viz.json";

$(function(){

    objlayerBase = L.tileLayer(layerbase,paramlayerbase);
    map = new L.Map(mapdiv, parammapbase), map.addLayer(objlayerBase);
    cartodb.createLayer(map,viz)
        .addTo(map)
        .on('done', function(layer){

            lyrs = layer;

        }).error(function (err) {
            
            console.log(err);
        });

            drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            var objsql = new cartodb.SQL({ user : 'finanzasdf-admin' });
                //Empieza LAS DELEGACIIONES
                objsql.execute("SELECT * FROM delegaciones_df ORDER BY nombre ASC")
                .on("done",function(data){
                    $("<option />",{"value":"*","text":'Selecciona una delegacion...'}).appendTo("#selectDel");
                        for(idx in data.rows){
                            $("<option />",{"value":data.rows[idx].cartodb_id,"text":data.rows[idx].nombre}).appendTo("#selectDel");
                        }//Fin for(idx in data.rows){

                });//Fin .on("done",function(data){

                $('#selectDel').on("change",function(e){//cambio de opcion select
                    var optiondelegacion = $("#selectDel").val();

                    var optioncolonia = $("#selectCol").empty();

                    var optioncalle = $("#selectCal").empty();

                            var objsql = new cartodb.SQL({ user : 'finanzasdf-admin' });
                            
                            objsql.execute("SELECT colonias_ok.the_geom,colonias_ok.the_geom_webmercator,colonias_ok.nombre,colonias_ok.cartodb_id,colonias_ok.created_at,colonias_ok.updated_at,colonias_ok.nombre_id,colonias_ok.data_observatory,colonias_ok.nombre_cap FROM colonias_ok INNER JOIN delegaciones_df ON ST_Contains(delegaciones_df.the_geom,colonias_ok.the_geom) WHERE delegaciones_df.cartodb_id = "+optiondelegacion+" ORDER BY colonias_ok.nombre ASC")
                            .on("done",function(data){

                                if (Object.keys(data.rows).length <= 0) {
                                    $("<option />",{"value":"*","text":'Sin colonias...'}).appendTo("#selectCol");
                                } else {
                                    $("<option />",{"value":"*","text":'Selecciona un colina...'}).appendTo("#selectCol");

                                }//Fin else

                                for(idx in data.rows){
                                    $("<option />",{"value":data.rows[idx].cartodb_id,"text":data.rows[idx].nombre}).appendTo("#selectCol");
                                }//Fin for(idx in data.rows){
                            });//fin on "done"
                    // layerleatflets();

                });//onchage delegacion

                $('#selectCol').on("change",function(e){
                    optioncolonia = $("#selectCol").val();
                    optiondelegacion = $("#selectDel").val();
                    optioncalle = $("#selectCal").empty();

                    var objsql = new cartodb.SQL({ user : 'finanzasdf-admin' });

                    objsql.execute('SELECT  DISTINCT("finanzasdf-admin".basecalle_copy.nombrecalle) FROM "finanzasdf-admin".basecalle_copy INNER JOIN colonias_ok ON ST_Contains(colonias_ok.the_geom,"finanzasdf-admin".basecalle_copy.the_geom) WHERE colonias_ok.cartodb_id = '+optioncolonia+' ORDER BY "finanzasdf-admin".basecalle_copy.nombrecalle ASC')
                    .on("done",function(data){
                        // console.log(data);
                            if (Object.keys(data.rows).length <= 0) {
                                $("<option />",{"value":"*","text":'Sin calles...'}).appendTo("#selectCal");
                            } else {
                                $("<option />",{"value":"*","text":'Selecciona un calle...'}).appendTo("#selectCal");
                            }//Fin else

                            for(idx in data.rows){
                                $("<option />",{"value":data.rows[idx].nombrecalle,"text":data.rows[idx].nombrecalle}).appendTo("#selectCal");
                            }
                    });//fin on "done"

                });//fin colonia

            var drawControl = new L.Control.Draw({
                position: 'topleft',
                draw: {
                    polyline: false,
                    polygon: false,
                    circle: false,
                    marker: false,
                    circlemarker: false,
                    rectangle: false
                },
                edit: {
                    featureGroup: drawnItems,
                    remove: false
                }
            });
            map.addControl(drawControl);

            map.on('draw:edited', function (e) {
                var layers = e.layers;
                // console.log(layers);
                layers.eachLayer(function (layer) {
                    if (layer instanceof L.Marker){
                                                
                        var sql = new cartodb.SQL({ user : 'finanzasdf-admin' });

                        var strsql ="UPDATE "+'"finanzasdf-admin"'+".sismo_capas_edit_seduvi SET the_geom = ST_SetSRID(st_makepoint("+layer._latlng.lng+", "+layer._latlng.lat+"),4326) WHERE cartodb_id = "+layer.cartodb_id;
                        // console.log(strsql);
                        $.getJSON("https://finanzasdf-admin.carto.com/api/v2/sql?q="+strsql+"&api_key=9636b95f3e6c01a780c65a869e491303ed330f9c", function(data){
                        // $.getJSON("https://finanzasdf-admin.carto.com/api/v2/sql?q="+strsql, function(data){
                             $.each(data.rows, function(key, val) {
                                 alert("llave "+key+" "+val);
                             });
                        });

                        console.log(strsql);

                    }
                });
            });

        //Zoom in the map 
        function bounry(user,table,sqlfilter,layer,map) {
            var sqlExtent = new cartodb.SQL(user);
            //regresa la coordenada maxima de mi extend de la geometria
            var sql = "select max(xmax) as xmax,min(xmin) as xmin,max(ymax) as ymax,min(ymin) as ymin from (select ST_Xmax(ST_Extent(the_geom)) as xmax,ST_Xmin(ST_Extent(the_geom)) as xmin,ST_Ymax(ST_Extent(the_geom)) as ymax,ST_Ymin(ST_Extent(the_geom)) as ymin from " + table + " where " + sqlfilter + ") as ext"
            // console.log(sql);
            sqlExtent.execute(sql).done(function(data) {
                if (data.rows[0].ymax != '' && data.rows[0].ymin != '' && data.rows[0].xmax && data.rows[0].xmin != '') {
                    var southWest = L.latLng(data.rows[0].ymax, data.rows[0].xmin),
                    northEast = L.latLng(data.rows[0].ymin, data.rows[0].xmax),
                    bounds = L.latLngBounds(southWest, northEast);
                    map.fitBounds(bounds);
                    selectFeature(table,sqlfilter,layer);
                    // geojsondownload(table,sqlfilter,layer);
                } else {
                    console.log("errors: en la ejecucion del sql en cartodb");
                }
            }).error(function(errors) {
                console.log("errors:" + errors);
            });
        }

        //Select the poligon
        function selectFeature(table,sqlfilter,layer){

            if(map.hasLayer(sltfeature)){
                map.removeLayer(sltfeature);
            };
            // Get CartoDB selection as GeoJSON and Add to Map
            $.getJSON("https://develop.carto.com/api/v2/sql?format=GeoJSON&q=select * from " + table + " where " + sqlfilter, function(data){
            
                sltfeature = L.geoJson(data,{
                    style: function (feature) {
	                    return {color:'#03f',
	                        weight: 5,
	                        opacity:0.5,
	                        fillColor:'#C4C5C6',
	                        fillOpacity:0.2
	                    }
                    },
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            click: function select(e) {
                                select(e.target);
                           }
                        });
                    }
                }).addTo(map);
                sltfeature.bringToBack();
            });
        }
        
        function getSearch(){
            var optiondelegacion = $("#selectDel").val();
            var optioncolonia = $("#selectCol").val();
            var optioncalle = $("#selectCal").val();

            if (optioncalle != "*" && optioncalle != null ){

                    bounry({user: "finanzasdf-admin"}, "basecalle_copy"," delegacionesid="+optiondelegacion+" AND coloniaid="+optioncolonia+" AND  nombrecalle = '"+optioncalle+"'", "", map)

            } else if (optioncolonia != "*") {

                     bounry({user: "finanzasdf-admin"}, "colonias_ok", "cartodb_id = "+optioncolonia, "", map)

            } else if (optiondelegacion != "*" ) {

                    bounry({user: "finanzasdf-admin"}, "delegaciones_df", "cartodb_id = "+optiondelegacion, "", map)
            }
        }


        $("#dgiFilterSearch").on("click",function(evt){
            getSearch();
                // console.log('Click fired!'); // Seeing this in your console, event works
                // console.log(drawnItems); // Should return featureGroup instance, scope ok
                // console.log(lyrs); // Should return polygon instance, scope ok
                // // If all of the above works, this should too
                // drawnItems.removeLayer(lyrs);
                // drawnItems.removeLayer(drawnItems) 
                // drawControlEditOnly.removeFrom(map)
                // map.removeControl(drawControl);

                // drawnItems.removeLayer()
                // console.log(drawnItems._layers);
                map.removeLayer(drawnItems);
                // map.hasLayer(drawnItems);
                // console.log(map.hasLayer(drawnItems));
                // if (map.hasLayer(drawnItems)) {
                //     map.removeLayer(drawnItems);
                // }
                layerleatflets();
                
        });//fin  on click


        function layerleatflets(){

            var optiondelegacion = $("#selectDel").val();
            var optioncolonia = $("#selectCol").val();
            var optioncalle = $("#selectCal").val();
            var intersql = "";

            	if (optioncalle != "*" && optioncalle != null ){
                    intersql = 'SELECT sismo_capas_edit_seduvi.the_geom_webmercator, sismo_capas_edit_seduvi.cartodb_id, sismo_capas_edit_seduvi.the_geom, sismo_capas_edit_seduvi.lat, sismo_capas_edit_seduvi.idregistro, sismo_capas_edit_seduvi.lng, sismo_capas_edit_seduvi.dependencia, sismo_capas_edit_seduvi.capa, sismo_capas_edit_seduvi.clas_global, sismo_capas_edit_seduvi.deleg, sismo_capas_edit_seduvi.estado, sismo_capas_edit_seduvi.cuentapredial, sismo_capas_edit_seduvi.coincidencia, sismo_capas_edit_seduvi.lat_predio, sismo_capas_edit_seduvi.lng_predio FROM sismo_capas_edit_seduvi INNER JOIN delegaciones_df ON ST_Contains(delegaciones_df.the_geom,sismo_capas_edit_seduvi.the_geom) INNER JOIN colonias_ok ON ST_Contains(colonias_ok.the_geom,sismo_capas_edit_seduvi.the_geom) INNER JOIN "finanzasdf-admin".basecalle_copy ON ST_Contains("finanzasdf-admin".basecalle_copy.the_geom,sismo_capas_edit_seduvi.the_geom) WHERE "finanzasdf-admin".basecalle_copy.nombre = '+optioncalle;
                    // intersql = 'SELECT sismo_capas_edit_seduvi.the_geom_webmercator, sismo_capas_edit_seduvi.cartodb_id, sismo_capas_edit_seduvi.the_geom, sismo_capas_edit_seduvi.lat, sismo_capas_edit_seduvi.idregistro, sismo_capas_edit_seduvi.lng, sismo_capas_edit_seduvi.dependencia, sismo_capas_edit_seduvi.capa, sismo_capas_edit_seduvi.clas_global, sismo_capas_edit_seduvi.deleg, sismo_capas_edit_seduvi.estado, sismo_capas_edit_seduvi.cuentapredial, sismo_capas_edit_seduvi.coincidencia, sismo_capas_edit_seduvi.lat_predio, sismo_capas_edit_seduvi.lng_predio FROM sismo_capas_edit_seduvi INNER JOIN "finanzasdf-admin".basecalle_copy ON ST_Contains("finanzasdf-admin".basecalle_copy.the_geom,sismo_capas_edit_seduvi.the_geom) WHERE "finanzasdf-admin".basecalle_copy.nombre = '+optioncalle;
                    // intersql = 'SELECT "finanzasdf-admin".basecalle_copy.nombrecalle, "finanzasdf-admin".basecalle_copy.the_geom, "finanzasdf-admin".basecalle_copy.the_geom_webmercator, "finanzasdf-admin".basecalle_copy.coloniaid, "finanzasdf-admin".basecalle_copy.delegacionesid FROM "finanzasdf-admin".basecalle_copy  WHERE "finanzasdf-admin".basecalle_copy.coloniaid = '+optioncolonia+' AND "finanzasdf-admin".basecalle_copy.delegacionesid = '+optiondelegacion+' AND "finanzasdf-admin".basecalle_copy.nombrecalle = '+optioncalle+' ORDER BY "finanzasdf-admin".basecalle_copy.nombrecalle ASC';

                } else if(optioncolonia != "*"){
                    intersql = "SELECT sismo_capas_edit_seduvi.the_geom_webmercator, sismo_capas_edit_seduvi.cartodb_id, sismo_capas_edit_seduvi.the_geom, sismo_capas_edit_seduvi.lat, sismo_capas_edit_seduvi.idregistro, sismo_capas_edit_seduvi.lng, sismo_capas_edit_seduvi.dependencia, sismo_capas_edit_seduvi.capa, sismo_capas_edit_seduvi.clas_global, sismo_capas_edit_seduvi.deleg, sismo_capas_edit_seduvi.estado, sismo_capas_edit_seduvi.cuentapredial, sismo_capas_edit_seduvi.coincidencia, sismo_capas_edit_seduvi.lat_predio, sismo_capas_edit_seduvi.lng_predio FROM sismo_capas_edit_seduvi INNER JOIN delegaciones_df ON ST_Contains(delegaciones_df.the_geom,sismo_capas_edit_seduvi.the_geom) INNER JOIN colonias_ok ON ST_Contains(colonias_ok.the_geom,sismo_capas_edit_seduvi.the_geom) WHERE colonias_ok.cartodb_id = "+optioncolonia;

                }else if (optiondelegacion != "*" ){
                    intersql = "SELECT sismo_capas_edit_seduvi.the_geom_webmercator, sismo_capas_edit_seduvi.cartodb_id, sismo_capas_edit_seduvi.the_geom, sismo_capas_edit_seduvi.lat, sismo_capas_edit_seduvi.idregistro, sismo_capas_edit_seduvi.lng, sismo_capas_edit_seduvi.dependencia, sismo_capas_edit_seduvi.capa, sismo_capas_edit_seduvi.clas_global, sismo_capas_edit_seduvi.deleg, sismo_capas_edit_seduvi.estado, sismo_capas_edit_seduvi.cuentapredial, sismo_capas_edit_seduvi.coincidencia, sismo_capas_edit_seduvi.lat_predio, sismo_capas_edit_seduvi.lng_predio FROM sismo_capas_edit_seduvi INNER JOIN delegaciones_df ON ST_Contains(delegaciones_df.the_geom,sismo_capas_edit_seduvi.the_geom) WHERE delegaciones_df.cartodb_id = "+optiondelegacion;
                }
            

            // intersql = "SELECT sismo_capas_edit_seduvi.the_geom_webmercator, sismo_capas_edit_seduvi.cartodb_id, sismo_capas_edit_seduvi.the_geom, sismo_capas_edit_seduvi.lat, sismo_capas_edit_seduvi.idregistro, sismo_capas_edit_seduvi.lng, sismo_capas_edit_seduvi.dependencia, sismo_capas_edit_seduvi.capa, sismo_capas_edit_seduvi.clas_global, sismo_capas_edit_seduvi.deleg, sismo_capas_edit_seduvi.estado, sismo_capas_edit_seduvi.cuentapredial, sismo_capas_edit_seduvi.coincidencia, sismo_capas_edit_seduvi.lat_predio, sismo_capas_edit_seduvi.lng_predio FROM sismo_capas_edit_seduvi INNER JOIN delegaciones_df ON ST_Contains(delegaciones_df.the_geom,sismo_capas_edit_seduvi.the_geom) WHERE delegaciones_df.cartodb_id = "+optiondelegacion;

            var strsql ='https://finanzasdf-admin.carto.com/api/v2/sql/?format=geojson&q='+intersql;
            
            var semaforo;


            $.getJSON(strsql, function(data) {
	            // drawnItems.removeLayer();
	            drawnItems.eachLayer(function (layer) {
	                drawnItems.removeLayer(layer);
	            });
                
				geojsonLayer = L.geoJson(data, {
					pointToLayer: function(geoJsonPoint, latlng) {
					    return L.marker(latlng);
					 	//var redMarker = L.ExtraMarkers.icon({
						// 	icon: 'fa-coffee',
						// 	markerColor: 'red',
						// 	shape: 'square',
						// 	prefix: 'fa'
						// });
					},
					onEachFeature: function (feature, layer) {
					    if (feature.geometry.type === 'Point') {

					        switch(feature.properties.clas_global) {
					            case 0:
					                semaforo = "Verde";
					                break;
					            case 1:
					                semaforo = "Rojo";
					                break;
					            case 2:
					                semaforo = "Amarillo";
					                break;
					            case 3:
					                semaforo = "Sin captura";
					                break;
					            case 4:
					                semaforo = "Rosa";
					                break;
					            case 'NULL':
					                semaforo = "N/P";
					        } 

					        layer.bindPopup("<b>ID carto: </b>"+feature.properties.cartodb_id+"<br>"+
					            "<b>Punto: </b>"+semaforo+"<br>"+
					            "<b>ID registro: </b>"+feature.properties.idregistro+"<br>"+
					            "<b>Latitud: </b>"+feature.properties.lat+"<br>"+
					            "<b>Longitud: </b>"+feature.properties.lng+"<br>");
					    }
                        layer.cartodb_id=feature.properties.cartodb_id;
					    drawnItems.addLayer(layer);
					}
				});//.addTo(map);
                map.addLayer(drawnItems);

            });//FIN getJSON

            drawnItems.bringToBack();

        }// fin funtion layer

});