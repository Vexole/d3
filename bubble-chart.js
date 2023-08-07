document.addEventListener('DOMContentLoaded', function () {
  const csvUrl = 'https://raw.githubusercontent.com/Vexole/ems/main/covid.csv';

  d3.csv(csvUrl).then(function (covidData) {
    covidData.forEach(function (d) {
      d.totalPatients = +d.totalPatients;
      d.malePatients = +d.malePatients;
      d.femalePatients = +d.femalePatients;
      d.childPatients = +d.childPatients;
      d.deaths = +d.deaths;
      d.recoveredPatients = +d.recoveredPatients;
    });

    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select('#bubble-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(covidData, (d) => d.totalPatients)])
      .nice()
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(covidData, (d) => d.deaths)])
      .nice()
      .range([height, 0]);

    const radiusScale = d3
      .scaleSqrt()
      .domain([0, d3.max(covidData, (d) => d.recoveredPatients)])
      .range([2, 20]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(['male', 'female', 'child'])
      .range(['blue', 'pink', 'purple']);

    const bubbles = svg
      .selectAll('.bubble')
      .data(covidData)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('cx', (d) => xScale(d.totalPatients))
      .attr('cy', (d) => yScale(d.deaths))
      .attr('r', (d) => radiusScale(d.recoveredPatients))
      .attr('fill', (d) => colorScale(d.gender))
      .attr('stroke', 'none')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    svg.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.top + 10)
      .style('text-anchor', 'middle')
      .text('Total Patients');

    svg
      .append('text')
      .attr('x', -(height / 2))
      .attr('y', -margin.left + 20)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .text('Deaths');

    function handleMouseOver(event, d) {
      d3.select(this).attr('stroke', 'black');
    }

    function handleMouseOut(event, d) {
      d3.select(this).attr('stroke', 'none');
    }
  });
});
