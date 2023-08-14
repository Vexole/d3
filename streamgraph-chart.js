function updateStreamgraph() {
  d3.csv(csvUrl).then(function (covidData) {
    getCovidData(covidData);

    const margin = { top: 60, right: 70, bottom: 120, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    const svg = setupD3Select(
      "#streamgraph-chart",
      width,
      height,
      margin,
      margin.left,
      margin.top
    );

    const stack = d3
      .stack()
      .keys(["malePatients", "femalePatients", "deaths", "recoveredPatients"]);
    const stackedData = stack(covidData);

    const xScale = d3
      .scaleBand()
      .domain(covidData.map((d) => `${d.month}, ${d.year}`))
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(stackedData, (d) => d3.max(d, (d) => d[1]))])
      .nice()
      .range([height, 0]);

    const area = d3
      .area()
      .x((d) => xScale(`${d.data.month}, ${d.data.year}`))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveBasis);

    const areas = svg
      .selectAll(".area")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("class", "area")
      .attr("d", area)
      .style("fill", (d, i) => ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"][i])
      .attr("opacity", 0); // Initial opacity set to 0 for animation

    areas
      .transition()
      .duration(1000)
      .attr("opacity", 1) // Fading in the areas
      .attr("d", area)
      .delay((d, i) => i * 200);

    // Add x-axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add y-axis
    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    // Add x-axis label
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.top + 30)
      .style("text-anchor", "middle")
      .text("Month and Year");

    // Add y-axis label
    svg
      .append("text")
      .attr("x", -(height / 2))
      .attr("y", -margin.left + 20)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .text("Total Patients");

    const tooltipGroup = svg.append("g").attr("id", "tooltip-group");

    areas.on("mousemove", handleMouseOver).on("mouseout", handleMouseOut);

    function handleMouseOver(event, d) {
      const total = d[d.length - 1][1];
      tooltipGroup.selectAll("*").remove(); // Clear existing tooltips

      const tooltip = tooltipGroup
        .append("g")
        .attr("id", "tooltip")
        .attr(
          "transform",
          `translate(${event.clientX - 75},${yScale(total) - 80})`
        );

      tooltip
        .append("rect")
        .attr("width", 150)
        .attr("height", 70)
        .attr("fill", "rgba(255, 255, 255, 0.95)")
        .attr("rx", 5)
        .attr("ry", 5)
        .style("filter", "url(#tooltip-shadow)");

      tooltip
        .append("text")
        .attr("x", 75)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text(`Total Patients: ${total}`);

      // ... (other text elements for recovered and deaths)

      const defs = svg.select("defs");
      if (!defs.select("#tooltip-shadow").size()) {
        const filter = defs
          .append("filter")
          .attr("id", "tooltip-shadow")
          .attr("x", -70)
          .attr("y", -60)
          .attr("width", 200)
          .attr("height", 150);

        filter
          .append("feDropShadow")
          .attr("dx", 0)
          .attr("dy", 0)
          .attr("stdDeviation", 3)
          .attr("flood-color", "#000")
          .attr("flood-opacity", 0.4);
      }
    }

    function handleMouseOut(event, d) {
      tooltipGroup.selectAll("*").remove(); // Clear tooltips
    }

    // Add chart title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.top + 50)
      .style("text-anchor", "middle")
      .style("font-style", "italic")
      .style("fill", "#666")
      .text("COVID-19 Data Visualization");

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100},${-margin.top + 20})`);

    const legendColors = ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"];
    const legendLabels = [
      "Male Patients",
      "Female Patients",
      "Deaths",
      "Recovered Patients",
    ];

    legendColors.forEach((color, i) => {
      const legendItem = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      legendItem
        .append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", color);
      legendItem
        .append("text")
        .attr("x", 20)
        .attr("y", 10)
        .style("font-size", "12px")
        .style("fill", "black")
        .text(legendLabels[i]);
    });
  });
}
