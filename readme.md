# Datamart Dependencies Graph Viewer

This tool is designed for visual testing of Datamart dependencies' JSON Graph responses

## vis.html

Deply: copy vis.html anywhere on your disk

Features:

- Send GET REST calls (Bearer token support). Expects a JSON Graph response
- The JSON Graph response is visualized (using d3.js force layout)
    - nodes and edges have tooltips showing their full json definition including MX added metadata
    - click & drag a node to change its position, which result in fixing it once drag ends
    - double-click a node to release its position
    - nodes are color coded following the object 'type' available
    - the legend shows the count of objects per type
    - click on a legend to hide/show all of its nodes
    - double click on a legend to hide all other nodes
    - 'Force data-stream hierarchy' uses the node.metadata.depth (if available) to position the nodes on screen top to bottom, such that data sources (ex: datamart, dbf tables) are on top, while batches or processing scripts are at the bottom.
- View the raw JSON graph response by clicking on '{ JSON }. double click to export to a file: graph.json
- View the raw graph in GML format by clicking on '{ GML }. double click to export to a file: graph.gml (can be visualized using other tools like Gephi)

## mock server
 
To allow for testing the tool, a thin REST service is also provided, exposing one endpoint that serves JSON Graph files by name

Endpoint: GET http://localhost:9191/api/:filename

To deploy, nodejs should be installed on your machine, then:

```
> cd backendMock   
> npm install  
> node endpoint  
```

The directory ./backendMock/data contains sample .json files that can be requested: 

Example: http://localhost:9191/api/JSONGraph1.json


