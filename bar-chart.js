document.addEventListener('DOMContentLoaded', function () {
  const csvUrl = 'https://raw.githubusercontent.com/Vexole/ems/main/covid.csv';

  d3.csv(csvUrl).then(function (covidData) {
    covidData.forEach(function (d) {
      d.totalPatients = +d.totalPatients;
      d.malePatients = +d.malePatients;
      d.femalePatients = +d.femalePatients;
      d.deaths = +d.deaths;
      d.recoveredPatients = +d.recoveredPatients;
    });

    const margin = { top: 40, right: 30, bottom: 100, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select('#bar-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(covidData.map((d) => `${d.month}, ${d.year}`))
      .range([0, width])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(covidData, (d) => d.totalPatients)])
      .range([height, 0]);

    const bars = svg
      .selectAll('.bar')
      .data(covidData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => xScale(`${d.month}, ${d.year}`))
      .attr('y', (d) => yScale(d.totalPatients))
      .attr('width', xScale.bandwidth())
      .attr('height', (d) => height - yScale(d.totalPatients))
      .attr('fill', 'steelblue')
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScale));

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.top + 50)
      .style('text-anchor', 'middle')
      .text('Month and Year');

    svg
      .append('text')
      .attr('x', -(height / 2))
      .attr('y', -margin.left + 20)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .text('Total Patients');

    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - 100},${-margin.top + 20})`);

    legend
      .append('rect')
      .attr('width', 10)
      .attr('height', 10)
      .attr('fill', 'steelblue');

    legend.append('text').attr('x', 15).attr('y', 10).text('Total Patients');

    function handleMouseOver(event, d) {
      d3.select(this).attr('fill', 'orange');

      svg
        .append('text')
        .attr('id', 'tooltip')
        .attr('x', xScale(`${d.month}, ${d.year}`) + xScale.bandwidth() / 2)
        .attr('y', yScale(d.totalPatients) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('padding', '16px')
        .style('background-color', 'white')
        .text(d.totalPatients);
    }

    function handleMouseOut(event, d) {
      d3.select(this).attr('fill', 'steelblue');
      svg.select('#tooltip').remove();
    }
  });
});
