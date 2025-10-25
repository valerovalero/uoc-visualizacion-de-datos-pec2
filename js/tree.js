d3.csv("data/treeoflif_flourish_reducido.csv").then(function(data) {

    // Convertir datos a jerarquía
    let nodesById = {};
    data.forEach(d => nodesById[d.child] = {...d, children: []});
    data.forEach(d => {
        if (d.parent && nodesById[d.parent]) {
            nodesById[d.parent].children.push(nodesById[d.child]);
        }
    });

    // Detectar nodo raíz automáticamente
    const allChildren = new Set(data.map(d => d.child));
    const rootCandidate = data.find(d => !allChildren.has(d.parent));
    const rootId = rootCandidate ? rootCandidate.parent : "1";
    const root = nodesById[rootId];

    let width = 960, height = 800;
    let radius = Math.min(width, height) / 2;

    let treeLayout = d3.tree().size([2 * Math.PI, radius]);
    let hierarchyRoot = d3.hierarchy(root, d => d.children);
    treeLayout(hierarchyRoot);

    let svg = d3.select("#tree-svg")
        .attr("viewBox", [-width/2, -height/2, width, height])
        .style("font", "10px sans-serif");

    // Dibujar links
    svg.append("g")
        .selectAll("path")
        .data(hierarchyRoot.links())
        .join("path")
        .attr("d", d3.linkRadial().angle(d => d.x).radius(d => d.y))
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("fill", "none");

    // Crear tooltip
    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("padding", "4px 8px")
        .style("background", "rgba(0,0,0,0.7)")
        .style("color", "white")
        .style("border-radius", "4px")
        .style("font-size", "10px")
        .style("pointer-events", "none")
        .style("opacity", 0);

    // Dibujar nodos
    const node = svg.append("g")
        .selectAll("g")
        .data(hierarchyRoot.descendants())
        .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`);

    node.append("circle")
        .attr("r", 5)
        .attr("fill", d => d.data.extinct == "1" ? "red" : "green")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(100).style("opacity", 1);
            tooltip.html(d.data.child_name || d.data.node_name || d.data.child);
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                   .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

});
