d3.csv("data/treeoflif_flourish_reducido.csv").then(function(data) {

    // Convertir datos a jerarquía
    let nodesById = {};
    data.forEach(d => nodesById[d.child] = {...d, children: []});
    data.forEach(d => {
        if (d.parent && nodesById[d.parent]) {
            nodesById[d.parent].children.push(nodesById[d.child]);
        }
    });

    // Nodo raíz (ajustar ID raíz según tu CSV)
    let root = nodesById["1"];

    let width = 960, height = 800;
    let radius = Math.min(width, height) / 2;

    let treeLayout = d3.tree()
        .size([2 * Math.PI, radius]);

    let hierarchyRoot = d3.hierarchy(root, d => d.children);
    treeLayout(hierarchyRoot);

    let svg = d3.select("#tree-svg")
        .attr("viewBox", [-width/2, -height/2, width, height])
        .style("font", "12px sans-serif");

    // Links
    svg.append("g")
        .selectAll("path")
        .data(hierarchyRoot.links())
        .join("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y))
        .attr("stroke", "#555")
        .attr("fill", "none");

    // Nodes
    svg.append("g")
        .selectAll("circle")
        .data(hierarchyRoot.descendants())
        .join("circle")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .attr("r", 4)
        .attr("fill", d => d.extinct == "1" ? "red" : "green");

    // Labels
    svg.append("g")
        .selectAll("text")
        .data(hierarchyRoot.descendants())
        .join("text")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y + 6},0) ${d.x > Math.PI ? "rotate(180)" : ""}`)
        .attr("text-anchor", d => d.x > Math.PI ? "end" : "start")
        .text(d => d.node_name);
});
