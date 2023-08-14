function updateLineChart() {
  d3.csv(csvUrl).then(function (covidData) {
    getCovidData(covidData);

    const margin = { top: 60, right: 70, bottom: 120, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 420 - margin.top - margin.bottom;

    const svg = setupD3Select(
      "#line-chart",
      width,
      height,
      margin,
      margin.left,
      margin.top
    );

    const xScale = d3
      .scaleBand()
      .domain(covidData.map((d) => `${d.month}, ${d.year}`))
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(covidData, (d) => d.totalPatients)])
      .range([height, 0]);

    const line = d3
      .line()
      .x((d) => xScale(`${d.month}, ${d.year}`) + xScale.bandwidth() / 2)
      .y((d) => yScale(d.totalPatients))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(covidData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line)
      .transition()
      .duration(1000)
      .attrTween("d", pathTween(line));

    svg
      .selectAll(".dot")
      .data(covidData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr(
        "cx",
        (d) => xScale(`${d.month}, ${d.year}`) + xScale.bandwidth() / 2
      )
      .attr("cy", (d) => yScale(d.totalPatients))
      .attr("r", 0)
      .attr("fill", "steelblue")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .transition()
      .delay((d, i) => i * 50)
      .duration(500)
      .attr("r", 4);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.top + 30)
      .style("text-anchor", "middle")
      .text("Month and Year");

    svg
      .append("text")
      .attr("x", -(height / 2))
      .attr("y", -margin.left + 20)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .text("Total Patients");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.top + 50)
      .style("text-anchor", "middle")
      .style("font-style", "italic")
      .style("fill", "#666")
      .text("COVID-19 Data Visualization");

    function handleMouseOver(event, d) {
      d3.select(this).attr("r", 6).attr("fill", "orange");

      const tooltip = svg
        .append("g")
        .attr("id", "tooltip")
        .attr(
          "transform",
          `translate(${
            xScale(`${d.month}, ${d.year}`) + xScale.bandwidth() / 2
          },${yScale(d.totalPatients)})`
        );

      const tooltipRect = tooltip
        .append("rect")
        .attr("x", -70)
        .attr("y", -60)
        .attr("width", 150)
        .attr("height", 70)
        .attr("fill", "rgba(255, 255, 255, 0.95)")
        .attr("rx", 5)
        .attr("ry", 5)
        .style("filter", "url(#tooltip-shadow)");

      tooltip
        .append("text")
        .attr("x", 0)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "black")
        .text(`Total Patients: ${d.totalPatients}`);

      tooltip
        .append("text")
        .attr("x", 5)
        .attr("y", -25)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black")
        .text(`Recovered Patients: ${d.recoveredPatients}`);

      tooltip
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black")
        .text(`Deaths: ${d.deaths}`);

      const defs = svg.append("defs");

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

    function handleMouseOut(event, d) {
      d3.select(this).attr("r", 4).attr("fill", "steelblue");
      svg.select("#tooltip").remove();
    }
  });
}

function pathTween(path) {
  return function (data) {
    var interpolate = d3.interpolateArray(data, data);
    return function (t) {
      return path(interpolate(t));
    };
  };
}
