

var id = 0;
var noData = <?php echo $noData?>+"";
if(noData == "1")
{
// there are no enough files to run Dataart, allow user to regenerate them
alertify.set({ labels: { ok: "Yes", cancel: "No" } });
									alertify.confirm("There is no enough data to run Dataart. Would you like to regenrate data now?", function (e) {
										if (e) {
										    regenerateData('<?php echo $envname?>');
											alertify.success("You've clicked 'regenerate'");
										} else {
											alertify.error("You've clicked 'Cancel'");
											window.location = "http://ci-dmm-win/vis/dataart.php";
										}
									});
}
else
{
	/// Sounds

   //birds
   var bird1Sound = new Howl({urls: ['sounds/bird1.ogg']});
   var bird2Sound = new Howl({urls: ['sounds/bird2.ogg']});
   var bird3Sound = new Howl({urls: ['sounds/bird3.ogg']});
   var crows1Sound = new Howl({urls: ['sounds/crows1.ogg']});

   //musical notes
   var do1Sound = new Howl({urls: ['sounds/do1.ogg']});
   var reSound = new Howl({urls: ['sounds/re.ogg']});
   var meSound = new Howl({urls: ['sounds/me.ogg']});
   var faSound = new Howl({urls: ['sounds/fa.ogg']});
   var solSound = new Howl({urls: ['sounds/sol.ogg']});
   var laSound = new Howl({urls: ['sounds/la.ogg']});
   var siSound = new Howl({urls: ['sounds/si.ogg']});
   var do2Sound = new Howl({urls: ['sounds/do2.ogg']});

   //chords
   var chord4nSound = new Howl({urls: ['sounds/chord-4notes.ogg']});
   var chord3nSound = new Howl({urls: ['sounds/chord-3notes.ogg']});
   var chordnSound = new Howl({urls: ['sounds/chord-variable.ogg']});
   var universeSound = new Howl({urls: ['sounds/universe.ogg']});
   var earthSound = new Howl({urls: ['sounds/earth.ogg']});

   var mute = true;
   Howler.mute();

//parse dependencies file

var depFileName = "<?php echo $path.$depFile; ?>"+"?id="+Math.random();
d3.csv(depFileName, function(error,rawData){
if (error) {
		alert("File '"+depFileName+"' not found. Can't load data.");
		throw error;
		}
else
{

/// Run Datamart
//note: the random number is added to prevent the browser from using a cashed copy of the file
var batchFileName = "<?php echo $path.$batchFile; ?>"+"?id="+Math.random();
var dynFileName = "<?php echo $path.$dynFile; ?>"+"?id="+Math.random();
var auditFileName = "<?php echo $path.$auditFile; ?>"+"?id="+Math.random();
var viewerFileName = "<?php echo $path.$viewerFile; ?>"+"?id="+Math.random();
var dbcountFileName = "<?php echo $path.$dbcountFile; ?>"+"?id="+Math.random();
var dblodFileName = "<?php echo $path.$dblodFile; ?>"+"?id="+Math.random();


var updatedDate = "<?php echo $updated; ?>";


var margin = {top: 100, right: 5, bottom: 170, left: 5},
    width = 1450 - margin.left - margin.right,
    height = 900 - margin.bottom - margin.top;

var defaultCharge = -30;
var defaultlinkStrength = 0.5;

var currentObject = null;
var fPressed = false;
var currSel = 0;
var prevSel = 0;
var maxWeight = 0;
var checkWeight = true;
var dragging = false;
var prevNodeExplored = {name: "", classList:""};
var constrainedUniverse = true;
var force = 0;
var clickedElement = "";
var dependeciesExport = "";


var defaultSymboleSize = 16;
var maxUsage = 0;
var SymbScaleUsage = 0;
var SymbScaleUsageDM = 0;
var maxRealWeight = 0;
var maxUsageLOD = 0;


var circlePath = d3.svg.symbol().type("circle").size(function(d) {return (defaultSymboleSize * defaultSymboleSize) / 2;});
var crossPath = d3.svg.symbol().type("cross").size(function(d) {return (defaultSymboleSize * defaultSymboleSize) / 2;});
var trianglePath = d3.svg.symbol().type("triangle-up").size(function(d) {return (defaultSymboleSize * defaultSymboleSize) / 2;});
var diamondPath = d3.svg.symbol().type("diamond").size(function(d) {return (defaultSymboleSize * defaultSymboleSize) / 2;});



//foci for Y axis custom forces
var foci = { "PROCESSINGSCRIPTNAME": {x: 200, y: margin.top   			 ,color: "#DF6349"},
					    "BATCHNAME": {x: 200, y: margin.top+height*(1/9) ,color: "#F8B624"},
					 "GLOBALFILTER": {x: 200, y: margin.top+height*(2/9) ,color: "#C390D4"},
					       "Feeder": {x: 200, y: margin.top+height*(3/9) ,color: "#9DBFAF"},
				 "StoredProcedure": {x: 200, y: margin.top+height*(4/9) ,color: "#B3B02D"}	,
					   "Extraction": {x: 200, y: margin.top+height*(5/9) ,color: "#D88A8A"},
					  "LABELOFDATA": {x: 200, y: margin.top+height*(6/9) ,color: "#57A800"},
					  "SOURCETABLE": {x: 200, y: margin.top+height*(7/9) ,color: "#84D663"},
					   "SOURCETYPE": {x: 200, y: margin.top+height*(8/9) ,color: "#8CC6ED"},
						  "DYNVIEW": {x: 200, y: margin.top+height*(9/9) ,color: "#ED98E7"}
		};

//xNode	for X axis custom forces
var xNode = {
			  "Region-50%": { initialX : Math.ceil(width*0.25), varX: Math.ceil(width*0.25) },
			  "Region2":    { initialX : Math.ceil(width*0.43), varX: Math.ceil(width*0.43) },
			  "Region1" :   { initialX : Math.ceil(width*0.58),varX: Math.ceil(width*0.58) },
			  "Region+50%": { initialX : Math.ceil(width*0.73), varX:Math.ceil(width*0.73) },
			  "Region0" :   { initialX : Math.ceil(width*0.9), varX:Math.ceil(width*0.9) },
			};

//create svg canvas

var svg = d3.select("body").append("div").attr("class","drawingarea")
	.append("svg")
	.style('background',"#FAFAFA")
    .attr("width", width + margin.right + margin.left)
    .attr("height", 1500 + margin.top + margin.bottom)
	.on("mousedown",function(d){
		//differenciate a click on svg, from that on the brush (i.e element= rect)
		if(d3.event.srcElement.nodeName == "rect")
			clickedElement = "rect";
		else
			clickedElement = "svg";
	})
	.on("click", function(d){
					if(d3.event.target.id=="" && clickedElement == "svg")
					{
						//user clicked on the empty space (i.e not on a circle nor on brush)

						svg.selectAll(".node path").style("opacity",1)
						svg.selectAll(".node").selectAll("path:not(.explode").selectAll("path:not(.legend)").style("stroke","white"); //show all circles
						svg.selectAll(".explode").style("stroke","#F2E15E"); //put back yellow on exploded objects
						svg.selectAll(".node text").attr("visibility","hidden"); //hide all text
						svg.selectAll(".link").style("opacity",1).style("stroke","#C7C7C7").style("stroke-dasharray","1,1");; //show all lines
						//findNodes();
					}

					});


//tooltip

var tooltip = d3.select('body').append('div').attr("class","tooltip");




	var nodes = [];
	var links = [];
	var DynamicNodes = [];
	var DynamicLinks = [];
	var selectedTypes = [];
	var selectedNodes = [];
	var selectedLinks = [];
	var labelAnchors = [];
	var nodeList = []; 			//will temporarily store explored nodes upon SHIFT click on node x
	var linkList = []; 			//will temporarily store traversed links upon SHIFT click on node x
	var customForce = true;
	var enteringNodesNames = [];

	rawData.forEach(function(row) {

		var nbOfColumns = Object.keys(row).length;

		//Add a prefix to each object name so they remain unique across each row, and replace spaces by !
		if(row.PROCESSINGSCRIPTNAME.trim() != "")  row.PROCESSINGSCRIPTNAME = "PS-" +  row.PROCESSINGSCRIPTNAME.trim().split(' ').join(' '); //note:replacing spaces with empty char Alt+255
		if(row.BATCHNAME.trim() 			!= "") row.BATCHNAME = "Batch-" +  row.BATCHNAME.trim().split(' ').join(' ');
		if(row.GLOBALFILTER.trim() 			!= "") row.GLOBALFILTER = "GF-" +  row.GLOBALFILTER.trim().split(' ').join(' ');
		if(row.SINGLEOBJECTNAME.trim()	    != "") row.SINGLEOBJECTNAME = row.SINGLEOBJECTTYPE+"-" +  row.SINGLEOBJECTNAME.trim().split(' ').join(' ');
		if(row.SOURCETABLE.trim() 	!= "") row.SOURCETABLE = "SourceTable-" +  row.SOURCETABLE.trim().split(' ').join(' ');
		if(row.SOURCETYPE.trim() 		!= "") row.SOURCETYPE = "SourceType-" +  row.SOURCETYPE.trim().split(' ').join(' ');
		if(row.DYNVIEW.trim() 		 	!= "") row.DYNVIEW = "DynView-" +  row.DYNVIEW.trim().split(' ').join(' ');

		//create unique links
		for(var i=0; i < nbOfColumns-1; i++)
		{
		if(Object.keys(row)[i].trim() === "SINGLEOBJECTTYPE" || row[Object.keys(row)[i]].trim() === "" || row[Object.keys(row)[i+1]].trim() === "") continue;
		else if(Object.keys(row)[i+1] === "GLOBALFILTER")
			links[row[Object.keys(row)[i]].trim()+row[Object.keys(row)[i+2]].trim()] =
					{
					name : row[Object.keys(row)[i]].trim()+row[Object.keys(row)[i+2]].trim(),
					source: row[Object.keys(row)[i]].trim(),
					target: row[Object.keys(row)[i+2]].trim(),
					stype:Object.keys(row)[i],
					ttype:Object.keys(row)[i+2],
					force: true
					};
		else if(Object.keys(row)[i+1] === "SINGLEOBJECTTYPE")
			links[row[Object.keys(row)[i]].trim()+row[Object.keys(row)[i+2]].trim()] =
					{
					name : row[Object.keys(row)[i]].trim()+row[Object.keys(row)[i+2]].trim(),
					source: row[Object.keys(row)[i]].trim(),
					target: row[Object.keys(row)[i+2]].trim(),
					stype:Object.keys(row)[i],
					ttype:row[Object.keys(row)[i+1]],
					force: true
					};
		else if(Object.keys(row)[i+1] === "SOURCETABLE")
			links[row[Object.keys(row)[i]].trim()+row[Object.keys(row)[i+1]].trim()] =
					{
					name : row[Object.keys(row)[i]].trim()+row[Object.keys(row)[i+1]].trim(),
					source: row[Object.keys(row)[i]].trim(),
					target: row[Object.keys(row)[i+1]].trim(),
					stype:row[Object.keys(row)[i-1]],
					ttype:Object.keys(row)[i+1],
					force: true
					};
		else
			links[row[Object.keys(row)[i]].trim()+row[Object.keys(row)[i+1]].trim()] =
					{
					name: row[Object.keys(row)[i]].trim()+row[Object.keys(row)[i+1]].trim(),
					source: row[Object.keys(row)[i]].trim(),
					target: row[Object.keys(row)[i+1]].trim(),
					stype:Object.keys(row)[i],
					ttype:Object.keys(row)[i+1],
					force: true
					};
		}

	});


//read label of data and append their links with Datamart tables
d3.csv(dblodFileName, function(error,rawDataLOD){
if (error) {
		alert("File '"+dblodFileName+"' not found. Can't load data.");
		throw error;
		}
else
{
			rawDataLOD.forEach(function(lodRow,i)
			{

				//Add a prefix to each object name so they remain unique across each row, and replace spaces by !
				if(lodRow.TABLENAME.trim() != "")  lodRow.TABLENAME = "SourceTable-" +  lodRow.TABLENAME.trim().split(' ').join(' '); //note:replacing spaces with empty char Alt+255
					else lodRow.TABLENAME = "SourceTable-NoTabelNameFound";
				if(lodRow.LABELOFDATA.trim() != "") lodRow.LABELOFDATA = "LabelOfData-" +  lodRow.LABELOFDATA.trim().split(' ').join(' ');
					else lodRow.LABELOFDATA = "LabelOfData-NoLabelFound";

				// create unique links
				links[lodRow.TABLENAME+lodRow.LABELOFDATA] =
							{
							name: lodRow.TABLENAME+lodRow.LABELOFDATA,
							source: lodRow.TABLENAME,
							target: lodRow.LABELOFDATA,
							stype: "SOURCETABLE",
							ttype: "LABELOFDATA",
							force: true
							};
			});



	// Compute the distinct nodes from the links.
	d3.values(links).forEach(function(link,i) {
	  link.source = nodes[link.source] || (nodes[link.source] = {name: link.source, type: link.stype ,force : true,radius: defaultSymboleSize/2,realWeight:0,usage: 0,dbusage: 0,tableSize: 0,showUsage: false,depLevel:setDepLevel(link.stype)});
	  link.target = nodes[link.target] || (nodes[link.target] = {name: link.target, type: link.ttype ,force : true,radius: defaultSymboleSize/2,realWeight:0,usage: 0,dbusage: 0,tableSize: 0,showUsage: false,depLevel:setDepLevel(link.ttype)});
	});


//console.log(nodes);
//console.log(links);


// map usgae/audit of Feeders,Extractions & Bathces to their nodes
d3.csv(auditFileName, function(error,rawDataAudit){
	if (error) {
			alert("File '"+auditFileName+"' not found. Can't load data.");
			throw error;
			}
	else
	{
		rawDataAudit.forEach(function(auditRow,i)
		{
			if(i == 0 ) maxUsage = auditRow.COUNTOFRUNS;
			//var nbOfColumns = Object.keys(auditRow).length;
			var name = "";
				if(auditRow.TYPE.trim() == "BF" || auditRow.TYPE.trim() == "BE" || auditRow.TYPE.trim() == "BP")  { name = "Batch-"+auditRow.NAME.trim(); if(nodes[name]) nodes[name].usage = parseInt(auditRow.COUNTOFRUNS); }
				else if(auditRow.TYPE.trim() == "F") 						{ name = "Feeder-"+auditRow.NAME.trim(); if(nodes[name]) nodes[name].usage = parseInt(auditRow.COUNTOFRUNS); }
				else if(auditRow.TYPE.trim() == "E") 						{ name = "Extraction-"+auditRow.NAME.trim(); if(nodes[name]) nodes[name].usage = parseInt(auditRow.COUNTOFRUNS); }
				else if(auditRow.TYPE.trim() == "P") 						{ name = "StoredProcedure-"+auditRow.NAME.trim(); if(nodes[name]) nodes[name].usage = parseInt(auditRow.COUNTOFRUNS); }
				else n.usage = 0;

		});

	SymbScaleUsage = d3.scale.linear()
						.domain([0,maxUsage])
						.range([0.5,3.5]);
	}
});



// map datamart row count to Datamart table
d3.csv(dbcountFileName, function(error,rawDbCount){
	if (error) {
			alert("File '"+dbcountFileName+"' not found. Can't load data.");
			throw error;
			}
	else
	{
		rawDbCount.forEach(function(dbCountRow,i)
		{
			if(i == 0 ) maxDMUsage = dbCountRow.DB_COUNTROW;

			var name ="SourceTable-"+dbCountRow.TABLENAME.trim();
		    if(nodes[name])
				{
					nodes[name].dbusage = parseInt(dbCountRow.DB_COUNTROW);
					nodes[name].tableSize = parseInt(dbCountRow.SIZEKB);
				}

		});

	SymbScaleUsageDM = d3.scale.linear()
						.domain([0,maxDMUsage])
						.range([0.5,3.5]);
	}
});

// map label of data row count to labels of data
d3.csv(dblodFileName, function(error,rowLodCount){
	if (error) {
			alert("File '"+dblodFileName+"' not found. Can't load data.");
			throw error;
			}
	else
	{
		rowLodCount.forEach(function(lodRow,i)
		{
			if(i == 0 ) maxUsageLOD = lodRow.DATASETROWCOUNT;

			var name ="LabelOfData-"+lodRow.LABELOFDATA.trim();
		    if(nodes[name])
				{
					nodes[name].dbusage += parseInt(lodRow.DATASETROWCOUNT);

					if(nodes[name].dbusage > maxUsageLOD) maxUsageLOD = nodes[name].dbusage; //update maximum based on running aggregration

					nodes[name].tableSize += parseInt(lodRow.DATASETCOUNT);
				}


		});


	SymbScaleUsageLOD = d3.scale.linear()
							.domain([0,maxUsageLOD])
							.range([0.5,3.5]);
	}
});



// compute real weight of nodes (i.e total count of links to/from node regardless if they are visible or not)

	d3.values(nodes).forEach(function(n){

		//get max real weight
		var lcount=0;
		d3.values(links).forEach(function(l){
		if(l.source.name == n.name || l.target.name == n.name) lcount++;
		});
		n.realWeight = lcount;
		//get maximum real weight to use it in SymbScale
		if(lcount > maxRealWeight) maxRealWeight = lcount;
	});

	var SymbScale = d3.scale.linear()
						.domain([0,maxRealWeight])
						.range([0.5,3.5]);


var totalLinks = d3.values(links).length;
var totalNodes = d3.values(nodes).length;
updateEnvStats('<?php echo $envname?>',totalNodes,totalLinks);

if(lightMode==true)
{
	d3.select("#targetNode").attr("placeholder","Dig objects by name");
	d3.select("#batchSearchInput").attr("placeholder","Dig by flags & filters");
	d3.select("#dynSearchInput").attr("placeholder","Dig by flags & filters");
}

force = d3.layout.force()
    .nodes(DynamicNodes)
	.links(DynamicLinks)
	.charge(defaultCharge) 		         //A negative value results in node repulsion, while a positive value results in node attraction.
    //.chargeDistance(50)
	//.linkDistance(100)
	.linkStrength(defaultlinkStrength) 	//the strength (rigidity) of links to the specified value in the range [0,1]
	//.friction(0.9) 					//a value of 1 corresponds to a frictionless environment, while a value of 0 freezes all particles in place.
	.gravity(0.09)
	//.alpha(0.1)
	//.theta(1)
    .size([width, height+(height*0.2)])
    .on("tick", tick);

//repulsion control
d3.select("input[name=repulsion]").on("change", function()
		{
		console.log("Repulsion= " + this.value);
	    if(this.value == 250)
			force.chargeDistance(width*height);
		else
			force.chargeDistance(this.value);



force.start();

  });

//repulsion control
d3.select("input[name=verticalslider]").on("change", function()
		{
		console.log("Vertical slider = " + this.value);
		resizeSvg(this.value);
  });

d3.select("body")
    .on("keydown", function() {

	//avoid picking special keystrokes if focus is on search fields
	if($("#batchSearchInput").is(":focus") == false && $("#dynSearchInput").is(":focus") == false)
	{
	//console.log(d3.event.keyCode);
         if(d3.event.keyCode == 70) //F is clicked ==> release the node (i.e set its class ti float so it is attracted by foci
			{
			fPressed = true;
			var d = force.nodes().filter(function(N){ return N.name == currentObject.name })[0];
			d.fixed = false;
			d3.select("#" + esc(d.name)).classed("fixed",false).classed("float",true);
			updateShape(d.name);

			force.alpha(0.03);
			}
		if(d3.event.keyCode == 71) //G is clicked ==> Go to row in the results table
			{
			var d = force.nodes().filter(function(N){ return N.name == currentObject.name  })[0];
			var row = d.name.split("-");
			scrollToAnchor(row[1]);
			}
		if(d3.event.keyCode == 83) //S is clicked ==> copy node name to batch or dyn search and run the search
			{
			var d = force.nodes().filter(function(N){ return N.name == currentObject.name  })[0];
			var row = d.name.split("-");

				if(row[0] == "Batch")
				{
				$('#batchSearchInput').val('BATCHNAME="'+row[1]+'"');
				submitBatch();
				}
				else if (row[0] == "SourceType")
				{
				var field = row[1].split(":");
				$('#dynSearchInput').val('TABLENAME='+field[0]+'"');
				submitDyn();
				}
			}
	}
    });

//region vertical lines and handling
/**/
var groupAll = d3.behavior.drag()
        .origin(Object)
        .on("drag", function(d, i) {
        var child = this;
		var id = d3.select(this).attr("id");
        var move = d3.transform(child.getAttribute("transform")).translate;
        var x = d3.event.dx + move[0];
        var y = d3.event.dy + move[1];
        d3.select(child).attr("transform", "translate(" + x + ")");
		xNode[id].varX = xNode[id].initialX+move[0];
		force.start();
        });

for (var n in xNode)
{

var label = "";
switch(n){
	case "Region-50%":label = "2 < Dependencies < "+Math.ceil(maxRealWeight*0.5) ; break;
	case "Region2":   label = "Dependencies = 2"; break;
	case "Region1" :  label = "Dependencies = 1"; break;
	case "Region+50%":label = "Dependencies > "+Math.ceil(maxRealWeight*0.5); break;
	case "Region0" :  label = "Dependencies : none"; break;
}

var vregion = svg.append("g")
					.attr("id",n)
					.attr("class","forceRegion")
					.style("visibility","hidden")
					.call(groupAll);
	vregion.append("line")
				 .attr("class","verticalline")
				 .attr("x1", xNode[n].initialX)
				 .attr("y1", 20)
				 .attr("x2",xNode[n].initialX)
				 .attr("y2",height + margin.top);
    vregion.append("rect")
				.attr("class","verticalbox")
				.attr("width",120)
				.attr("height",20)
				.attr("x", xNode[n].initialX-60)
				.attr("y", 27);
	vregion.append("text")
				.attr("class","verticaltext")
				.attr("x", xNode[n].initialX)
				.attr("y", 38)
				.text(label)




}

for (var n in foci)
{

var hregion = svg.append("g")
					.attr("class","forceRegion")
					.style("visibility","hidden")

	hregion.append("line")
				 .attr("class","horizontalline")
				 .attr("x1",200)
				 .attr("y1", foci[n].y)
				 .attr("x2",width)
				 .attr("y2", foci[n].y)
}


var drag = force.drag()
    .on("dragstart",function(d){currentObject = d;})
	.on("drag",dragmove)
	.on("dragend", dragend);

var linkG = svg.append("g"),
    nodeG = svg.append("g");

var node = nodeG.selectAll(".node"),
    link = linkG.selectAll(".link");

function findIndexByName(arry,value)
{
var indexes = [];
indexes = arry.map(function(obj, ind) {
    if(obj.name == value) {
        return ind;
    }
}).filter(isFinite)

if (indexes.length == 0)
  return -1;
  else return indexes;

}


function start() {

//filter nodes
var nodesToDelete = [];
	for(var key in selectedNodes) {
	var keyFound = findIndexByName(DynamicNodes,selectedNodes[key].name);
	if(keyFound < 0)
		DynamicNodes.push(selectedNodes[key]);
	}

for(var key in DynamicNodes) {
	var keyFound = findIndexByName(selectedNodes,DynamicNodes[key].name);
	if(keyFound < 0)
		nodesToDelete.push(DynamicNodes[key].name);
	}

for(var n in nodesToDelete){
DynamicNodes.splice(findIndexByName(DynamicNodes,nodesToDelete[n]),1);
}
//filter links
var linksToDelete = [];
	for(var key in selectedLinks) {
	var keyFound = findIndexByName(DynamicLinks,selectedLinks[key].name);
	if(keyFound < 0)
		DynamicLinks.push(selectedLinks[key]);
	}

for(var key in DynamicLinks) {
	var keyFound = findIndexByName(selectedLinks,DynamicLinks[key].name);
	if(keyFound < 0)
		linksToDelete.push(DynamicLinks[key].name);
	}

for(var n in linksToDelete){
DynamicLinks.splice(findIndexByName(DynamicLinks,linksToDelete[n]),1);
}


//check if user shift-clicked a node i.e if nodeList has any item inside
if(nodeList.length > 0)
{

//compare content of DynamicNodes & nodeList, DynamicLinks & linkList
	for(var n in nodeList)
	{
		//check for exiting nodes, if not found, then add node  as-is to DynamicNodes
		var nodeFound = DynamicNodes.filter(function(d){ return nodeList[n].name == d.name });
		if(nodeFound.length == 0)
			DynamicNodes.push(nodeList[n]);
	}

	for(var n in linkList)
	{
		//check for exiting links,if not found, then add link as-is to DynamicLinks
		var linkFound = DynamicLinks.filter(function(d){ return (linkList[n].source.name == d.source.name && linkList[n].target.name == d.target.name) || (linkList[n].source.name == d.target.name && linkList[n].target.name == d.source.name)  });
		if(linkFound.length == 0)
			DynamicLinks.push(linkList[n]);
	}


//clean temp array for next time usage
dependeciesExport = "dependencyId,Object_A,A_NbDependencies,A_Usage(runs/rows),,Object_B,B_NbDependencies,B_Usage(runs/rows)\r\n"; //clear text buffer that will hold the source/target nodes names and later store them in clipboard

var depExport = d3.values(linkList);
var n =1;
for(var i in depExport)
{
var usageA=(depExport[i].stype.indexOf("LABELOFDATA") != -1 || depExport[i].stype.indexOf("SOURCETABLE") != -1  ? depExport[i].source.dbusage : (depExport[i].source.depLevel <= 2 || depExport[i].source.depLevel == 6  ? "-": depExport[i].source.usage));
var usageB=(depExport[i].ttype.indexOf("LABELOFDATA") != -1 || depExport[i].ttype.indexOf("SOURCETABLE") != -1  ? depExport[i].target.dbusage : (depExport[i].target.depLevel <= 2 || depExport[i].target.depLevel == 6  ? "-": depExport[i].target.usage));

dependeciesExport+= (n)+","+ depExport[i].source.name +","+depExport[i].source.realWeight + "," +usageA +",<-->," +depExport[i].target.name + ","+depExport[i].target.realWeight+"," +usageB +"\r\n";
n++;
}
copyToClipboard(dependeciesExport); //copy

depExport.splice(0,depExport.length);
nodeList.splice(0,nodeList.length);
linkList.splice(0,linkList.length);

}


//draw links first

link = link.data(force.links(),function(d){return d.name;});

//enter
	link.enter().insert("line",".node")
		.attr("class", function(d){ return ["link", d.source.name, d.target.name].join(" "); })

//update links
	link.attr("class", function(d){ return ["link", d.source.name, d.target.name].join(" "); })

//delete links
	link.exit().remove();



//draw nodes second

node = svg.selectAll(".node").data(force.nodes(),function(d){ return d.name;});

//update
node.selectAll("path")
			.attr("id",function(d){ return d.name})
			//.attr("fill","blue");
			.attr("transform",function(d){
				 if(nodeSizeMode ==  "dependencies") return "scale(" + SymbScale(d.realWeight) + "," +  SymbScale(d.realWeight) +")";
				 if(nodeSizeMode ==  "usage")
					if(d.type == "SOURCETABLE") return "scale(" + SymbScaleUsageDM(d.dbusage) + "," +  SymbScaleUsageDM(d.dbusage) +")"
					else if(d.type == "LABELOFDATA") return "scale(" + SymbScaleUsageLOD(d.dbusage) + "," +  SymbScaleUsageLOD(d.dbusage) +")"
					else return "scale(" + SymbScaleUsage(d.usage) + "," +  SymbScaleUsage(d.usage) +")"
				})

node.selectAll("text")
			.attr("id",function(d){ return "text-"+d.name})
			.text(function(d) {return d.name; });

//enter node


var enterNode =	node.enter().append("g")
							.attr("class","node")
							.style("visibility","visible")
							.call(drag);

//clean enteringNodesNames
enteringNodesNames.splice(0,enteringNodesNames.length);

//enter circle
	enterNode.append("path").attr('d',circlePath)
	.attr("transform",function(d){
				 if(nodeSizeMode ==  "dependencies") return "scale(" + SymbScale(d.realWeight) + "," +  SymbScale(d.realWeight) +")";
				 if(nodeSizeMode ==  "usage")
					if(d.type == "SOURCETABLE") return "scale(" + SymbScaleUsageDM(d.dbusage) + "," +  SymbScaleUsageDM(d.dbusage) +")"
					else if(d.type == "LABELOFDATA") return "scale(" + SymbScaleUsageLOD(d.dbusage) + "," +  SymbScaleUsageLOD(d.dbusage) +")"
					else return "scale(" + SymbScaleUsage(d.usage) + "," +  SymbScaleUsage(d.usage) +")"
				})
				.attr("id",function(d){ enteringNodesNames.push(d.name); return d.name})
				.classed("float foci direct",true)
				.attr("fill", function(d) { return foci[d.type].color; })
				.attr("style","stroke:white;")
				//.attr("fill","red")
				.on('mouseover', function(d) {
						var usg;
							force.alpha(0); //stop simulation when clicking a node's circle
							tooltip.transition().duration(100)
							 .style('opacity', .9)
							 if(d.type == "BATCHNAME" || d.type == "Feeder" || d.type == "Extraction" || d.type == "StoredProcedure")
								usg = ", Runs: "+d.usage;
							 else if (d.type == "SOURCETABLE" )
							    usg = ", Rows: "+d.dbusage+", Aprox. size: "+ d.tableSize+ " kb";
							else if (d.type == "LABELOFDATA" )
							    usg = ", Rows: "+d.dbusage+", datasets: "+ d.tableSize;
							else
								usg = d.usage;
							tooltip.html(d.name + " (Dep:" +d.weight + "/"+d.realWeight+""+usg+")")
							 .style('left', (d3.event.pageX + 10) + 'px')
							 .style('top',  (d3.event.pageY - 10) + 'px')
				})
				.on('mouseout', function(d) {
						 force.alpha(0.01); //stop simulation when clicking a node's circle
						 tooltip.transition().duration(100).style('opacity', 0);


				}).on("click", function(d){
						var id = d.name;

						//store clicked objects names in clipboard

						var classList = d3.select("#" + esc(id)).attr("class");
						if(classList.indexOf("selectedNode") != -1)
							{
							svg.select("#"+esc(id)).classed("selectedNode",false);
							svg.select("#" + esc(d.name)).style("opacity",1).style("stroke","white");
							}
						else
						    {
							svg.select("#"+esc(id)).classed("selectedNode",true);
							svg.select("#" + esc(d.name)).style("opacity",1).style("stroke","red");
							}
							var classList = d3.select("#" + esc(id)).attr("class");
						console.log(classList);

						//select table row if any
						var fields = id.split("-");
						d3.selectAll(".tableRow").style("background-color","#f1f1f1");
						if(fields[0]=="Batch")
							d3.select("#"+esc(fields[1])).style("background-color","#F8B624"); //batch
						else
							{
							 var f = fields[1].split(":");
							 //highligh this dynamic table,even if it exists in many dyn sets
							 d3.select("#"+esc(f[0]+"-Murex")).style("background-color","#8CC6ED"); 			//Dyn
							 d3.select("#"+esc(f[0]+"-User")).style("background-color","#8CC6ED"); 				//Dyn
							 d3.select("#"+esc(f[0]+"-User additional")).style("background-color","#8CC6ED"); 	//Dyn
							 d3.select("#"+esc(f[0]+"-Murex additional")).style("background-color","#8CC6ED"); 	//Dyn
							}



						if (d3.event.ctrlKey)
						{ //if shift + click ==> explore node/links tree in "branchOnly" i.e default
							console.log("Ctrl+Click");

							exploreTree(d);

							//prompt user before showing new nodes, only if new nodes count is at least 10% more that the total nodes count
							if(nodeList.length > d3.values(nodes).length*0.1)
							{
								if (confirm(nodeList.length + ' nodes were found in direct route, are you sure you want to show them?')) {
										d3.select("#" + esc(id)).classed("short",true).classed("long",false).classed("direct",false);
										updateShape(id);
										start();
								} else {
									// undo
									nodeList.splice(0,nodeList.length);
									linkList.splice(0,linkList.length);
								}

							}
							else{
							d3.select("#" + esc(id)).classed("short",true).classed("long",false).classed("direct",false);
							updateShape(id);

							playChordSound();

							//if extraction is Ctrl+clicked then display its Viewer dependencies in table below
							if(d.name.indexOf("Extraction-") == 0)
							{

								var fields = d.name.split(":");
								findViewers(fields[0].substring(11, fields[0].length));
								//console.log(fields[0].substring(11, fields[0].length));
							}
							svg.select("#"+esc(id)).classed("selectedNode",true);
							svg.select("#" + esc(d.name)).style("opacity",1).style("stroke","red");
							start();
							}



						}
						else if(d3.event.shiftKey)
						{ //if shift + click ==> explore node/links tree in "leaf" mode
							console.log("Shift+Click");

							exploreTree(d,"leaf");



							//prompt user before showing new nodes, only if new nodes count is at least 10% more that the total nodes count
							if(nodeList.length > d3.values(nodes).length*0.1)
							{

								if (confirm(nodeList.length + ' nodes were found in direct & adjacent route, are you sure you want to show them?')) {
										d3.select("#" + esc(id)).classed("short",false).classed("long",true).classed("direct",false);
										updateShape(id);
										start();
									} else {
										// undo
										nodeList.splice(0,nodeList.length);
										linkList.splice(0,linkList.length);
									}

							}
							else{
							d3.select("#" + esc(id)).classed("short",false).classed("long",true).classed("direct",false);
							updateShape(id);

							playChordSound();

							//if extraction is Ctrl+clicked then display its Viewer dependencies in table below
							if(d.name.indexOf("Extraction-") == 0)
							{

								var fields = d.name.split(":");
								findViewers(fields[0].substring(11, fields[0].length));
								//console.log(fields[0].substring(11, fields[0].length));
							}
							svg.select("#"+esc(id)).classed("selectedNode",true);
							svg.select("#" + esc(d.name)).style("opacity",1).style("stroke","red");
							start();
							}


						}
						else if(d3.event.altKey)
						{ //if alt + click ==> toggle neighbouring node force behavior, and links' linkstrenghth
							console.log("Alt+Click");

							var countExploded = 0;


							if(d.force == true)
							{
								customForce = false;
								d3.select("#" + esc(d.name)).classed("explode",true).classed("foci",false);
								updateShape(d.name);

								d3.select("#repulsion").style("visibility","visible"); //show the repulsion slider input
								universeSound.play();
							}
							else
							{

								//d3.select(".explode").each(function(){countExploded++;});
								customForce = true;
								d3.select("#" + esc(d.name)).classed("foci",true).classed("explode",false);
								updateShape(d.name);

								var countExploded = 0;
								var a = d3.selectAll(".explode").each(function(d){countExploded++});
								if(countExploded <= 0) d3.select("#repulsion").style("visibility","hidden"); //hide the repulsion slider input, only if no other node is exploded
								earthSound.play();

							}




							//for each direct link toggle link force flag (true = nodes will change Linkstrength to default, false = links will loose a significant LinkStrength)
							var directLinks = force.links().filter(function(L){return d.name == L.target.name || d.name == L.source.name });
							force.links().forEach(function(L){
								if(d.name == L.target.name || d.name == L.source.name)
								{
									L.force = customForce;
								}
							});

							//for each neighbouring node, toggle force flag , (true = nodes will accumulate around vertical lines forces, false = nodes will gain a significant charge)

							for(var k in directLinks)
							{
								if(d.name == directLinks[k].source.name)
								{
										force.nodes().forEach(function(N){
										if(N.name == directLinks[k].target.name)
										{

											N.force = customForce;

										}
									});
								}
								else
								{
									force.nodes().forEach(function(N){
										if(N.name == directLinks[k].source.name)
										{
											N.force = customForce;

										}
									});
								}

							}

							force.charge(
								function(N){
									 //for selected node
									if(N.name == d.name && customForce == false) { N.force = customForce; return -500; }
									else if(N.name == d.name && customForce == true) { N.force = customForce;return defaultCharge;}
									else
									{//for the rest of neighbouring nodes
										if(N.force == false)
											return -500;
										else
											return defaultCharge
									}


								});

							force.linkStrength(
								function(N){

									if(N.force == false)
										return 0.5;
									else
										return defaultlinkStrength
								});


							force.start();

							//console.log("force nodes&links");
							//console.log(force.nodes());
							//console.log(force.links());
						}
						else
						{
						//check if node is being Selected OR deselected
						var classList = d3.select("#" + esc(id)).attr("class");
							if(classList.indexOf("selectedNode") != -1)
							{//being selected

								//single click with no modifier ==> highlight node and direct dependencies
								svg.selectAll(".node path:not(#" + esc(d.name) + ")").style("opacity",0.2);   	//hide all circles except the selected on
								svg.selectAll(".link:not(." + esc(d.name) + ")").style("opacity",0.2)				//hide all links except the ones connected to the selected circles
								svg.selectAll(".text:not(#text-" + esc(d.name) + ")").attr("visibility","hidden");  //hide all text except the ones connected to the selected circles

								svg.selectAll("." + esc(d.name)).style("opacity",1).style("stroke-dasharray","0,0").transition().duration(500).style("stroke","red"); //highlight all links connected to the selected circle

								svg.selectAll("." + esc(d.name)).each(function(d,i) {
								var classes = d3.select(this).attr("class").split(" ");
								for(var k=0; k<classes.length;k++)
								 {
								  svg.select("#" + esc(classes[k])).transition().duration(500).style("opacity",1); 				 // fade in connected nodes
								  svg.select("#text-" + esc(classes[k])).transition().duration(500).attr("visibility","visible"); //fad in text of connected

								 }

								});

								//play selected node sounds
								playNodeSound(d.type);
							}
							else
							{//being deselected
								svg.selectAll(".node path").style("opacity",1)
								svg.selectAll(".node").selectAll("path:not(.explode").selectAll("path:not(.legend)").style("stroke","white"); //show all circles
								svg.selectAll(".explode").style("stroke","#F2E15E"); //put back yellow on exploded objects
								svg.selectAll(".node text").attr("visibility","hidden"); //hide all text
								svg.selectAll(".link").style("opacity",1).style("stroke","#C7C7C7").style("stroke-dasharray","1,1");; //show all lines
							}
						appendToClipboard(); //append the sequence of selected node to clipboard (node with class selectedNode)
						}

			});

	//Enter text: add text but keept it hidden, untill user clicks on the node
	enterNode.append("text")
		.attr("class", "text")
		.attr("id",function(d){ return "text-"+d.name})
		.attr("x", function(d) {return 10; })
		.attr("y", function(d) {return 5; })
		.attr("visibility","hidden")
		.text(function(d) {  return d.name; });


//delete nodes
node.exit().remove();

//reset the charge (to default) and position(to fixed = false) and force (to true) of all entering nodes. (for existing nodes, reapply the existent charge)
force.charge(function(N){
						if ( enteringNodesNames.indexOf(N.name) != -1)
							{
								N.fixed = false;
								//reapply universe mode
								if(constrainedUniverse == true)
								{
									N.force = true;
									return defaultCharge
								}
								else
								{
									N.force = false;
									return -500
								}
							}
						else{
							if(N.force == false)
								return -500;
							else
								return defaultCharge
							}
						});

force.start();

//reset the charge (to default) and position(to fixed = false) and froce (to true) of all entering nodes


//compute max weight (this can be done here only because the force layout has been started since it depends on "weight" which is a d3 computed field)
checkWeight = true;
	if(checkWeight)
	{
		maxWeight = 0;
		force.nodes().forEach(function(d){
			if(d.weight > maxWeight) maxWeight = d.weight;
			});

		checkWeight = false;
	}

//findNodes(); //to dynamically search for nodes matching user input(if any)


}

function dragmove(d) {

	if(fPressed == false)
	{
		d.fixed = true;
		d3.select("#" + esc(d.name)).classed("fixed",true).classed("float",false);
		//findNodes();
	}
	else fPressed = false;


}

function dragend(d)
{
//force.alpha(0);
updateShape(d.name);

}


function tick(e) {

  //collision detection parameters
  var q = d3.geom.quadtree(DynamicNodes),
      i = 0,
      n = DynamicNodes.length;

  while (++i < n) q.visit(collide(DynamicNodes[i]));

//custom forces scaler
var k = .6 * e.alpha;

// Push nodes toward their designated foci (depending on their type and weight).
force.nodes().forEach(function(o) {


	if(o.force == true)
	{
		//apply custom force: this vertically based on the "type" of node
		 o.y += (foci[o.type].y - o.y) * k;

		//apply custom force: this horizontally based on the weight of node, push them into one of 2 regions (20% of width, or 80% of width)
		if(maxWeight > 0)
		{
			 if(o.weight == 0 )
			 {
				o.x += (xNode["Region0"].varX - o.x) * k;
			 }
			 else  if(o.weight == 1 )
			 {
				o.x += (xNode["Region1"].varX - o.x) * k;
			 }
			 else if(o.weight == 2 )
			 {
				o.x += (xNode["Region2"].varX - o.x) * k;
			 }
			 else if( o.weight >= Math.ceil(maxWeight*0.5) )
			 {
				o.x += (xNode["Region+50%"].varX  - o.x) * k;
			 }
			 else if( o.weight > 2 && o.weight < Math.ceil(maxWeight*0.5))
			 {
				o.x += (xNode["Region-50%"].varX  - o.x) * k;
			 }

		 }
	}
});

  node.attr("transform", function(d) { return "translate(" + d.x + "," +d.y+ ")"; });

  link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

}

//anti collision
function collide(node) {
  var r = node.radius + 16,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}

// info

 d3.select("svg").append("text")
    .attr("id","searchResult")
	.attr("transform","translate(5,70)");


 d3.select("svg").append("text")
    .attr("class","stats")
    .attr("transform","translate(3,17)");

d3.select("#loading").style("visibility","hidden");
d3.select(".stats").text("Showing objects: 0 / "+totalNodes+", dependencies: 0 / " +totalLinks + ", snapshot date: " +updatedDate);


 var nodeSizeMode =  "dependencies";
$("input[name=nodeSize]:radio").change(function ()
{
nodeSizeMode = $('input[name=nodeSize]:checked').val();
console.log("mode:"+nodeSizeMode + ", maxUsage:" + maxUsage + ", maxweight:" + maxRealWeight + ", max db usage:" +maxDMUsage + ", max db usage lod:" +maxUsageLOD);
start();
});


$("#showregions").change(function() {

        if(this.checked) d3.selectAll(".forceRegion").style("visibility","visible")
		else d3.selectAll(".forceRegion").style("visibility","hidden")
});

$("#universemode").change(function() {



		if(this.checked)
			{
				constrainedMode(false);
				d3.select("#showregionsdiv").style("visibility","hidden");
				document.getElementById("showregions").checked = false;
				d3.selectAll(".forceRegion").style("visibility","hidden")
				universeSound.play();
			}
        else
			{
				constrainedMode(true);
				d3.select("#showregionsdiv").style("visibility","visible");
				earthSound.play();
			}
});

$("#lightmode").change(function() {

		if(this.checked)
			{
				lightMode = true;
				selectedNodes.splice(0,selectedNodes.length);
				selectedLinks.splice(0,selectedLinks.length);
				d3.selectAll(".node").remove();
				d3.selectAll(".link").remove();
				d3.select("#targetNode").attr("placeholder","Dig objects by name");
				d3.select("#batchSearchInput").attr("placeholder","Dig by flags & filters");
				d3.select("#dynSearchInput").attr("placeholder","Dig by flags & filters");
				alertify.alert("You are now in 'Digger mode': In this mode  you dig for the information, it provides better performance on envs with massive configuration. You can only use the search boxes to find and interact with object.");

			}
        else
			{
				lightMode = false;
				selectedNodes.splice(0,selectedNodes.length);
				selectedLinks.splice(0,selectedLinks.length);
				d3.selectAll(".node").remove();
				d3.selectAll(".link").remove();
				d3.select("#targetNode").attr("placeholder","Locate objects by name");
				d3.select("#batchSearchInput").attr("placeholder","Search flags & filters");
				d3.select("#dynSearchInput").attr("placeholder","Search flags & filters");
				alertify.alert("'Digger mode' is now turned off!");
			}
});


$("#showorphansbox").change(function() {

	var trs = d3.selectAll(".notUsedInDatamart");


		if(this.checked)
			{
				trs.style("visibility","visible");
			}
        else
			{
				trs.style("visibility","hidden");
			}
});

$("#mutebutton").click(function(){
	 mute= !mute;

	 if(mute==true) {
		 Howler.mute();
		$("#mutebutton").attr("src","mute.png");
	 }
	 else
	 {
		Howler.unmute();
	    $("#mutebutton").attr("src","unmute.png");
	 }


})

paintBrush();
function paintBrush()
{
///////////////////////////////////////////////////////////////////////////////////// start brush/slider ///////////////////////////////////////::

//count occurrence of nodes based on their type, and append it as new object member in "foci" object

var countPS = 0,countGlobalFilters = 0,countBatch = 0,countFeeder = 0,countStoredProcedures = 0,countExtraction = 0,countLabelOfData = 0,countSourceTables = 0, countSourceTypes = 0, countDynViews = 0;
for(var i in nodes)
{
	if(nodes[i].type === "PROCESSINGSCRIPTNAME") { countPS++; foci[nodes[i].type].nodeCount = countPS; }
	if(nodes[i].type === "GLOBALFILTER") { countGlobalFilters++; foci[nodes[i].type].nodeCount = countGlobalFilters; }
	if(nodes[i].type === "BATCHNAME") { countBatch++; foci[nodes[i].type].nodeCount = countBatch; }
	if(nodes[i].type === "Feeder") { countFeeder++; foci[nodes[i].type].nodeCount = countFeeder; }
	if(nodes[i].type === "StoredProcedure") { countStoredProcedures++; foci[nodes[i].type].nodeCount = countStoredProcedures; }
	if(nodes[i].type === "Extraction") { countExtraction++; foci[nodes[i].type].nodeCount = countExtraction; }
	if(nodes[i].type === "LABELOFDATA") { countLabelOfData++; foci[nodes[i].type].nodeCount = countLabelOfData; }
	if(nodes[i].type === "SOURCETABLE") { countSourceTables++; foci[nodes[i].type].nodeCount = countSourceTables; }
	if(nodes[i].type === "SOURCETYPE") { countSourceTypes++; foci[nodes[i].type].nodeCount = countSourceTypes; }
	if(nodes[i].type === "DYNVIEW") { countDynViews++; foci[nodes[i].type].nodeCount = countDynViews; }

}


var yScale = d3.scale.ordinal()
    .domain(function() {
						var arry = [];
					    for(var key in foci){ arry.push(prettyName(key) + " (" +foci[key].nodeCount+ ")");} return arry;
					}())
    .range(function() {
						var arry = [];
					    for(var key in foci){ arry.push(foci[key].y);} return arry;
					}(),1);


svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(25, 0)")
    .call(d3.svg.axis().scale(yScale).tickSize(5).orient("right"));

d3.selectAll('.tick')
    .on('click',clickMe)

	function clickMe(d){

		var temp = d;
		if(d.indexOf("Processing") > -1) circleId = "PROCESSINGSCRIPTNAME";
		if(d.indexOf("Batches") > -1) circleId = "BATCHNAME";
		if(d.indexOf("Global filters") > -1) circleId = "GLOBALFILTER";
		if(d.indexOf("Feeders") > -1) circleId = "Feeder";
		if(d.indexOf("Stored procedures") > -1) circleId = "StoredProcedure";
		if(d.indexOf("Extractions") > -1) circleId = "Extraction";
		if(d.indexOf("Labels of data") > -1) circleId = "LABELOFDATA";
		if(d.indexOf("Datamart tables") > -1) circleId = "SOURCETABLE";
		if(d.indexOf("Data sources") > -1) circleId = "SOURCETYPE";
		if(d.indexOf("Dynamic views") > -1) circleId = "DYNVIEW";
		brushmove(circleId);

	}

var circle = svg.append("g").attr("class", "brushcircle").selectAll("circle")
    .data(d3.keys(foci))
    .enter().append("circle")
	.attr("id",function(d){ return d; })
	.attr("cx",10)
	.attr("cy", function(d) { return foci[d].y; })
	.attr("r", "8")
	.attr("fill",function(d) { return foci[d].color;})
	.on("click",function(d){
			var circleId = d;
			brushmove(circleId);
				if (d3.event.ctrlKey)
				{
				var depExport = "";
				d3.values(nodes).filter(function(n){return n.type == d}).forEach(function(m){depExport += m.name+"\r\n";});
				copyToClipboard(depExport);
				depExport = "";
				}
	})


//rectangular brush to select/slide over multiple objects
//svg.append("g")
  //  .attr("class", "brush")
    //.call(d3.svg.brush().y(yScale)
		//.on("brushstart", brushstart)
	//	.on("brush", brushmove)
		//.on("brushend", brushend))
	//.selectAll("rect")
    //.attr("x",27) //0
	//.attr("width",150); //10


function brushstart() {

    svg.classed("selecting", true);
}

function brushmove(circleId) {

  if (typeof(circleId) === "undefined") { circleId = ""; }

  if(circleId == "")
  {
	//brush selection
	  var s = d3.event.target.extent();
	  circle.classed("selected", function(d) { return s[0] <= yScale(d) && s[1] >= yScale(d) });
	  selectedTypes =  yScale.domain().filter(function(d){return (s[0] <= yScale(d)) && (yScale(d) <= s[1])});  //returns an array of selected dm object types
  }
  else
  {
    //click selection
	var state = d3.select("#" + circleId).attr("class");

	if(state == "selected")
		{
		//console.log("remove selection");
		var pos = selectedTypes.indexOf(circleId);
		selectedTypes.splice(pos,1);
		d3.select("#"+circleId).classed("selected",false);
		//d3.select("#"+circleId).attr("style","stroke:none;stroke-width:1px;");
		}
	else {
		//console.log("add selection");
		selectedTypes.push(circleId);
		d3.select("#"+circleId).classed("selected",true);
		//d3.select("#"+circleId).attr("style","stroke:#f00;stroke-width:3px;");

		}
  }


  //if BATCHes are selected, then show their filter search field & the search div
  if(selectedTypes.indexOf("BATCHNAME") != -1 )
  {
	  d3.select("#batchSearch").style("visibility","visible");
	  d3.select("#SearchResults").style("visibility","visible");
  }
  else if(selectedTypes.indexOf("BATCHNAME") == -1)
  {
	 d3.select("#batchSearch").style("visibility","hidden");
	 $('#batchSearchInput').val('');  //clear filter search input field
	 $("#batchSearchResultsCount").html(""); //clear filter search count

  }

  //if Dyns are selected, then show their filter search field & the search div
  if(selectedTypes.indexOf("SOURCETYPE") != -1 )
  {
	  d3.select("#dynSearch").style("visibility","visible");
	  d3.select("#SearchResults").style("visibility","visible");
  }
  else if(selectedTypes.indexOf("SOURCETYPE") == -1)
  {
	  d3.select("#dynSearch").style("visibility","hidden");
	  $('#dynSearchInput').val('');  //clear filter search input field
	  $("#dynSearchResultsCount").html(""); //clear filter search count
  }

  if(selectedTypes.indexOf("BATCHNAME") == -1 && selectedTypes.indexOf("SOURCETYPE") == -1)
  {
	 d3.select("#SearchResults").style("visibility","hidden");
	 d3.select("#resultsTableLabel").style("visibility","hidden");
	 d3.select("#showorphansdiv").style("visibility","hidden");
	 d3.select("#btnExport").style("visibility","hidden");
	 clearTable();
  }

  //show the main search only if at least one object is displayed
	    if(selectedTypes.length > 0)
			  d3.select("#searchdiv").style("visibility","visible")
		  else {
		  d3.select("#searchdiv").style("visibility","hidden");
		  d3.select("#btnExport").style("visibility","hidden");
		  }




   currSel = selectedTypes.length;
  //trigger simulation only if object types selection has changed
  if (currSel != prevSel){
	if(lightMode==false)
	{
	  selectedNodes = d3.values(nodes).filter(function(d){return selectedTypes.indexOf(d.type) != -1});     //finds all objects in "nodes" that have one of the "selectedTypes", returns an array "selectedNodes"
	  selectedLinks = d3.values(links).filter(function(d){return selectedTypes.indexOf(d.stype) != -1 && selectedTypes.indexOf(d.ttype) != -1});     //finds all objects in "nodes" that have one of the "selectedTypes", returns an array "selectedNodes"

    }

    d3.select(".stats").text("Showing objects: " + selectedNodes.length + " / "+totalNodes+", dependencies: " + selectedLinks.length + " / " +totalLinks + ", snapshot date: " +updatedDate);

	if(selectedTypes.length == 2) playBirdsSound(); //when 1 type is selected
	if(selectedTypes.length == 8 ) crows1Sound.play(); //when 4 types are selected

	start();
  }
  prevSel = currSel;

}


function brushend() {
  svg.classed("selecting", !d3.event.target.empty());

}

}

///////////////////////////////////////////////////////////////////////////////////////// end brush/slider  /////////////////////////////

function resizeSvg(value)
{
	var batchSearchTop = 230;
	var dynSearchTop = 723;
	var searchResultsTop = 820;


	switch(value)
	{
		case "4": height = 900 - margin.bottom - margin.top; batchSearchTop = 230; dynSearchTop = 723; searchResultsTop = 820; do1Sound.play(); break;
		case "3": height = 1100 - margin.bottom - margin.top; batchSearchTop = 255; dynSearchTop = 903; searchResultsTop = 1020; meSound.play(); break;
		case "2": height = 1300 - margin.bottom - margin.top; batchSearchTop = 277; dynSearchTop = 1079; searchResultsTop = 1220; solSound.play(); break;
		case "1": height = 1500 - margin.bottom - margin.top; batchSearchTop = 300; dynSearchTop = 1257; searchResultsTop = 1420; do2Sound.play(); break;
	}


	//clean old brush
	d3.select("g.brush").remove();
	d3.select("g.brushcircle").remove();
	d3.select("g.axis").remove()
	d3.select("g.extent").remove()
	d3.select("g.resize").remove()

	//redimension force center
	force.size([width, height+(height*0.2)]);

	//recalcualte foci for Y axis custom forces, based on new vertical spacing
	foci = { "PROCESSINGSCRIPTNAME": {x: 200, y: margin.top   			 ,color: "#DF6349"},
							"BATCHNAME": {x: 200, y: margin.top+height*(1/9) ,color: "#F8B624"},
							"GLOBALFILTER": {x: 200, y: margin.top+height*(2/9) ,color: "#C390D4"},
							   "Feeder": {x: 200, y: margin.top+height*(3/9) ,color: "#9DBFAF"},
					 "StoredProcedure": {x: 200, y: margin.top+height*(4/9) ,color: "#B3B02D"}	,
						   "Extraction": {x: 200, y: margin.top+height*(5/9) ,color: "#D88A8A"},
						  "LABELOFDATA": {x: 200, y: margin.top+height*(6/9) ,color: "#57A800"},
						  "SOURCETABLE": {x: 200, y: margin.top+height*(7/9) ,color: "#84D663"},
						   "SOURCETYPE": {x: 200, y: margin.top+height*(8/9) ,color: "#8CC6ED"},
							  "DYNVIEW": {x: 200, y: margin.top+height*(9/9) ,color: "#ED98E7"}
			};

	//repaint whole brush based on new vertical spacing
	paintBrush();

	//reposition Search boxes,html table, and resize vertical region lines based on new vertical spacing
	d3.select("#batchSearch").style("top",""+batchSearchTop+"px");
	d3.select("#dynSearch").style("top",""+dynSearchTop+"px");
	d3.select("#SearchResults").style("top",""+searchResultsTop+"px");

	var verticalLineY = height + margin.top;
	d3.selectAll(".verticalline").attr("y2",verticalLineY);
	d3.selectAll(".horizontalline").remove();
	for (var n in foci)
	{

	var hregion = svg.append("g")
						.attr("class","forceRegion")
						.style("visibility","hidden")

		hregion.append("line")
					 .attr("class","horizontalline")
					 .attr("x1",200)
					 .attr("y1", foci[n].y)
					 .attr("x2",width)
					 .attr("y2", foci[n].y)
	}


	//re-energize the force layout to reposition the nodes correctly
	force.alpha(0.1);

}


//to highlight direct or adjacent path using recursion along the nodes tree
function exploreTree(node,depMode,prevLevelType)
{

//default values
if (typeof(node) === "undefined") { console.log("no node provided for exploreTree()!"); return; }
if (typeof(depMode) === "undefined") { depMode = "branchOnly"; }
if (typeof(prevLevelType) === "undefined") { prevLevelType = 0; }

	//0: check if node not in [nodeList], then use the array count to proceed
	var seenNode = nodeList.filter(function(d){return node.name == d.name });
	if(seenNode.length == 0)
	{
		//1: add this node to [nodeList]
		nodeList.push(node);

		//2: get all links (from [links] array) where the selected node is found either in source or in destination
		/*var relatedLinks = [];
		for(var n in links)
		{
		if(node.name == links[n].target.name || node.name == links[n].source.name)
		relatedLinks.push(links[n]);
		}*/
		var relatedLinks = d3.values(links).filter(function(d){return node.name == d.target.name || node.name == d.source.name });

		//3: for each link matching criteria in //2
		for(var k in relatedLinks)
		{
			//4: check if the current link related to selected node, is already in [linkList], if yes, breakout the for loop, else continue
			var linkAlreadyAdded = false;
			for(var n in linkList)
			{
			if(relatedLinks[k].source.name == linkList[n].source.name && relatedLinks[k].target.name == linkList[n].target.name)
				{ linkAlreadyAdded = true; break;}
			else
				linkAlreadyAdded = false;
			}


			//5: use the step //4 results to test for the recursion EXIT criteria: linkAlreadyAdded == true, else dig deep
			if(!linkAlreadyAdded)
			{
				//6: get the other-side-node of the current link, from the main [nodes] array
				if(node.name == relatedLinks[k].source.name)
					var otherSideNode = d3.values(nodes).filter(function(d){return d.name == relatedLinks[k].target.name });
				else
					var otherSideNode = d3.values(nodes).filter(function(d){return d.name == relatedLinks[k].source.name });

				//7: check if the current node type is equal to that of the node of previous recursive iteration, if true, skip, else continue
				if(otherSideNode[0].depLevel > prevLevelType || otherSideNode[0].depLevel < prevLevelType)
				{
					//8: add the newly traversed link into [linkList]
					linkList.push(relatedLinks[k]);

					//9: depending on the exporation mode (leaf or branchOnly) call recursively exploreTree() to find new nodes and links

					//short path: for each new node, return only next neighboring node, that is directly related to the exploration path/prebious node.
					if(depMode == "branchOnly")
						exploreTree(otherSideNode[0],depMode,node.depLevel);

					//long path: for each new node, this will return the next neighboring node, regardless if it is directly related to it or not.
					if(depMode == "leaf")
						exploreTree(otherSideNode[0],depMode);

				}
			}
		}
	}
}


//get neighbours & links and modify 'force' flag for all the nodes found
function modifyNeighbours(node,force)
{
//set default values
if (typeof(node) === "undefined") { console.log("no node provided for modifyNeighbours(?)!"); return; }
if (typeof(force) === "undefined") { force = true; }

	//get all links of this node
	var directLinks = links.filter(function(d){return node.name == d.target.name || node.name == d.source.name })

	//get all 1st order nodes linked to 'node', and store them in [neighbouringNodes]
	for(var k in directLinks)
	{
		if(node.name == directLinks[k].source.name)
			var otherSideNode = nodes.filter(function(d){return d.name == directLinks[k].target.name })[0];
		else
			var otherSideNode = nodes.filter(function(d){return d.name == directLinks[k].source.name })[0];
		otherSideNode.force = force;
		neighbouringNodes.push(otherSideNode);

	}

console.log(neighbouringNodes);
for(var i in neighbouringNodes) console.log(neighbouringNodes[i].name);
console.log(directLinks);
for(var i in directLinks) console.log(directLinks[i].source.name +":"+directLinks[i].target.name);

}



//////////////////////////////////////////////////////////additional functions //////////////////////////////////////////////////


//controls the behavior of auto-complete to allow multiple values using commas

var Inputs = $('.automultiple');

for (i=0; i < Inputs.length; i++) {
    var input = Inputs[i];
    new Awesomplete(input, {

	    filter: function(text, input) {
            return Awesomplete.FILTER_CONTAINS(text, input.match(/[^,&]*$/)[0]);
        },
//		sort: function(text, input) {
//		  return text < input;
//		},
        replace: function(text) {
            var before = this.input.value.match(/^.+(,|&)\s*|/)[0];
            this.input.value = before + text + "";
        }

    });
}




//to escape special chars when setting tooltip/class names...
function esc( text ) {

    return text.replace(/([ #;?%&,.+*~\':"!^$[\]()=<>|\/@])/g,'\\$1');

}

//to perform search and highlight
window.findNodes = function(){



	  var userInput = document.getElementById("targetNode").value.split(' ').join(' ');

	  //rest all nodes
	  d3.selectAll(".node").selectAll("path:not(.explode)").transition().duration(250).attr("style","stroke:white;stroke-width:1.0px;opacity:1.0");

	  if(userInput != ""){

			var count = 0;
		    if(lightMode==false)
			{
			//find and highlight
			var foundNodes = d3.selectAll(".node").selectAll("path").filter(function(d){
											return d.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1;
													});
			var restOfNodes = d3.selectAll(".node").selectAll("path").filter(function(d){
											return d.name.toLowerCase().indexOf(userInput.toLowerCase()) == -1;
													});

			var isolatedLinks = d3.selectAll(".link").filter(function(d){
											return d.source.name.toLowerCase().indexOf(userInput.toLowerCase()) == -1 ||  d.target.name.toLowerCase().indexOf(userInput.toLowerCase()) == -1;
													});

			restOfNodes.transition().duration(1000).style("opacity",0.2);   	//hide all circles except the found ones

			isolatedLinks.transition().duration(1000).style("opacity",0.2);


			foundNodes
				.transition().duration(250).attr("style","stroke:red;stroke-width:2.0px;")
				.transition().duration(100).ease("linear").attr("style","stroke:white;stroke-width:0.0px;")
				.transition().duration(100).attr("style","stroke:red;stroke-width:2.0px;")


			//count them
			foundNodes.filter(function(d){if(d.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1) count++;});
			}
			else
			{ //light mode

	         //==> extract nodes
			selectedNodes = d3.values(nodes).filter(function(d){return selectedTypes.indexOf(d.type) != -1 && d.name.toLowerCase().indexOf(userInput.toLowerCase()) > -1});     //finds all objects in "nodes" that have one of the "selectedTypes" and name matches the search, returns an array "selectedNodes"
			start();

			//count them
			count = selectedNodes.length;
			}


			if(count > 0)
			{
				playBirdsSound();
				svg.select("#searchResult").text("Found " + count + " hit(s) for '"+userInput+"'").attr("fill", "gray").attr("font-size","15");
			}
			else
			  svg.select("#searchResult").text("No hits are found").attr("fill", "#D67284").attr("font-size","15");

		}
		else
		{
			svg.select("#searchResult").text("");
			if(lightMode==true)
			{
			selectedNodes.splice(0,selectedNodes.length);
			start();
			}


		}
}

function highlightFoundBatches(batchArray)
{
//rest all Batch nodes
var allBatches = d3.selectAll(".node").selectAll("path").filter(function(d){
												return d.name.indexOf("Batch-") == 0;
												});

allBatches.transition().duration(250).attr("style","stroke:white;stroke-width:1.0px;opacity:0.2;");

for(var i=0; i < batchArray.length; i++)
{
	var foundNodes = d3.selectAll(".node").selectAll("path").filter(function(d){
												return d.name == "Batch-"+batchArray[i].split(' ').join(' ');;
												});

	foundNodes
	.transition().duration(250).attr("style","stroke:#C72A61;stroke-width:2.0px;opacity:1.0;")
		.transition().duration(100).ease("linear").attr("style","stroke:white;stroke-width:0.0px;")
		.transition().duration(100).attr("style","stroke:#C72A61;stroke-width:2.0px;opacity:1.0;")
	}



}

function highlightFoundDyns(dynArray)
{
//rest all Dyn source nodes
//rest all Batch nodes
var allSources = d3.selectAll(".node").selectAll("path").filter(function(d){
												return d.name.indexOf("SourceType-") == 0;
												});

allSources.transition().duration(250).attr("style","stroke:white;stroke-width:1.0px;opacity:0.2;");

for(var i=0; i < dynArray.length; i++)
{
	var foundNodes = d3.selectAll(".node").selectAll("path").filter(function(d){

												return d.name.indexOf("SourceType-"+dynArray[i].split(' ').join(' ')+":") > -1;
												});
	foundNodes
	.transition().duration(250).attr("style","stroke:green;stroke-width:2.0px;opacity:1.0;")
		.transition().duration(100).ease("linear").attr("style","stroke:white;stroke-width:0.0px;")
		.transition().duration(100).attr("style","stroke:green;stroke-width:2.0px;opacity:1.0;")
	}

}

//update node symbole state according to the current combination of path classes
function updateShape(id)
{
if (typeof(id) === "undefined") { console.log("no id provided for changeShape(?)"); return; }

var classList = d3.select("#" + esc(id)).attr("class");

var state = circlePath;

if(classList.indexOf("fixed") !=-1      && classList.indexOf("direct") !=-1 ) state = crossPath;
else if(classList.indexOf("fixed") !=-1 && classList.indexOf("long")!=-1) state = diamondPath;
else if(classList.indexOf("fixed") !=-1 && classList.indexOf("short")!=-1) state = trianglePath;

else if(classList.indexOf("float") !=-1 && classList.indexOf("direct")!=-1) state = circlePath;
else if(classList.indexOf("float") !=-1 && classList.indexOf("long")!=-1) state = diamondPath;
else if(classList.indexOf("float") !=-1 && classList.indexOf("short")!=-1) state = trianglePath;


svg.selectAll("#" + esc(id)).attr("d",state);
if(classList.indexOf("explode") !=-1) svg.selectAll("#" + esc(id)).style("stroke","#F2E15E");
else svg.selectAll("#" + esc(id)).style("stroke","white");
}


function updateEnvStats(envname,totalNodes,totalLinks)
{
	$.ajax({
				url: "updateenv.php",
				data: {
						envname: envname,
						totalnodes: totalNodes,
						totallinks: totalLinks
						},
				dataType: 'json',
				type: 'get',
				async: false,
				success: function(data) {
					response = true;
				},
				error: function() {

					console.log("failed to update Env "+envname+" stats")
					response = false;


				}
			});

}

//executed when searching batches
window.submitBatch= function(o)
{

	d3.select("#resultsTableLabel").style("visibility","hidden");
	$("#batchSearchResultsCount").html("");
	d3.select("#showorphansdiv").style("visibility","hidden");
	d3.select("#btnExport").style("visibility","hidden");
	$('#showorphansbox').attr('checked', false);
	clearTable();

	var warning = "";

	var search = $('#batchSearchInput').val();
    if(search.trim().toLowerCase() == "all") search = "BATCHNAME="; //if search equal ALL then return all batches

	if(search.indexOf("=") != -1)
	{
		$('#batchSearchInput').animate({width:'122px'},400);

		var countCommas = (search.match(/,/g) || []).length;
		var countEquals = (search.match(/=/g) || []).length;
		var countAnds = (search.match(/&/g) || []).length;
		// console.log(countCommas+","+countEquals+"="+countAnds+"&");
		if(countEquals > countCommas+countAnds )
		{

			$("#batchSearchResultsCount").html("Searching...");
			id=0; //used to give ids for each row added to html table
			addTableHeader(batchFileName);
			var foundBatches = [];


			var criteria = search.split(",");
			//read file
			d3.csv(batchFileName, function(error,rawData)
			{
					if (error)
					{
							alert("File '"+batchFileName+"' not found. Can't load data.");
							throw error;
					}
					else
					{

						rawData.forEach(function(row) {
							for(var i=0; i<criteria.length;i++)
							{
								//AND
								if(criteria[i].indexOf("&") > -1)
								{

									var sentence = criteria[i].split("&");
									var result = "";

									for(var j=0; j<sentence.length;j++)
									{
										var field = sentence[j].split("=");
										var key = field[0].trim();
										var value = field[1].trim();

										if(Object.keys(row).indexOf(key.toUpperCase()) > -1)
										//console.log(i + "OR: "+key+"-"+value);
										{
											//console.log(j + "AND: "+key+"-"+value);

											var searchType = "like";
											if(value.indexOf('"') != -1)
												searchType = "exact";
											else
												searchType = "like";

											if(searchType == "exact")
													{ //if value contains "value" ==> exact search
														value = value.replace(/['"]+/g , ""); //clean ""
														if(row.BATCHNAME.trim() != "" && isNaN(row.BATCHNAME.trim()) && row[key].trim() == value)
														{
															result= row.BATCHNAME.trim();

														}
														else
															{	result = "";
																break;	//leave loop as one of the criteria didn't match
															}

													}
													else
													{ //pattern search (i.e like)
														if(row.BATCHNAME.trim() != "" && isNaN(row.BATCHNAME.trim()) && row[key].trim().toLowerCase().indexOf(value.toLowerCase()) != -1)
														{
															result = row.BATCHNAME.trim();
														}
														else
														{	result = "";
															break; //leave loop as one of the criteria didn't match
														}
													}

										} else warning = "<br>'"+key+"' is not a valid search term";

									} //reading each &

									if(result != "")
									{
										if(foundBatches.indexOf(row.BATCHNAME.trim()) == -1)
										foundBatches.push(row.BATCHNAME.trim())
										addRow(row);

									}

								} //end AND
								else
								{
								//OR

									var field = criteria[i].split("=");
									var key = field[0].trim();
									var value = field[1].trim();

									if(Object.keys(row).indexOf(key.toUpperCase()) > -1)
									//console.log(i + "OR: "+key+"-"+value);
									{
										var searchType = "like";
										if(value.indexOf('"') != -1)
											searchType = "exact";
										else
											searchType = "like";


												if(searchType == "exact")
												{ //if value contains "value" ==> exact search
													value = value.replace(/['"]+/g , ""); //clean ""
													if(row.BATCHNAME.trim() != "" && isNaN(row.BATCHNAME.trim()) && row[key].trim().toLowerCase() == value.toLowerCase())
													{

														if(foundBatches.indexOf(row.BATCHNAME.trim()) == -1)
															foundBatches.push(row.BATCHNAME.trim())
															addRow(row);
													}

												}
												else
												{ //pattern search (i.e like)
													if(row.BATCHNAME.trim() != "" && isNaN(row.BATCHNAME.trim()) && row[key].trim().toLowerCase().indexOf(value.toLowerCase()) != -1)
													{

														if(foundBatches.indexOf(row.BATCHNAME.trim()) == -1)
															foundBatches.push(row.BATCHNAME.trim())
															addRow(row);
													}

												}
									}else warning = "<br>'"+key+"' is not a valid search term";

								}
							} //reading each ,
						});	//end row read
					}

					if(lightMode==true)
					{
						//light mode
						//==> extract matching nodes

						//save all nodes that are not batches
						var oNodes = $.grep(selectedNodes, function(e){
							 return e.type != "BATCHNAME";
						});

						//clean selectedNodes
						selectedNodes.splice(0,selectedNodes.length);

						var batchesString = foundBatches.join(); batchesString+=",";
						var sNodes = d3.values(nodes).filter(function(d){ return d.type == "BATCHNAME" && batchesString.indexOf(d.name.replace(/^Batch-/, "")+",") > -1});     //finds all objects in "nodes" that have one of the "selectedTypes" and name matches the search, returns an array "selectedNodes"

						//merge selectedNodes & sNodes arrays
						selectedNodes.push.apply(selectedNodes, oNodes);
						selectedNodes.push.apply(selectedNodes, sNodes);

						start();

					}

					if(lightMode==false) highlightFoundBatches(foundBatches); //highligh bacthes only in Default mode( i.e not lightmode)

							if(foundBatches.length == 0)
								{
								$("#batchSearchResultsCount").html("Found: 0" + warning);
								d3.select("#btnExport").style("visibility","hidden");
								}
							else
								{
								$("#batchSearchResultsCount").html("Found: <a href='#results'>" +foundBatches.length+"</a>");
								d3.select("#btnExport").style("visibility","visible");
								}


			});	//end read file

		foundBatches.splice(0,foundBatches.length);
		}else $("#batchSearchResultsCount").html("Invalid search (missing = )");

	  }
	  else
	  {
		//rest all nodes
		$("#batchSearchResultsCount").html("Invalid search");
		var allBatches = d3.selectAll(".node").selectAll("path:not(.explode)").filter(function(d){
														return d.name.indexOf("Batch-") == 0;
														});

		allBatches.transition().duration(250).attr("style","stroke:white;stroke-width:1.0px;");
	  }
}

window.submitDyn= function(o)
{

	d3.select("#resultsTableLabel").style("visibility","hidden");
	d3.select("#showorphansdiv").style("visibility","hidden");
	d3.select("#btnExport").style("visibility","hidden");
	$('#showorphansbox').attr('checked', false);
	$("#dynSearchResultsCount").html("");
	clearTable();

	var warning = "";

	var search = $('#dynSearchInput').val();

	if(search.trim().toLowerCase() == "all") search = "TABLENAME="; //if search equal ALL then return all Dynamic tables

	if(search.indexOf("=") != -1)
	{
		$('#dynSearchInput').animate({width:'122px'},400);

		var countCommas = (search.match(/,/g) || []).length;
		var countEquals = (search.match(/=/g) || []).length;
		var countAnds = (search.match(/&/g) || []).length;
		// console.log(countCommas+","+countEquals+"="+countAnds+"&");
		if(countEquals > countCommas+countAnds )
		{
			$("#dynSearchResultsCount").html("Searching...");

			id=0; //used to give ids for each row added to html table
			addTableHeader(dynFileName);
			var foundDyns = [];

			var usedInDatamartCount=0;

			var criteria = search.split(",");
			//read file
			d3.csv(dynFileName, function(error,rawData)
			{
					if (error)
					{
							alert("File '"+dynFileName+"' not found. Can't load data.");
							throw error;
					}
					else
					{
						rawData.forEach(function(row) {
							for(var i=0; i<criteria.length;i++)
							{
								//AND
								if(criteria[i].indexOf("&") > -1)
								{

									var sentence = criteria[i].split("&");
									var result = "";

									for(var j=0; j<sentence.length;j++)
									{
										var field = sentence[j].split("=");
										var key = field[0].trim();
										var value = field[1].trim();

										if(Object.keys(row).indexOf(key.toUpperCase()) > -1)
										{
											//console.log(j + "AND: "+key+"-"+value);

											var searchType = "like";
											if(value.indexOf('"') != -1)
												searchType = "exact";
											else
												searchType = "like";

											if(searchType == "exact")
													{ //if value contains quotes "value" ==> exact search
														value = value.replace(/['"]+/g , ""); //clean ""
														if(row.TABLENAME.trim() != "" && row[key].trim() == value)
														{
															result= row.TABLENAME.trim();

														}
														else
															{	result = "";
																break;	//leave loop as one of the criteria didn't match
															}

													}
													else
													{ //pattern search (i.e like)
														if(row.TABLENAME.trim() != "" && row[key].trim().toLowerCase().indexOf(value.toLowerCase()) != -1)
														{
															result = row.TABLENAME.trim();
														}
														else
														{	result = "";
															break; //leave loop as one of the criteria didn't match
														}
													}

										} else warning = "<br>'"+key+"' is not a valid search term";

									} //end reading each &

									if(result != "")
									{
										if(foundDyns.indexOf(row.TABLENAME.trim()) == -1)
										{
											if(row.USEDINDATAMART.trim()=="Y") usedInDatamartCount++;
											foundDyns.push(row.TABLENAME.trim())
											addRow(row,false,true);
										}

									}

								} //end AND
								else
								{
								//OR

									var field = criteria[i].split("=");
									var key = field[0].trim();
									var value = field[1].trim();

									if(Object.keys(row).indexOf(key.toUpperCase()) > -1)
									//console.log(i + "OR: "+key+"-"+value);
									{
										//console.log(i + "OR: "+key+"-"+value);

										var searchType = "like";
										if(value.indexOf('"') != -1)
											searchType = "exact";
										else
											searchType = "like";


												if(searchType == "exact")
												{ //if value contains "value" ==> exact search
													value = value.replace(/['"]+/g , ""); //clean ""
													if(row.TABLENAME.trim() != "" && row[key].trim().toLowerCase() == value.toLowerCase())
													{

														if(foundDyns.indexOf(row.TABLENAME.trim()) == -1)
														{
															if(row.USEDINDATAMART.trim()=="Y") usedInDatamartCount++;
															foundDyns.push(row.TABLENAME.trim())
															addRow(row,false,true);
														}
													}

												}
												else
												{ //pattern search (i.e like)
													if(row.TABLENAME.trim() != "" && row[key].trim().toLowerCase().indexOf(value.toLowerCase()) != -1)
													{

														if(foundDyns.indexOf(row.TABLENAME.trim()) == -1)
														{
															if(row.USEDINDATAMART.trim()=="Y") usedInDatamartCount++;
															foundDyns.push(row.TABLENAME.trim())
															addRow(row,false,true);
														}
													}

												}
									}else warning = "<br>'"+key+"' is not a valid search term";

								}
							} //reading each ,
						});	//end row read
					}

					if(lightMode==true)
					{
						//light mode

						//save all nodes that are not dyn
						var oNodes = $.grep(selectedNodes, function(e){
							 return e.type != "SOURCETYPE";
						});

						//clean selectedNodes
						selectedNodes.splice(0,selectedNodes.length);

						//==> extract new matching nodes
						var dynString = foundDyns.join(); dynString+=",";
						var sNodes = d3.values(nodes).filter(function(d){ return d.type == "SOURCETYPE" && dynString.indexOf(d.name.replace(/^SourceType-/, "").split(":")[0]+",") > -1	});    //finds all objects in "nodes" that have one of the "selectedTypes" and name matches the search, returns an array "selectedNodes"

						//merge selectedNodes & sNodes arrays
						selectedNodes.push.apply(selectedNodes, oNodes);
						selectedNodes.push.apply(selectedNodes, sNodes);

						start();

					}

					if(lightMode==false) highlightFoundDyns(foundDyns);
				    if(foundDyns.length>0) d3.select("#btnExport").style("visibility","visible");
					else d3.select("#btnExport").style("visibility","hidden");


							if(usedInDatamartCount == 0)
							{
								$("#dynSearchResultsCount").html("Found: 0"+ warning);
							}
							else
							{
								$("#dynSearchResultsCount").html("Found: <a href='#results'>" +usedInDatamartCount+"</a>");
							}


							$("#notUsedInDMLabel").html("Found: "+(foundDyns.length-usedInDatamartCount));
							if(foundDyns.length-usedInDatamartCount != 0)
									d3.select("#showorphansdiv").style("visibility","visible");

			});	//end read file

		foundDyns.splice(0,foundDyns.length);
		}else $("#dynSearchResultsCount").html("Invalid search (missing = )");

	  }
	  else
	  {
		$("#dynSearchResultsCount").html("Invalid search");
		d3.select("#showorphansdiv").style("visibility","hidden");
		//rest all nodes
		var allSources = d3.selectAll(".node").selectAll("path:not(.explode)").filter(function(d){
														return d.name.indexOf("SourceType-") == 0;
														});

		allSources.transition().duration(250).attr("style","stroke:white;stroke-width:1.0px;");
	  }
}

//add row to display search results in tabular format
function addTableHeader(filename)
{ var label = "";
		if(filename.indexOf("DYN") != -1)
			label = "Search results for: <img src='dynIcon.png' height='10' width='10'> Data sources";
		else if(filename.indexOf("BATCH") != -1)
			label = "Search results for: <img src='batchIcon.png' height='10' width='10'> Batches";
		else if(filename.indexOf("VIEWER") != -1)
			label = "Datamart Viewer dependencies for: <img src='extractionIcon.png' height='10' width='10'> Extractions";

		d3.select("#resultsTableLabel").style("visibility","visible").html(label);
		jQuery.get(filename, function(data) {
		   var fields = data.substr(0, data.indexOf("\n")).split(",");
		   $("#resultsTable > thead").append("<tr class='tableHeader'>");
			   for(var i=0;i<fields.length;i++)
			   {
					$("#resultsTable  > thead > tr").append("<th>"+fields[i]+"</th>");
			   }
			   $("#resultsTable > thead > tr").append("</tr>");
		   });
}

function addRow(row,integerID,dyn)
{

if (typeof(integerID) === "undefined") { integerID = false; }
if (typeof(dyn) === "undefined") { dyn = false; }


	var nbOfColumns = Object.keys(row).length;
	var rowId = "";
		  if(integerID == true)
		   rowId = "row"+id; // used when clickin on Extractions and viewing viewer dependencies
		  else
			{
				if(dyn==false)
					rowId = row[Object.keys(row)[0]].trim(); //used when clickin on Bathces
				else
				{
				  rowId = row[Object.keys(row)[0]].trim()+"-"+row[Object.keys(row)[1]].trim(); //used when searching/clikcing on Dyn tables

				 var styleRow = "";

				  if(row.USEDINDATAMART.trim() == "Y")
					usedInDatamart = true;

				  else
					usedInDatamart = false;
				}
			}

		$("#resultsTable > tbody").append("<tr class='tableRow' id='"+rowId+"' style=''>");
		for(var i=0; i < nbOfColumns; i++)
		{

		  var style = "";


		  var val = row[Object.keys(row)[i]].trim();
		  if(val=='Y') style="style='color:blue;'"

		  if(dyn==true) if(row.USEDINDATAMART.trim() == "N") style ="style='color:#A38300;'";


		  $("#resultsTable > tbody > tr[id='"+rowId+"']").append("<td "+style+">"+row[Object.keys(row)[i]].trim()+"</td>");

		}

          $("#resultsTable > tbody > tr").append("</tr>");



		  if(dyn == true)
			if(usedInDatamart==true)
			{
				d3.selectAll("#"+esc(rowId)).classed("usedInDatamart",true).style("visibility","visible");
				d3.selectAll("#"+esc(rowId)).classed("notUsedInDatamart",false)
			}
			else
			{
				d3.selectAll("#"+esc(rowId)).classed("usedInDatamart",false).style("visibility","hidden");
				d3.selectAll("#"+esc(rowId)).classed("notUsedInDatamart",true)
			}

id++; //create new id for next row (used in Autoid mode only)
}

function clearTable()
{

$(".tableRow").remove();
$(".tableHeader").remove();

}

//read data from file
function copyToClipboard(value) {
  var $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val(value).select();
  document.execCommand("copy"); //use cut to replace copy, this to avoid recursive call to .execCommand (which is prohibited in browsers to avoid attacks)
  $temp.remove();
}

//read data from file
function appendToClipboard() {
var clickBuffer = "";
var n = d3.selectAll(".selectedNode").each(function(d){
clickBuffer += d.name+"\r\n";
});

copyToClipboard(clickBuffer);

}

//scroll and find node-line in table
function scrollToAnchor(aid){
	if(aid.indexOf(":")>-1)
	{ //Dyn object is selected, so highligh any row that STARTS with (to accomodate for all dyn sets)
		var f=aid.split(":");
		aTag = $("tr[id^='"+ f[0] +"']");
	}
	else
		var aTag = $("tr[id='"+ aid +"']");

		$('html,body').animate({scrollTop: aTag.offset().top},'slow');
}

function constrainedMode(mode){

if(mode == false)
	{ //all nodes and links to lose their force contstraints and float in the space
		d3.selectAll("path").classed("explode",true).classed("foci",false);
		d3.select("#repulsion").style("visibility","visible"); //show the repulsion slider input

		force.linkStrength(0.5);
		force.links().forEach(function(L){
			L.force = mode;
		});

		force.charge(-500);
		force.nodes().forEach(function(N){
			N.force = mode;
		});
		force.chargeDistance(120);
		constrainedUniverse	= mode;
	}
	else
	{
	//all nodes and links gain back their attractio to vertical foci, and horizontal placement
		d3.selectAll("path").classed("foci",true).classed("explode",false);
		d3.select("#repulsion").style("visibility","hidden"); //hide the repulsion slider input, only if no other node is exploded

		force.linkStrength(defaultlinkStrength);
		force.links().forEach(function(L){
			L.force = mode;
		});

		force.charge(defaultCharge);
		force.nodes().forEach(function(N){
			N.force = mode;
		});

	}
constrainedUniverse	= mode;
force.start();


}

function findViewers(extractionName)
{
//d3.select("#resultsTableLabel").style("visibility","hidden");

clearTable();
addTableHeader(viewerFileName);
d3.select("#SearchResults").style("visibility","visible");

	d3.csv(viewerFileName, function(error,rawData)
				{
						if (error)
						{
								alert("File '"+viewerFileName+"' not found. Can't load data.");
								throw error;
						}
						else
						{
							id=0; //initialize rows id to zero (will be incremented inside addRow function)

							rawData.forEach(function(row) {
								if(row.EXTRACTION.trim() == extractionName)
								{
								addRow(row,true);
								}

							});

							if(id==0) clearTable();
						}
				});

}

function setDepLevel(type)
{
	var returnType = "";
	switch(type)
	{
		case "PROCESSINGSCRIPTNAME": returnType=6 ; break;
		case "BATCHNAME": returnType=5 ; break;
		case "GLOBALFILTER": returnType=5 ; break;
		case "Feeder": returnType=4 ; break;
		case "StoredProcedure": returnType=4 ; break;
		case "Extraction": returnType=4 ; break;
		case "LABELOFDATA": returnType=3 ; break;
		case "SOURCETABLE": returnType=3 ; break;
		case "SOURCETYPE": returnType=2 ; break;
		case "DYNVIEW": returnType=1 ; break;
	}
	return returnType;
}


function prettyName(key)
{
	var returnName = "";
	switch(key)
	{
		case "PROCESSINGSCRIPTNAME": returnName="Processing scripts" ; break;
		case "BATCHNAME": returnName="Batches" ; break;
		case "GLOBALFILTER": returnName="Global filters" ; break;
		case "Feeder": returnName="Feeders" ; break;
		case "StoredProcedure": returnName="Stored procedures" ; break;
		case "Extraction": returnName="Extractions" ; break;
		case "LABELOFDATA": returnName="Labels of data" ; break;
		case "SOURCETABLE": returnName="Datamart tables" ; break;
		case "SOURCETYPE": returnName="Data sources" ; break;
		case "DYNVIEW": returnName="Dynamic views" ; break;
	}
	return returnName;
}

alertify.success("Loading is done!");



	} //end loading data and UI
	}); //end reading lod file

}//end loading data and UI
}); //end reading dep file

}//end file dep file reading/i.e loading end

window.regenerateData = function(envname)
{
	alertify.set({ labels: { ok: "Yes", cancel: "Cancel" } });
				alertify.confirm("Are you sure you want to generate new data for '"+envname+"', thus overwriting the existing?", function (e) {
					if (e) {
						$.ajax({
							url: "generateEnvData.php",
							data: {envname: envname},
							dataType: 'json',
							type: 'get',
							async: false,
							success: function(data) {
								alertify.success("Done! Now, reloading page...");
								response = true;
								window.location = "http://ci-dmm-win/vis/visualize.php?envname=" + encodeURIComponent(envname);   //encoding replaces spaces by %20
							},
							error: function() {
								alertify.error("oops ! something went wrong while generating data, make sure Env is not cleaned AND defined in DataART");
								response = false;
							},
							timeout: 3*60*1000 //3 min
						});

					} else {
						alertify.log("You've cancelled data generation");
					}
				});


}
window.deleteData = function(envname)
{
	alertify.set({ labels: { ok: "Yes", cancel: "Cancel" } });
				alertify.confirm("Are you sure you want to delete all collected data of the Env '"+envname+"' from DataART (no worries, the actual MX env will not be modified)?", function (e) {
					if (e) {
						$.ajax({
							url: "deleteEnvData.php",
							data: {envname: envname},
							dataType: 'json',
							type: 'get',
							async: false,
							success: function(data) {
								alertify.success("Done! Now, reloading page...");
								response = true;
								window.location = "http://ci-dmm-win/vis/dataart.php";
							},
							error: function() {
								alertify.error("oops ! something went wrong while deleting data, give Fahed Al Riachi a call, it is probably a bug somewhere:) sorry");
								response = false;
							},
							timeout: 3*60*1000 //3 min
						});

					} else {
						alertify.log("You've cancelled data deletion");
					}
				});


}
function playNodeSound(nodeType)
{
	switch(nodeType)
					{
						case "PROCESSINGSCRIPTNAME" : do2Sound.play(); break;
						case "BATCHNAME" : siSound.play(); break;
						case "GLOBALFILTER" : siSound.play(); break;
						case "Feeder": laSound.play(); break;
						case "StoredProcedure": solSound.play(); break;
						case "Extraction": solSound.play(); break;
						case "LABELOFDATA" : faSound.play(); break;
						case "SOURCETABLE" :meSound.play(); break;
						case "SOURCETYPE" :reSound.play(); break;
						case "DYNVIEW"	:do1Sound.play(); break;
					}
}

function playChordSound()
{
	var select = Math.floor((Math.random() * 3) + 1);
	switch(select)
				{
					case 1 : chord4nSound.play(); break;
					case 2 : chord3nSound.play(); break;
					case 3 : chordnSound.play(); break;
				}
}

function playUniverseSound()
{
	var select = Math.floor((Math.random() * 2) + 1);
	switch(select)
				{
					case 1 : universeSound.play(); break;
					case 2 : earthSound.play(); break;
				}
}

function playBirdsSound()
{
	var select = Math.floor((Math.random() * 3) + 1);
	switch(select)
				{
					case 1 : bird1Sound.play(); break;
					case 2 : bird2Sound.play(); break;
					case 3 : bird3Sound.play(); break;
				}
}

$(document).ready(function() {
    $("#btnExport").click(function(e) {
        //getting values of current time for generating the file name
        var dt = new Date();
        var day = dt.getDate();
        var month = dt.getMonth() + 1;
        var year = dt.getFullYear();
        var hour = dt.getHours();
        var mins = dt.getMinutes();
        var postfix = day + "." + month + "." + year + "_" + hour + "." + mins;
		var env = '<?php echo $envname?>';
        //creating a temporary HTML link element (they support setting file names)
        var a = document.createElement('a');
        //getting data from our div that contains the HTML table
        var data_type = 'data:application/vnd.ms-excel';
        var table_div = document.getElementById('resultsTable');
        var table_html = table_div.outerHTML.replace(/ /g, '%20');
        a.href = data_type + ', ' + table_html;
        //setting the file name
        a.download = 'DataART_'+env+'_'+ postfix + '.xls';
        //triggering the function
        a.click();
        //just in case, prevent default behaviour
        e.preventDefault();
    });
});
