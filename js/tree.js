d3.csv("data/treeoflif_flourish_reducido.csv").then(function(data) {

    // Convertir datos a jerarquía
    let nodesById = {};
    data.forEach(d => nodesById[d.child] = {...d, children: []});
    data.forEach(d => {
        if (d.parent && nodesById[d.parent]) {
            nodesById[d.parent].children.push(nodesById[d.child]);
        }
    });

    // Detectar nodo raíz automáticamente (el que nunca aparece como child)
    const allChildren = new Set(data.map(d => d.child));
    const maybeRoot = data.find(d => !allChildren.has(d.parent))?.parent || "1";
    let root = nodesById[maybeRoot];

    let width = 960, height = 800;
    let radius = Math.min(width, height) / 2;

    let treeLayout = d3.tree().size([2 * Math.PI, radius]);

    let hierarchyRoot = d3.hierarchy(root, d => d.children);
    treeLayout(hierarchyRoot);

    let svg = d3.select("#tree-svg")
        .attr("viewBox", [-width/2, -height/2, width, height])
        .style("font", "10px sans-serif");

    // Links
    svg.append("g")
        .selectAll("path")
        .data(hierarchyRoot.links())
        .join("path")
        .attr("d", d3.linkRadial()
            .angle(d => d.x)
            .radius(d => d.y))
        .attr("stroke", "#888")
        .attr("stroke-width", 1)
        .attr("fill", "none");

    // Nodo + texto juntos en un <g>
    const node = svg.append("g")
        .selectAll("g")
        .data(hierarchyRoot.descendants())
        .join("g")
        .attr("transform", d => `
            rotate(${d.x * 180 / Math.PI - 90})
            translate(${d.y},0)
        `);

    // Círculo
    node.append("circle")
        .attr("r", 8)
        .attr("fill", d => d.data.extinct == "1" ? "#d62728" : "#2ca02c")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5);

    // Texto centrado dentro del círculo
    node.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .style("fill", "black")
        .style("font-size", "10px")
        .text(d => d.data.child_name || d.data.node_name || d.data.child);

});
