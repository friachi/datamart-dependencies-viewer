//Attach listeners to rest input field and send button

 var sendURI = "";
 var token = "token";

    //ReST URL
    $("#sendButton").click(function(){
        sendURI = $('#sendValue').val();
        token = $('#tokenButton').val();
        $('.mainbody').empty();
        sendRest(sendURI,token)

    });


    $("#sendValue").on('keyup', function (e) {
        if (e.keyCode == 13) {
            sendURI = $('#sendValue').val();
            token = $('#tokenButton').val();
            $('.mainbody').empty();
            sendRest(sendURI,token)
        }
    });

    $("#tokenButton").click(function () {
        $(this).select();
    });




////////////////////////////////
////////// Get Data  ///////////
////////////////////////////////
function sendRest(getURL, token)
{


	//get data and draw
	$.ajax({
	   type: "GET",
	   dataType: "json",
	   url: getURL,
	   beforeSend: function (xhr) {
           xhr.setRequestHeader ("Authorization", "Bearer "+token);
        },
	   success: function(res){

                loadGraph(res);
            },
       error: function(jqXHR, textStatus, errorThrown){
            console.log("status: " + jqXHR.status);
            console.log("response Text: " + jqXHR.responseText);
            alert('Request failed.\nCheck browser console for more info (hit F12 in Chrome) \nResponse code: '+jqXHR.status+' \nnmessage: ' + jqXHR.responseText);
       }

	   });

}



////////////////////////////////
////////// Load Data  //////////
////////////////////////////////
function loadGraph(response)
{
        //before pushing to simulation, make copy of the JSON Graph so it can be shown to user
        //as json without the D3 simulation params added later on.
        jsonData = JSON.parse(JSON.stringify(response));

        update(response.graphs[0].edges, response.graphs[0].nodes,jsonData);

}



////////////////////////////////
////////// Draw Data  //////////
////////////////////////////////



function update(links, nodes, jsonData) {

//add listener for search bar
$("#inpt_search").on('focus', function () {
    $(this).parent('label').addClass('active');
});

$("#inpt_search").on('blur', function () {
    if($(this).val().length == 0)
     {
        $(this).parent('label').removeClass('active');
        searchGraph("");
        d3.selectAll("#inpt_search").style("color","#333333");
        d3.selectAll("#cntCircle").style("visibility","hidden")
                                    .text("");
     }
});

$("#inpt_search").on('keyup', function (e) {
         if (e.keyCode == 13) {
             searchGraph($(this).val());
         }
});

////// Global variables //////


    var chartDiv = document.getElementById("chart");
    var jsonData;
    var nodesWithDepth = 0;
    var depths = [];
    var yForces = {};
    var hierarchyMode = false;

    ////////// svg  //////////
    var svg = d3.select(chartDiv).append("svg"),
        node,
        link;

        width = chartDiv.clientWidth;
        height = chartDiv.clientHeight;

        svg
          .attr("width", width)
          .attr("height", height);

    ////////// tooltips  //////////

    // Define the div for the tooltip
    var divNodeTooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // Define the div for the tooltip
    var divEdgeTooltip= d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // Define the div for the json
    var divJsonTooltip= d3.select("body").append("div")
    .attr("class", "jsonDiv")
    .style("opacity", 0);

    // Define the div for the GML
    var divGmlTooltip= d3.select("body").append("div")
    .attr("class", "gmlDiv")
    .style("opacity", 0);


    //// create Legend dynamically based on available node types.
     var legend = {};
     nodesWithDepth = 0;
     depths = [];

    for(var i in nodes)
    {
        if(legend.hasOwnProperty(nodes[i].type)) {
            legend[nodes[i].type].nodeCount += 1;
        }
        else
         {
          legend[nodes[i].type] = {};
          legend[nodes[i].type].nodeCount = 1;

         }

         //check if node has metadata.depth property (used later to show(or not) the checkbox 'Force data-stream hierarchy''
         if(checkNested(nodes[i],"metadata","depth")){

             if(depths.indexOf(parseInt(nodes[i].metadata.depth)) === -1)
               {
                 depths.push(parseInt(nodes[i].metadata.depth));
               }
             nodesWithDepth++;
         }

    }

    var nbOfTypes = ObjectLength(legend);

    var legendColor = d3.scale.linear().domain([1,nbOfTypes+1]) //add 1 more color to avoid black if only 2 types exists
      .interpolate(d3.interpolateHcl)
      .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);

     var k = 0;
     for (const key of Object.keys(legend)) {
        legend[key].color = legendColor(k);
        legend[key].dimmed = false;
        legend[key].Y = height*((k+1)/nbOfTypes);
        k++;
     }


    ///////// Controls /////////////

    //show buttons
    d3.select("#jsonButton").style("visibility","visible");
    d3.select("#gmlButton").style("visibility","visible");
    d3.select("#searchBar").style("visibility","visible");

    //add listeners to buttons
    d3.select("#jsonButton")
    .on("click", function(){
        divGmlTooltip.html("").style("opacity", 0);
        if(divJsonTooltip.style("opacity") == 0)
        {
            divJsonTooltip.html("<pre>" + JSON.stringify(jsonData, null, 1) + "</pre>")
                            .style("right", "25px").style("top", 57 + "px").style("opacity", 1);
        }
        else
            divJsonTooltip.html("").style("opacity", 0);
    })
    .on("dblclick",function(){
        var textToSave = JSON.stringify(jsonData, null, 1);

        var hiddenElement = document.createElement('a');

        hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'graph.json';
        hiddenElement.click();
    });

    d3.select("#gmlButton")
    .on("click", function(){
        divJsonTooltip.html("").style("opacity", 0);
        if(divGmlTooltip.style("opacity") == 0)
        {
            divGmlTooltip.html("<pre>" + convertToGML(jsonData) + "</pre>")
                            .style("right", "25px").style("top", 57 + "px").style("opacity", 1);
        }
        else
            divGmlTooltip.html("").style("opacity", 0);
    })
    .on("dblclick",function(){
        var textToSave = convertToGML(jsonData);

        var hiddenElement = document.createElement('a');

        hiddenElement.href = 'data:attachment/text,' + encodeURI(textToSave);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'graph.gml';
        hiddenElement.click();
    });

    //checkbox
    d3.select("#hierarchyBox")
        .on("change", function(){
            if(this.checked)
            {
                hierarchyMode = true;
                d3.select("#verticalLine").style("visibility","visible");

            }
            else
            {
                hierarchyMode = false;
                d3.select("#verticalLine").style("visibility","hidden");
             }
            force.start();  //to restart simulation, thus allowing nodes to reposition
        });


   ////////// arrow markers  //////////
   svg.append('defs')
        .append('marker')
            .attr("id","arrowhead")
            .attr("viewBox","-0 -5 10 10")
            .attr("refX","13")
            .attr("refY","0")
            .attr("orient","auto")
            .attr("markerWidth","13")
            .attr("markerHeight","13")
            .attr("xoverflow","visible")
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#d8d8d8')
        .style('stroke','none');

   svg.append('defs')
        .append('marker')
            .attr("id","arrow")
            .attr("viewBox","-0 -5 10 10")
            .attr("refX","0")
            .attr("refY","0")
            .attr("orient","auto")
            .attr("markerWidth","13")
            .attr("markerHeight","13")
            .attr("xoverflow","visible")
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke','none');

    //vertical line for 'hierarchy mode'
    var verticalLine = svg.append("g")
                          .attr("id","verticalLine")
                          .style("visibility","hidden");

    verticalLine.append("line")
        .style("stroke","grey")
        .attr("x1",width-50)
        .attr("x2",width-50)
        .attr("y1","107")
        .attr("y2",height-50)
        .attr('marker-start', 'url(#arrow)')
        .attr('marker-end', 'url(#arrow)')

    verticalLine.append("text")
        .attr("dx", width-80)
        .attr("dy", 97)
        .text("Upstream")
        .attr('fill', '#999')
        .style('stroke','none')
        .attr("font-size","13");

    verticalLine.append("text")
        .attr("dx", width-84)
        .attr("dy", height-20)
        .text("Downstream")
        .attr('fill', '#999')
        .style('stroke','none')
        .attr("font-size","13");

    ////////// Simulation //////////
    var force = d3.layout.force()
        .size([width, height])
        .charge(-700)
        //.chargeDistance(600)
        .linkDistance(100)
        .linkStrength(1)
        //.gravity(.15)
        //.friction(.8)
        .on("tick", tick);


       var drag = force.drag()
        .on("dragstart", dragstart);




    //check if all nodes have 'depth' property, if yes then show button and calculate yForces object
    yForces = {};
    if(nodesWithDepth == nodes.length)
    {
        d3.select("#hcheckbox").style("visibility","visible");


        //sort depths array in DESC order (as we will use top (positive depth) and bottom (negative depth) when
        //assigning y value for custom simulation forces top to bottom
        depths.sort(function(a, b){return b - a });

        var nbOfDepths = depths.length;
        var margin = 100;

        for(i = 0; i < nbOfDepths; i++)
        {
            yForces[depths[i].toString()] = Math.ceil((i+1) * (1/nbOfDepths) * (height-margin));
        }
    }


    //legend
    var factor = 0.4;
    var legendArea = svg.append("g")
        .attr("class", "legend")

        legendArea.selectAll("rect")
            .data(d3.keys(legend))
            .enter().append("rect")
            .attr("id",function(d){ return 'legend-rect-' + d; })
            .attr("x",20)
            .attr("y", function(d) { return factor*legend[d].Y+70; })
            .attr("rx", "8")
            .attr("ry", "8")
            .attr("height", 30)
            .attr("width", 180)
            .attr("fill",function(d) { return legend[d].color;})
            .on("click",function(d){
               toggleNodeVisibility(d);
            })
            .on("dblclick",function(d){
                toggleOtherNodesVisibility(d);
            });


        legendArea.selectAll("text")
            .data(d3.keys(legend))
            .enter().append("text")
            .attr("id",function(d){ return 'legend-text-' +d; })
            .attr("x",25)
            .attr("y", function(d) { return (factor*legend[d].Y)+90; })
            .style("fill", "black")
            .text(function(d) { return d + ' ('+legend[d].nodeCount+')';})
            .on("click",function(d){
               toggleNodeVisibility(d);
            })
            .on("dblclick",function(d){
                toggleOtherNodesVisibility(d);
            });


//////////////////////////////
/////////// Links ////////////
//////////////////////////////

    //in order to be able to draw arcs between nodes that have multiple links,
    //we need to find those nodes and put a variables about the number of links
    //so we can vary the arc curveture, the variable will be called linknum
    //linknum:0 yields a strieght line, higher values will increase the arc curveture.

    //sort links by source, then target
      links.sort(function(a, b) {
        if (a.source > b.source) {
          return 1;
        }
        else if (a.source < b.source) {
          return -1;
        }
        else {
          if (a.target > b.target) {
            return 1;
          }
          if (a.target < b.target) {
            return -1;
          }
          else {
            return 0;
          }
        }
      });

    //any links with duplicate source and target get an incremented 'linknum'
    for (var i = 0; i < links.length; i++) {
        if (i != 0 &&
          links[i].source == links[i - 1].source &&
          links[i].target == links[i - 1].target) {
          links[i].linknum = links[i - 1].linknum + 1;
        }
        else {
          links[i].linknum = 0;
        };
    };


    //start adding the directed arrows
    link = svg.selectAll(".edgepath")
        .data(links)
        .enter()
        .append("svg:path")
            .attr("class","edgepath")
            .attr("fill-opacity","0")
            .attr("stroke-opacity","0")
            .attr("id",function (d, i) {return 'edgepath' + i})
        .style("pointer-events", "none")
        .attr('marker-end','url(#arrowhead)');

    //add labels and events to arrows
    edgelabels = svg.selectAll(".edgelabel")
        .data(links)
        .enter()
        .append('text')
        //.style("pointer-events", "none")
            .attr("class","edgelabel")
            .attr("id",function (d, i) {return 'edgelabel' + i})
            .attr("font-size","15")
            .attr("fill","#aaa")
        .on("mouseover", function(d) {
                //highlight link in red
                d3.select(this).style("fill", "red").attr('fill-opacity', 1);

                //create an object representing the node and exclude all d3 added properties to enhance visibility
                var temp = {
                    "source": d.source.id,
                    "relation": d.relation,
                    "target": d.target.id
                }
                if(d.hasOwnProperty("metadata")){
                    temp.metadata = d.metadata;
                }
         //show tooltip
         divEdgeTooltip.transition().delay(1000).duration(200).style("opacity", .9);
                    divEdgeTooltip.html("<pre>" + JSON.stringify(temp, null, 1) + "</pre>")
                        .style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
         })
        .on("mouseout", function(d) {
                d3.select(this).style("fill", "#999").attr('fill-opacity', 0.6);
                divEdgeTooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

     edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) {return '#edgepath' + i})
            .style("text-anchor", "middle")
            //.style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) {return d.relation})
            .attr('pointer-events', 'visibleStroke');


//////////////////////////////
/////////// Nodes ////////////
//////////////////////////////

    //Add nodes and events on them
    node = svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .on("dblclick", dblclick)
        .call(drag)
        .on("mouseover", function(d) {
            //create an object representing the node and exclude all d3 added properties to enhance visibility
            var temp = {
                "id": d.id,
                "type": d.type,
                "label": d.label,
            };
            if(d.hasOwnProperty("metadata")){
                        temp.metadata = d.metadata;
            }

            //show tooltip
            divNodeTooltip.transition().delay(1000).duration(200).style("opacity", .9);
                        divNodeTooltip.html("<pre>" + JSON.stringify(temp, null, 1) + "</pre>")
                            .style("left", (d3.event.pageX) + "px").style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            divNodeTooltip.transition()
            .duration(200)
            .style("opacity", 0);
        });

    node.append("circle")
            .attr("r", 10)
            .attr("fill", function(d) { return legend[d.type].color; })

    /*tooltip?
    node.append("title")
        .text(function (d) {return d.metadata.depth});
    */

    node.append("text")
        .attr("dx", 7)
        .attr("dy", 0)
        .text(function (d) {return d.label;});




    //allow links to reference nodes by name instead of by id
    //this by changing the link source and target attribute to point to the actual node object

        var obj = {}
        nodes.forEach(function(d,i){
          obj[d.id] = i;             // create an object to look up a node's index by id
        })

        links.forEach(function(d) {
          d.source = obj[d.source];  // look up the index of source
          d.target = obj[d.target];  // look up the index of target
        })

     /////////////push nodes and links to Simulation ////////////
     force.nodes(nodes);
     force.links(links);
     force.start();

/////////////////////////////////
////////// Utility fns //////////
/////////////////////////////////

function dblclick(d) {
        d3.select(this).classed("fixed", d.fixed = false);
}

function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
}


function checkNested(obj) {
         // to check if a json contains a given path property
         //usage: checkNested(jsonObje, "level1","level2","levelN") return true if found
          var args = Array.prototype.slice.call(arguments, 1);

          for (var i = 0; i < args.length; i++) {
            if (!obj || !obj.hasOwnProperty(args[i])) {
              return false;
            }
            obj = obj[args[i]];
          }
          return true;
}

function ObjectLength( object ) {
    var length = 0;
    for( var key in object ) {
        if( object.hasOwnProperty(key) ) {
            ++length;
        }
    }
    return length;
};


function toggleNodeVisibility(nodeType){

        var foundNodes = d3.selectAll(".node").filter(function(d){return d.type === nodeType ;});

        if(legend[nodeType].dimmed) {

            d3.select("rect[id='legend-rect-"+nodeType+"']").transition().duration(500).style("opacity",1);
            d3.select("text[id='legend-text-"+nodeType+"']").transition().duration(500).style("opacity",1);
            foundNodes.transition().duration(500).style("opacity",1);
            legend[nodeType].dimmed = false;
        }
        else{
            d3.select("rect[id='legend-rect-"+nodeType+"']").transition().duration(500).style("opacity",0.2);
            d3.select("text[id='legend-text-"+nodeType+"']").transition().duration(500).style("opacity",0.2);
            foundNodes.transition().duration(500).style("opacity",0.2);
            legend[nodeType].dimmed = true;
        }

}

function toggleOtherNodesVisibility(nodeType){

        var foundNodes = d3.selectAll(".node").filter(function(d){return d.type === nodeType ;});
        var otherNodes = d3.selectAll(".node").filter(function(d){return d.type != nodeType ;});

        //make dbl clicked legend visible
        d3.select("rect[id='legend-rect-"+nodeType+"']").transition().duration(500).style("opacity",1);
        d3.select("text[id='legend-text-"+nodeType+"']").transition().duration(500).style("opacity",1);
        legend[nodeType].dimmed = false;

        //make nodes of selected type visible
        foundNodes.transition().duration(500).style("opacity",1);

        //dim all other legends
        for (const key of Object.keys(legend)) {
            if(key != nodeType) {
                d3.select("rect[id='legend-rect-"+key+"']").transition().duration(500).style("opacity",0.2);
                d3.select("text[id='legend-text-"+key+"']").transition().duration(500).style("opacity",0.2);
                legend[key].dimmed = true;
             }
        }

        //dim all other nodes
        otherNodes.transition().duration(500).style("opacity",0.21);


        //copy the labels of matching nodes to clipboard
        var listOfNodesLabels = "List of nodes of type '"+ nodeType + "': \n";
        nodes.forEach(function(d){
         if(d.type === nodeType)
         {
            listOfNodesLabels += d.label + "\n";
         }

        });
        copyToClipboard(listOfNodesLabels);

}


function searchGraph(searchPattern){
//make all nodes and edges visible (i.e rest search in case there was a previous search active)

node.style("stroke","none")
    .style("stroke-width","0")
    .style("opacity","1")

link.style("stroke","#999")
    .style("stroke-width","1")
    .style("stroke-opacity","0.6")

var cntFoundNodes = 0;
var cntFoundLinks = 0;

var searchOnlyNodes = false;
var searchOnlyEdges = false;

if(searchPattern != ""){

    if(searchPattern.trim().startsWith("(") && searchPattern.trim().endsWith(")"))
    {
        searchOnlyNodes = true;
        link.transition()
            .duration(200)
            .style("stroke-opacity","0.01");
    }

    if(searchPattern.trim().startsWith("-") && searchPattern.trim().endsWith("-"))
    {
        searchOnlyEdges = true;
        node.transition()
           .duration(200)
           .style("opacity","0.1");
    }


        if(searchOnlyNodes === true || (searchOnlyNodes === false && searchOnlyEdges === false)){

            //highlight nodes
            var foundNodes = d3.selectAll(".node").filter(function(d){
                                                        var string = JSON.stringify(d);
                                                        if(string.toLowerCase().indexOf(searchPattern.toLowerCase().trim().replace(/^\(+|\)+$/g, '')) != -1) {
                                                            cntFoundNodes++ ;
                                                            return true;
                                                            }
                                                    });
            foundNodes.transition()
                            .duration(200)
                            .style("stroke","black")
                            .style("stroke-width","1");

            //dim all other nodes
            var otherNodes = d3.selectAll(".node").filter(function(d){
                                                        var string = JSON.stringify(d);
                                                        if(string.toLowerCase().indexOf(searchPattern.toLowerCase().trim().replace(/^\(+|\)+$/g, '')) == -1) return true;
                                                    });
            otherNodes.transition()
                           .duration(200)
                           .style("opacity","0.1");


            }

    if(searchOnlyEdges === true || (searchOnlyNodes === false && searchOnlyEdges === false)){
            //highlight links
            var foundLinks = d3.selectAll(".edgepath").filter(function(d){
                                                        var string = JSON.stringify(d);
                                                        if(string.toLowerCase().indexOf(searchPattern.toLowerCase().trim().replace(/^\-+|\-+$/g, '')) != -1) {
                                                            cntFoundLinks++ ;
                                                            return true;
                                                            }
                                                    });
            foundLinks.transition()
                            .duration(200)
                            .style("stroke","red")
                            .style("stroke-width","1.5");

            //dim all other edges
            var otherLinks = d3.selectAll(".edgepath").filter(function(d){
                                                            var string = JSON.stringify(d);
                                                            if(string.toLowerCase().indexOf(searchPattern.toLowerCase().trim().replace(/^\-+|\-+$/g, '')) == -1) return true;
                                                        });
            otherLinks.transition()
                            .duration(200)
                            .style("stroke-opacity","0.01");
    }


        if((cntFoundNodes+cntFoundLinks) == 0)
            {
                d3.selectAll("#inpt_search").style("color","red");
            }
            else
           {
                d3.selectAll("#inpt_search").style("color","#333333");
           }

//show count of matching nodes/edges
d3.selectAll("#cntCircle").style("visibility","visible")
                            .text(cntFoundNodes+cntFoundLinks);

}
else
{
        d3.selectAll("#inpt_search").style("color","#333333");
        d3.selectAll(".cntCircle").style("visibility","hidden");
}


}


function convertToGML(jsonData)
{
//converts JSON graph to GML up to a depth of 2 nested objects for example node.metadata{}.output{}
var gml = 'graph [\n';


    jsonData.graphs[0].nodes.forEach(function(d){
    gml += ' node [\n';
    var k = 0;
         for (const key of Object.keys(d)) {
            if(typeof(d[key]) === 'object')
            {    var nested1 = d[key];
                 gml +='  '+ key + ' [\n';
                 for (const metaKey of Object.keys(nested1)) {
                    if(typeof(nested1[metaKey]) === 'object'){
                        gml +='   ' + metaKey + ' [\n';
                        var nested2 = nested1[metaKey];
                        for (const metaKey2 of Object.keys(nested2)) {
                            gml +='     ' + metaKey2 + ' "' + nested2[metaKey2] + '"\n';
                        }
                        gml += '    ]\n';
                    }
                    else {
                        gml += '   ' + metaKey + ' "' + nested1[metaKey] + '"\n';
                    }
                 }
                 gml += '  ]\n';

            }
            else
            {
                gml +='  ' + key + ' "' + d[key] + '"\n';
            }
         }
    gml += ' ]\n'; //end nodes
    });


    jsonData.graphs[0].edges.forEach(function(d){
    gml += ' edge [\n';
    var k = 0;
         for (const key of Object.keys(d)) {
            if(typeof(d[key]) === 'object')
            {    var nested1 = d[key];
                 gml +='  '+ key + ' [\n';
                 for (const metaKey of Object.keys(nested1)) {
                    if(typeof(nested1[metaKey]) === 'object'){
                        gml +='   ' + metaKey + ' [\n';
                        var nested2 = nested1[metaKey];
                        for (const metaKey2 of Object.keys(nested2)) {
                            gml +='     ' + metaKey2 + ' "' + nested2[metaKey2] + '"\n';
                        }
                        gml += '    ]\n';
                    }
                    else {
                        gml += '   ' + metaKey + ' "' + nested1[metaKey] + '"\n';
                    }
                 }
                 gml += '  ]\n';

            }
            else
            {
                gml +='  ' + key + ' "' + d[key] + '"\n';
            }
         }
    gml += ' ]\n'; //end nodes
    });


gml += ']\n'; //end graph
//console.log(gml);
return gml

}


function copyToClipboard(value) {
  var $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val(value).select();
  document.execCommand("copy"); //use cut to replace copy, this to avoid recursive call to .execCommand (which is prohibited in browsers to avoid attacks)
  $temp.remove();
}

function tick(e) {

        //update nodes position with each simulation tick

        //check if user wants to position nodes based on hierarchy (i.e node.metadata.depth)
        if(hierarchyMode)
        {
            //custom forces scalar
            var k = 0.6 * e.alpha;

            force.nodes().forEach(function(o) {

                //apply custom force: this vertically based on the "type" of node
                o.y += (yForces[o.metadata.depth] - o.y) * k;
            });
        }

        node.attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});


        //use linknum to set the arc strength (0  = strieght line, while higher values gives an arc) this to allow
        //for 2 nodes to have multi-links and still be able to see links and lables of links
        link.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y;
            var qx = dy /  2 * d.linknum, //linknum is defined above
            qy = -dx / 2 * d.linknum;
            var qx1 = (d.source.x + (dx / 2)) + qx,
            qy1 = (d.source.y + (dy / 2)) + qy;
            return "M"+d.source.x+" "+d.source.y+" C" + d.source.x + " " + d.source.y + " " + qx1 + " " + qy1 + " " + d.target.x + " " + d.target.y;
        });

        //update links position
        link
        .attr("x1", function(d) { return d.source.x + 5; })
        .attr("y1", function(d) { return d.source.y + 5; })
        .attr("x2", function(d) { return d.target.x + 5; })
        .attr("y2", function(d) { return d.target.y + 5; });

        //correct/rotate direction of text as a function of nodes' position
        edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();

                rx = bbox.x + bbox.width / 2;
                ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });

}//End Ticked function

}//End Update fn

