function updateGroupedBarChart() {
  d3.csv(csvUrl).then(function (covidData) {
    getCovidData(covidData);

    const groups = ['malePatients', 'femalePatients', 'childPatients'];
    const color = d3.scaleOrdinal().domain(groups).range(d3.schemeCategory10);

    const margin = { top: 20, right: 30, bottom: 125, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const nestedData = d3.group(covidData, (d) => `${d.month}, ${d.year}`);

    const svg = setupD3Select(
      '#grouped-bar-chart',
      width,
      height,
      margin,
      margin.left,
      margin.top
    );

    const xScale = d3
      .scaleBand()
      .domain([...nestedData.keys()])
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
      .data(nestedData)
      .enter()
      .append('g')
      .attr('class', 'bar')
      .attr('transform', (d) => `translate(${xScale(d[0])},0)`);

    bars
      .selectAll('rect')
      .data((d) =>
        groups.map((group) => ({
          key: group,
          value: d3.sum(d[1], (item) => item[group]),
          month: d[1][0].month,
          year: d[1][0].year,
          totalPatients: d3.sum(d[1], (item) => item.totalPatients),
        }))
      )
      .enter()
      .append('rect')
      .attr('x', (d, i) => (xScale.bandwidth() / groups.length) * i)
      .attr('y', yScale(0))
      .attr('width', xScale.bandwidth() / groups.length)
      .attr('height', 0)
      .attr('fill', (d) => color(d.key))
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .transition()
      .duration(500)
      .delay((d, i) => i * 100)
      .attr('y', (d) => yScale(d.value))
      .attr('height', (d) => height - yScale(d.value));

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
      .text((d) => {
        if (d === 'malePatients') return 'Male Patients';
        if (d === 'femalePatients') return 'Female Patients';
        if (d === 'childPatients') return 'Child Patients';
      });

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

    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', height + margin.top + 100)
      .style('text-anchor', 'middle')
      .text('Grouped Bar Chart');

    function handleMouseOver(event, d) {
      const total = d.totalPatients;
      if (total === 0) return;

      const percent = ((d.value / total) * 100).toFixed(2);

      d3.select(this).attr('fill', 'orange').style('cursor', 'pointer');

      svg
        .append('rect')
        .attr('class', 'tooltip-bg')
        .attr(
          'x',
          xScale(`${d.month}, ${d.year}`) +
            (xScale.bandwidth() / groups.length) * groups.indexOf(d.key) +
            xScale.bandwidth() / groups.length / 2 -
            40
        )
        .attr('y', yScale(d.value) - 30)
        .attr('width', 80)
        .attr('height', 20)
        .attr('rx', 5)
        .attr('ry', 5)
        .style('fill', 'white')
        .style('opacity', 0.8);

      svg
        .append('text')
        .attr('class', 'tooltip-text')
        .attr(
          'x',
          xScale(`${d.month}, ${d.year}`) +
            (xScale.bandwidth() / groups.length) * groups.indexOf(d.key) +
            xScale.bandwidth() / groups.length / 2
        )
        .attr('y', yScale(d.value) - 15)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text(`${d.value} (${percent}%)`);
    }

    function handleMouseOut(event, d) {
      d3.select(this).attr('fill', color(d.key)).style('cursor', 'default');
      svg.selectAll('.tooltip-bg').remove();
      svg.selectAll('.tooltip-text').remove();
    }
  });
}
