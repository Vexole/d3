function updatePieChart() {
  d3.csv(csvUrl).then(function (covidData) {
    getCovidData(covidData);

    const width = 500;
    const height = 600;
    const radius = Math.min(width, height) / 2.5;

    const svg = d3
      .select("#pie-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .style("position", "relative")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie().value((d) => d.totalPatients);

    const dataReady = pie(covidData);

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = svg
      .selectAll("arc")
      .data(dataReady)
      .enter()
      .append("path")
      .attr("d", arcGenerator({ startAngle: 0, endAngle: 0 })) // Initial animation setup
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    arcs
      .transition()
      .duration(800)
      .attrTween("d", function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return arcGenerator(interpolate(t));
        };
      });

    // Adding labels with data
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
      .attr("dy", "0.35em")
      .text((d) => `${d.data.month}\nTotal: ${d.data.totalPatients}`)
      .style("text-anchor", "middle")
      .style("font-size", "12px");

    // Tooltip
    const tooltip = d3
      .select("#pie-chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "5px")
      .style("border-radius", "3px");

    function handleMouseOver(event, d) {
      d3.select(this).transition().duration(200).attr("d", createHoverArc(d));

      tooltip.transition().duration(200).style("opacity", 0.9);

      tooltip
        .html(
          `<strong>${d.data.month.substr(0, 3) + "/" + d.data.year.substring(d.data.year.length - 2)}</strong><br> Total: ${d.data.totalPatients}`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    }

    function handleMouseOut(event, d) {
      d3.select(this).transition().duration(200).attr("d", arcGenerator);

      tooltip.transition().duration(500).style("opacity", 0);
    }

    function createHoverArc(d) {
      const hoverRadius = radius + 10;
      const arc = d3.arc().innerRadius(0).outerRadius(hoverRadius);
      return arc(d);
    }

    svg
      .append("text")
      .attr("y", 260)
      .style("text-anchor", "middle")
      .style("font-style", "italic")
      .style("fill", "#666")
      .text("COVID-19 Data Visualization");
  });
}
