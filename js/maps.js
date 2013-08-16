var map;

        function initialize() {
          var mapOptions = {
            zoom: 14,
            disableDefaultUI: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          map = new google.maps.Map(document.getElementById('map-canvas'),
              mapOptions);

          // Try HTML5 geolocation
          //if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
              var pos = new google.maps.LatLng(position.coords.latitude,
                                               position.coords.longitude);
              var marker = new google.maps.Marker({
                map: map,
                position: pos,
                animation: google.maps.Animation.DROP,
              });

              map.setCenter(pos);
            }, function() {
              handleNoGeolocation(true);
            });
        /*  } else {
            // Browser doesn't support Geolocation
            handleNoGeolocation(false);
          }*/
        }

        function handleNoGeolocation(errorFlag) {
          if (errorFlag) {
            var content = 'Error: The Geolocation service failed.';
          } else {
            var content = 'Error: Your browser doesn\'t support geolocation.';
          }

          var options = {
            map: map,
            position: new google.maps.LatLng(60, 105),
            content: content
          };

          var marker = new google.maps.Marker(options);
          map.setCenter(options.position);
        }
function getGpsLocation(){
	navigator.geolocation.getCurrentPosition(getGeonamesData,function(){alert("Getting location failed");},{enableHighAccuracy:true,timeout:10000});
	function getGeonamesData(res){
		alert(res.coords.latitude);
		$.get("http://api.geonames.org/extendedFindNearby?lat="+res.coords.latitude+"&lng="+res.coords.longitude+"&username=piecewise",function(data){
			var data=$.parseXML(data);
			$("#addr1").val($(data).find("streetNumber").text()+" "+$(data).find("street").text());
			$("#city").val($(data).find("placename").text());
			$("#state").children("option").removeAttr("selected");
			$("#state").children("[value="+$(data).find("adminCode1").text()+"]").attr("selected","selected");
			$("#zip").val($(data).find("postalcode").text());
		});
	}
}
        //google.maps.event.addDomListener(window, 'load', initialize);