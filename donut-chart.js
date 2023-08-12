function midAngle(d) {
  return d.startAngle + (d.endAngle - d.startAngle) / 2;
}

function updateDonutChart() {
  d3.csv(csvUrl).then(function (covidData) {
    getCovidData(covidData);

    const margin = { top: 20, right: 30, bottom: 100, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = setupD3Select(
      '#donut-chart',
      width,
      height,
      margin,
      width / 2,
      height / 2
    );

    const radius = Math.min(width, height) / 2;

    const color = d3
      .scaleOrdinal()
      .domain(['Male', 'Female', 'Children'])
      .range(['steelblue', 'orange', 'green']);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    const data = [
      { name: 'Male', value: d3.sum(covidData, (d) => d.malePatients) },
      { name: 'Female', value: d3.sum(covidData, (d) => d.femalePatients) },
      { name: 'Children', value: d3.sum(covidData, (d) => d.childrenPatients) },
    ];

    const path = d3
      .arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

    const arcLabel = d3
      .arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

    const outerArc = d3
      .arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    const arc = svg
      .selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arc
      .append('path')
      .attr('d', path)
      .attr('fill', (d) => color(d.data.name))
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .transition()
      .duration(800)
      .attrTween('d', function (d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function (t) {
          return path(interpolate(t));
        };
      });

    arc
      .append('polyline')
      .attr('class', 'polyline')
      .attr('stroke', (d) => color(d.data.name))
      .attr('stroke-width', '1px')
      .attr('fill', 'none')
      .style('opacity', 0)
      .transition()
      .duration(800)
      .style('opacity', 1)
      .attr('points', function (d) {
        const pos = outerArc.centroid(d);
        pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
        return [path.centroid(d), arcLabel.centroid(d), pos];
      });

    arc
      .append('text')
      .attr('class', 'annotation')
      .attr('dy', '.35em')
      .attr('transform', function (d) {
        const pos = outerArc.centroid(d);
        pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style('text-anchor', (d) => (midAngle(d) < Math.PI ? 'start' : 'end'))
      .text((d) => `${d.data.name}: ${d.data.value}`);

    function handleMouseOver(event, d) {
      const percent = ((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100;
      d3.select(this).attr('fill', 'purple');
      svg
        .append('text')
        .attr('class', 'percent-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', '16px')
        .text(`${percent.toFixed(2)}%`);
    }

    function handleMouseOut(event, d) {
      d3.select(this).attr('fill', color(d.data.name));
      svg.select('.percent-label').remove();
    }

    const legend = svg
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(160, ${i * 40})`);

    legend
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d) => color(d.name));

    legend
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .text((d) => d.name);

    svg
      .append('text')
      .attr('x', 0)
      .attr('y', height / 2 + margin.bottom - 10)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('COVID-19 Gender Distribution');

    svg
      .append('text')
      .attr('x', 0)
      .attr('y', height / 2 + margin.bottom + 10)
      .style('text-anchor', 'middle')
      .style('font-style', 'italic')
      .style('fill', '#666')
      .style('font-size', '12px')
      .text('Hover over segments for details');
  });
}
