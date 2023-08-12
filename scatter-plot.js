function updateScatterPlot() {
  d3.csv(csvUrl).then(function (covidData) {
    getCovidData(covidData);
    const margin = { top: 60, right: 150, bottom: 100, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = setupD3Select(
      '#scatter-plot',
      width,
      height,
      margin,
      margin.left,
      margin.top
    );

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(covidData, (d) => d.totalPatients + 5000)])
      .range([0, width]);

    const yScale = d3
      .scalePoint()
      .domain(covidData.map((d) => `${d.month}, ${d.year}`))
      .range([height, 0]);

    svg
      .selectAll('circle')
      .data(covidData)
      .enter()
      .append('circle')
      .attr('cx', (d) => 0)
      .attr('cy', (d) => yScale(`${d.month}, ${d.year}`))
      .attr('r', 5)
      .attr('fill', 'steelblue')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .transition()
      .duration(800)
      .delay((d, i) => i * 100)
      .attr('cx', (d) => xScale(d.totalPatients));

    function handleMouseOver(event, d) {
      d3.select(this).attr('fill', 'purple');
      const tooltip = svg
        .append('g')
        .attr('class', 'tooltip')
        .attr(
          'transform',
          `translate(${xScale(d.totalPatients)},${yScale(
            `${d.month}, ${d.year}`
          )})`
        );

      const tooltipRect = tooltip
        .append('rect')
        .attr('x', 10)
        .attr('y', -20)
        .attr('width', 150)
        .attr('height', 40)
        .attr('fill', 'rgba(255, 255, 255, 0.9)')
        .attr('rx', 5)
        .attr('ry', 5);

      tooltip
        .append('text')
        .attr('x', 85)
        .attr('y', 0)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', 'black')
        .text(`Total Patients: ${d.totalPatients}`);

      tooltip
        .append('text')
        .attr('x', 85)
        .attr('y', 15)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', 'black')
        .text(`Date: ${d.month}, ${d.year}`);
    }

    function handleMouseOut(event, d) {
      d3.select(this).attr('fill', 'steelblue');
      svg.select('.tooltip').remove();
    }

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Month and Year');

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.top)
      .style('text-anchor', 'middle')
      .text('Total Patients');

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('COVID-19 Total Patients Scatter Plot');

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.top + 20)
      .style('text-anchor', 'middle')
      .style('font-style', 'italic')
      .style('fill', '#666')
      .style('font-size', '12px')
      .text('Hover over circles for details');
  });
}
