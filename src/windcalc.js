            // Stored query ids.
            var STORED_QUERY_OBSERVATION = "fmi::observations::weather::multipointcoverage";
            var STORED_QUERY_FORECAST = "fmi::forecast::hirlam::surface::point::multipointcoverage";

            // URL for server.
            var SERVER_URL = "http://data.fmi.fi/fmi-apikey/04b1145b-d491-4d85-8a30-c542108ee5b9/wfs";
			
			function drawResiduals(comparea,series) {
					var serx = [];
					var resids = [];
				for(i=0;i<series.length;i++) {
					serx[i] = [i, series[i]];	
				}
				var lreg = ss.linear_regression().data(serx).line();
				for(i=0;i<series.length;i++) {
					resids[i] = Math.abs(series[i] - lreg(i));	
				}
				osc = Math.ceil(ss.max(resids));
				trend = Math.ceil(ss.linear_regression().data(serx).m() * 6);
				comparea.font="14px sans-serif";
				comparea.fillText("Oskillaatio: ±" + osc + "°",60,395);
				comparea.fillText("Trendi: " + trend + "°/h",220,395);
			}
			function drawCompass(comparea) {
			comparea.font="10px sans-serif";
			comparea.lineWidth = 1;
			comparea.setLineDash([1,1]);
			comparea.strokeStyle = "rgb(60,60,60)";
			/* pohjois-etelä */
			comparea.fillText("W",0,200);
			comparea.beginPath();
			comparea.moveTo(20,200);
			comparea.lineTo(380,200);
			comparea.stroke();
			comparea.fillText("E",390,200);
			/* itä - länsi */
			comparea.fillText("S",195,395);
			comparea.beginPath();
			comparea.moveTo(200,20);
			comparea.lineTo(200,380);
			comparea.stroke();
			comparea.fillText("N",195,10);
			/* koi - lou */
			comparea.fillText("NE",341,59);
			comparea.beginPath();
			comparea.moveTo(327,73);
			comparea.lineTo(73,327);
			comparea.stroke();
			comparea.fillText("SW",59,341);			
			/* kaa - luo */
			comparea.fillText("SE",341,341);
			comparea.beginPath();
			comparea.moveTo(327,327);
			comparea.lineTo(73,73);
			comparea.stroke();
			comparea.fillText("NW",59,59);
			/* selite */
			comparea.fillText("VIIM",0,10);
			comparea.strokeStyle = "rgb(0,0,0)";
			comparea.lineWidth = 2;
			comparea.setLineDash([1,0]);
			comparea.beginPath();
			comparea.moveTo(25,5);
			comparea.lineTo(70,5);
			comparea.stroke();
			comparea.fillText("KA",80,10);
			comparea.beginPath();
			comparea.strokeStyle = "rgb(0,240,0)";
			comparea.lineWidth = 2;
			comparea.setLineDash([1,0]);
			comparea.moveTo(105,5);
			comparea.lineTo(150,5);
			comparea.stroke();
			comparea.fillText("MIN",220,10);
			comparea.beginPath();
			comparea.strokeStyle = "rgb(240,0,0)";
			comparea.lineWidth = 2;
			comparea.setLineDash([2,4]);
			comparea.moveTo(245,5);
			comparea.lineTo(290,5);
			comparea.stroke();
			comparea.fillText("MAX",300,10);
			comparea.beginPath();
			comparea.strokeStyle = "rgb(0,0,240)";
			comparea.lineWidth = 2;
			comparea.setLineDash([2,4]);
			comparea.moveTo(325,5);
			comparea.lineTo(370,5);
			comparea.stroke();
			
			}

			function drawLines(comparea,wval,color,ltype) {
			var ang = 90 - wval; if (ang<0) {ang+=360};
			ang = ang/360*2*Math.PI;
			var loppuy = 200-(170*Math.sin(ang));
			var loppux = 200+(170*Math.cos(ang));
			comparea.strokeStyle = color;
			comparea.lineWidth = 3;
			comparea.setLineDash(ltype);
			comparea.beginPath();
			comparea.moveTo(200,200);
			comparea.lineTo(loppux,loppuy);
			comparea.stroke();
			}

            /*	esittää havainnot omissa sarakkeissaan	*/
            function showResults(container, data) {
			var hsarja = [];
                _.each(data, function(value, key) {
				var havainnot = {
					suure: "",
					aika: [],
					mittaus: []
					} ;
				havainnot.suure = key;
				outdiv = "#"+key;	
				var outfield = $(outdiv);
				outfield.empty();
				outfield.append("<br>" + key);					
					var vcount = 0;
					var ser = [];
					var currentDate= new Date().setHours(0,0,0,0);
					_.each(value.timeValuePairs, function(prop,label) {
						var aika = (prop.time-currentDate)/60000;
						var hrs = Math.floor(aika/60);
						var mint = aika-(hrs*60);
						if (mint == 0) { mins = "00" } else {mins = mint};
						var aikastr = hrs+":"+mins;
						havainnot.aika[vcount] = aikastr;
						havainnot.mittaus[vcount] = prop.value;
						ser[vcount] = vcount;
						vcount += 1;
					});
					    kova = ss.sample_covariance(ser,havainnot.mittaus);
					    varx = ss.sample_variance(ser);
	 				    outfield.append("<br> n: " + havainnot.mittaus.length);
						outfield.append("<br> Viim: " + havainnot.mittaus[havainnot.mittaus.length-1]);
						outfield.append("<br> Min: " + ss.min(havainnot.mittaus));
						outfield.append("<br> Max: " + ss.max(havainnot.mittaus));
						outfield.append("<br> KA: " + ss.mean(havainnot.mittaus).toFixed(1));
						outfield.append("<br> Muutos: " + (6*kova/varx).toFixed(1));
				hsarja.push(havainnot);
				});
			var w10plot = {
					labels: hsarja[1].aika,
					datasets: [ {
				    fillColor: "rgba(220,220,220,0.2)",
					strokeColor: "rgba(220,220,220,1)",
					pointColor: "rgba(220,220,220,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(220,220,220,1)",
					data: hsarja[1].mittaus } ,
					{
				    fillColor: "rgba(220,220,220,0.2)",
					strokeColor: "rgba(220,220,220,1)",
					pointColor: "rgba(220,220,220,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(220,220,220,1)",
					data: hsarja[2].mittaus } ]
					}
			var windctx = $("#wind").get(0).getContext("2d");
			Chart.defaults.global.scaleOverride = true;
			Chart.defaults.global.scaleSteps = Math.ceil(ss.max(hsarja[2].mittaus)/3);
			Chart.defaults.global.scaleStepWidth = 3;
			Chart.defaults.global.scaleStartValue = 0;
			var windChart = new Chart(windctx).Line(w10plot);
			/* piirretään tuulinuoli omaan kenttään */
			var wdnow = hsarja[3].mittaus[hsarja[3].mittaus.length-1];
			var	wdmin = ss.min(hsarja[3].mittaus);
			var wdmax = ss.max(hsarja[3].mittaus);
			var wdmean = ss.mean(hsarja[3].mittaus).toFixed(1);
			var dashed = [2,4];
			var solid = [1,0];
			var compctx = $("#compass").get(0).getContext("2d");
			compctx.clearRect(0,0,compctx.canvas.width, compctx.canvas.height);
			drawCompass(compctx);
			drawLines(compctx,wdnow,"rgb(0,0,0)",solid);
			drawLines(compctx,wdmin,"rgb(240,0,0)",dashed);
			drawLines(compctx,wdmax,"rgb(0,0,240)",dashed);
			drawLines(compctx,wdmean,"rgb(0,240,0)",solid);
			drawResiduals(compctx,hsarja[3].mittaus);
            } 
            /**
			Alustaa tulostusmuuttujat ja kutsuu tulostusfunktiota
			*/
            function handleCallback(data, errors) {
				var results = $("#results");
				var otime = $("#otime");
				results.empty();
				otime.empty();
				results.append("<h3>" + data.locations[0].info.name + "</h3>");
                		tstamp = Math.floor(new Date().getTime() / 600000) * 600000;
				tdate = new Date(tstamp)
				otime.append("<br>Aika: " + tdate.getHours() + ":" + ("0" + (tdate.getMinutes())).slice(-2));
                if (data) {
                    showResults(results, data.locations[0].data);
                }
            } 

            function getData(url,locid) {
                // See API documentation and comments from parser source code of
                // fi.fmi.metoclient.metolib.WfsRequestParser.getData function for the description
                // of function options parameter object and for the callback parameters objects structures.
                fi.fmi.metoclient.metolib.WfsRequestParser.getData({
                    url : url,
                    storedQueryId : STORED_QUERY_OBSERVATION,
                    requestParameter : "t2m,ws_10min,wg_10min,wd_10min,p_sea",
                    // Viimeisestä havainnosta kolme tuntia taaksepäin
                    end : Math.floor(new Date().getTime() / 600000) * 600000,
					begin : Math.floor(new Date().getTime() / 600000) * 600000 - 3 * 60 * 60 *1000,
					fmisid : locid,
                    callback : function(data, errors) {
                        // Handle the data and errors object in a way you choose.
                        // Here, we delegate the content for a separate handler function.
                        // See parser documentation from source code comments for more details.
                        handleCallback(data, errors);
                    }
                });
            }
		function dothis() {
			// ** Chart **
			// Get context with jQuery - using jQuery's .get() method.
			// Chart.defaults.global.responsive = true;
			
			// This will get the first returned node in the jQuery collection.
			// havaintopaikka pudotusvalikosta
			var place = $("#select1").val();
			switch(place) {
			case "1":
				locid = "101042";
			case "2":
				locid = "101030";
				break;
			case "3":
				locid = "101039";
				break;
			case "4":
				locid = "101023";
				break;
			case "5":
				locid = "101022";
				break;
			case "6":
				locid = "101029";
				break;
			case "7":
				locid = "100996";
				break;
			case "8":
				locid = "101003";
				break;
			case "9":
				locid = "100997";
				break;
			case "10":
				locid = "100969";
				break;
			case "11":
				locid = "100965";
				break;
			case "12":
				locid = "100946";
				break;
			}			
                getData(SERVER_URL, locid);
            }

