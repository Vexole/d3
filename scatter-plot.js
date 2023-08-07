document.addEventListener('DOMContentLoaded', function () {
  const csvUrl = 'https://raw.githubusercontent.com/Vexole/ems/main/covid.csv';

  d3.csv(csvUrl).then(function (covidData) {
    covidData.forEach(function (d) {
      d.totalPatients = +d.totalPatients;
      d.malePatients = +d.malePatients;
      d.femalePatients = +d.femalePatients;
      d.childrenPatients = +d.childrenPatients;
      d.deaths = +d.deaths;
      d.recoveredPatients = +d.recoveredPatients;
    });

    const margin = { top: 20, right: 30, bottom: 90, left: 90 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select('#scatter-plot')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(covidData, (d) => d.malePatients + 5000)])
      .range([0, width - 100]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(covidData, (d) => d.femalePatients + 5000)])
      .range([height, 0]);

    svg
      .selectAll('circle')
      .data(covidData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.malePatients))
      .attr('cy', (d) => yScale(d.femalePatients))
      .attr('r', 5)
      .attr('fill', 'steelblue')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    function handleMouseOver(event, d) {
      const tooltip = svg
        .append('text')
        .attr('class', 'tooltip')
        .attr('x', xScale(d.malePatients))
        .attr('y', yScale(d.femalePatients) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(`Male: ${d.malePatients}, Female: ${d.femalePatients}`);
    }

    function handleMouseOut(event, d) {
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
      .attr('x', width / 2)
      .attr('y', height + margin.top + 30)
      .style('text-anchor', 'middle')
      .text('Male Patients');

    svg
      .append('text')
      .attr('x', -(height / 2))
      .attr('y', -margin.left + 20)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .text('Female Patients');
  });
});
