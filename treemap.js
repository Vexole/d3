function updateTreemap() {
  d3.csv(csvUrl).then(function (covidData) {
    getCovidData(covidData);

    const width = 800;
    const height = 600;

    const svg = d3
      .select("#treemap-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const root = d3
      .hierarchy({ name: "COVID-19 Data", children: covidData })
      .sum((d) => d.totalPatients)
      .sort((a, b) => b.value - a.value);

    const treemap = d3.treemap().size([width, height]).padding(1);

    treemap(root);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    svg
      .selectAll("rect")
      .data(root.leaves())
      .enter()
      .append("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d, i) => color(i))
      .attr("opacity", 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr("opacity", 0.7);

    svg
      .selectAll("text")
      .data(root.leaves())
      .enter()
      .append("text")
      .attr("x", (d) => (d.x0 + d.x1) / 2)
      .attr("y", (d) => (d.y0 + d.y1) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .text((d) => d.data.month.substr(0, 3) + "/" + d.data.year.substring(d.data.year.length - 2))
      .style("fill", "white");

    const tooltip = d3
      .select("#treemap-chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    svg
      .selectAll("rect")
      .on("mouseover", (event, d) => {
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `Month: ${d.data.month}<br>Year: ${d.data.year}<br>Total Patients: ${d.data.totalPatients}`
          )
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
  });
}
