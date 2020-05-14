const drawGraph = function (data) {
  const height = 600;
  const width = 1200;
  const svg = d3
    .select('#graph')
    .append('svg')
    .attr('height', height + 200)
    .attr('width', width + 200);

  const g = svg.append('g').attr('transform', 'translate(100, 30)');

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => `${d.district} (${d.active})`))
    .range([0, width])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((d) => d.active))])
    .range([height, 0]);

  g.append('g')
    .call(d3.axisLeft(yScale).ticks(20))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -60)
    .attr('y', -60)
    .attr('stroke', 'black')
    .text('Cases');

  const xAxis = g
    .append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScale));
  xAxis
    .selectAll('text')
    .attr('dx', '-0.8em')
    .attr('dy', '-0.0em')
    .attr('text-anchor', 'end')
    .attr('transform', 'rotate(-45)');
  xAxis
    .append('text')
    .attr('x', width / 2)
    .attr('y', 90)
    .attr('stroke', 'black')
    .text('Districts');

  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(`${d.district} (${d.active})`))
    .attr('y', (d) => yScale(d.active))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d.active));
};

const parse = (data) => {
  const state = data.find((d) => d.state === 'Telangana');
  return state.districtData;
};

const main = function () {
  fetch('https://api.covid19india.org/v2/state_district_wise.json', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then(parse)
    .then((data) => console.log(data) || data)
    .then(drawGraph);
  setTimeout(main, 1800000);
};
window.onload = main;
