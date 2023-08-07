document.addEventListener('DOMContentLoaded', function () {
  let currentChartType = 'barChart';
  const margin = { top: 40, right: 30, bottom: 100, left: 100 };
  const width = 800 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;
  let svg = d3
    .select('#chart')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const navButtons = document.querySelectorAll('nav ul li');

  const csvUrl = 'https://raw.githubusercontent.com/Vexole/ems/main/covid.csv';

  function updateBarChart() {
    svg.selectAll('*').remove();

    d3.csv(csvUrl).then(function (covidData) {
      covidData.forEach(function (d) {
        d.totalPatients = +d.totalPatients;
        d.malePatients = +d.malePatients;
        d.femalePatients = +d.femalePatients;
        d.deaths = +d.deaths;
        d.recoveredPatients = +d.recoveredPatients;
      });

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
  }

  function updateDonutChart() {
    svg.selectAll('*').remove();

    d3.csv(csvUrl).then(function (covidData) {
      covidData.forEach(function (d) {
        d.totalPatients = +d.totalPatients;
        d.malePatients = +d.malePatients;
        d.femalePatients = +d.femalePatients;
        d.childrenPatients = +d.childrenPatients;
        d.deaths = +d.deaths;
        d.recoveredPatients = +d.recoveredPatients;
      });

      const margin = { top: 20, right: 30, bottom: 60, left: 60 };
      const width = 400 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      svg = svg
        .attr('transform', `translate(${width / 2},${height / 2})`);

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
        { name: 'Children', value: d3.sum(covidData, (d) => d.childPatients) },
      ];

      const path = d3
        .arc()
        .outerRadius(radius - 10)
        .innerRadius(radius - 70);

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
        .on('mouseout', handleMouseOut);

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
    });
  }

  function updatePieChart(data) {
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2;
    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = svg
      .selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i));

    // Add legends
    // ...
  }

  function updateScatterPlot() {
    svg.selectAll('*').remove();

    d3.csv(csvUrl).then(function (covidData) {
      covidData.forEach(function (d) {
        d.totalPatients = +d.totalPatients;
        d.malePatients = +d.malePatients;
        d.femalePatients = +d.femalePatients;
        d.childrenPatients = +d.childrenPatients;
        d.deaths = +d.deaths;
        d.recoveredPatients = +d.recoveredPatients;
      });

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
  }

  function updateGroupedBarChart() {
    svg.selectAll('*').remove();

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
            totalPatients: d.totalPatients,
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
        .attr('y', height + margin.top + 55)
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

        const tooltip = svg
          .append('g')
          .attr('class', 'tooltip-group')
          .style('pointer-events', 'none');

        tooltip
          .append('rect')
          .attr('class', 'tooltip-bg')
          .attr('fill', 'white')
          .style('opacity', 0.7)
          .attr('rx', 5)
          .attr('ry', 5);

        const text = tooltip
          .append('text')
          .attr('class', 'tooltip-text')
          .attr(
            'x',
            xScale(`${d.month}, ${d.year}`) +
              (xScale.bandwidth() / groups.length) * groups.indexOf(d.key) +
              xScale.bandwidth() / groups.length / 2
          )
          .attr('y', yScale(d.value) - 20)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .style('font-weight', 'bold')
          .text(`${d.value} (${percent}%)`);

        const bbox = text.node().getBBox();
        const padding = 12;

        tooltip
          .select('.tooltip-bg')
          .attr('x', bbox.x - padding)
          .attr('y', bbox.y - padding)
          .attr('width', bbox.width + 2 * padding)
          .attr('height', bbox.height + 2 * padding);
      }

      function handleMouseOut(event, d) {
        d3.select(this).attr('fill', color(d.key));
        svg.selectAll('.tooltip-group').remove();
      }
    });
  }

  function updateBubbleChart() {
    svg.selectAll('*').remove();

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

      svg = svg
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
  }

  function updateChart() {
    if (currentChartType === 'barChart') {
      updateBarChart();
    } else if (currentChartType === 'donutChart') {
      updateDonutChart();
    } else if (currentChartType === 'pieChart') {
      // Call the respective update function for the pie chart...
    } else if (currentChartType === 'scatterPlot') {
      updateScatterPlot();
    } else if (currentChartType === 'groupedBarChart') {
      updateGroupedBarChart();
    } else if (currentChartType === 'bubbleChart') {
      updateBubbleChart();
    }
  }

  navButtons.forEach((button) => {
    button.addEventListener('click', function () {
      currentChartType = this.id;
      updateChart();
    });
  });

  updateChart();
});
