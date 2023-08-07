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

    const groups = ['malePatients', 'femalePatients', 'childPatients'];
    const color = d3.scaleOrdinal().domain(groups).range(d3.schemeCategory10);

    const margin = { top: 20, right: 30, bottom: 150, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select('#grouped-bar-chart')
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
      .domain([
        0,
        d3.max(covidData, (d) => d3.max(groups, (group) => d[group])),
      ])
      .nice()
      .range([height, 0]);

      const xAxis = svg
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-65)');

    const yAxis = svg
      .append('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale).ticks(5));

    const bars = svg
      .selectAll('.bar')
      .data(covidData)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr(
        'transform',
        (d) => `translate(${xScale(`${d.month}, ${d.year}`)},0)`
      );

    bars
      .selectAll('rect')
      .data((d) => 
        groups.map((group) => ({
          key: group,
          value: d[group],
          month: d.month,
          year: d.year,
          totalPatients: d.totalPatients
        }))
      )
      .enter()
      .append('rect')
      .attr(
        'x',
        (d) => (xScale.bandwidth() / groups.length) * groups.indexOf(d.key)
      )
      .attr('y', (d) => yScale(d.value))
      .attr('width', xScale.bandwidth() / groups.length)
      .attr('height', (d) => height - yScale(d.value))
      .attr('fill', (d) => color(d.key))
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut);

    const legend = svg
      .selectAll('.legend')
      .data(groups)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${width},${i * 20})`);

    legend
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', color);

    legend
      .append('text')
      .attr('x', -24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text((d) => d);

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.top + 80)
      .style('text-anchor', 'middle')
      .text('Month, Year');

    svg
      .append('text')
      .attr('x', -(height / 2))
      .attr('y', -margin.left + 20)
      .attr('transform', 'rotate(-90)')
      .style('text-anchor', 'middle')
      .text('Patients Count');

    function handleMouseOver(event, d) {
      const total = d.totalPatients;
      if (total === 0) return;

      const percent = ((d.value / total) * 100).toFixed(2);
      d3.select(this).attr('fill', 'orange');
      svg
        .append('text')
        .attr('class', 'tooltip')
        .attr(
          'x',
          xScale(`${d.month}, ${d.year}`) +
            (xScale.bandwidth() / groups.length) * groups.indexOf(d.key) +
            xScale.bandwidth() / groups.length / 2
        )
        .attr('y', yScale(d.value) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(`${d.value} (${percent}%)`);
    }

    function handleMouseOut(event, d) {
      d3.select(this).attr('fill', color(d.key));
      svg.select('.tooltip').remove();
    }
  });
});
