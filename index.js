const sortByAscend = (a, b) => a.active < b.active ? 1 : a.active > b.active ? -1 : 0;

const colors = {
  'Red': 'rgb(239, 74, 60)',
  'Orange': 'rgb(244, 141, 63)',
  'Green' : 'rgb(107, 204, 89)',
  'cornflowerblue': 'cornflowerblue',
  'Unknown': 'cornflowerblue'
};

const getDelta = function(data, c) {
  const number = data.reduce((val, d) => val + d.delta[c], 0);
  return number ? ` ↑${number}` : '';
};

const getColor = function(dist, zones) {
  const district = zones.find(zone => zone.district == dist);
  const color = (district && district.zone) || 'cornflowerblue';
  return colors[color];
};

const drawGraph = function (statesData, zones, state = 'Telangana') {
  const height = 600;
  const width = 1200;

  document.querySelector('#graph').innerHTML = '';
  document.querySelector('#state-name').innerText = state;

  const svg = d3
    .select('#graph')
    .append('svg')
    .attr('viewBox', `0 0 ${width + 200} ${height + 200}`);

  const data = parse(statesData, state).sort(sortByAscend);

  const g = svg.append('g').attr('transform', 'translate(100, 10)');

  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.district))
    .range([0, width - 100])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data.map((d) => d.active)) + 50])
    .range([height, 0]);

  g.append('g')
    .call(d3.axisLeft(yScale).ticks(20))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -60)
    .attr('y', -60)
    .attr('stroke', 'black')
    .text('Active Cases');

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

  g.selectAll('.x-line')
    .data(yScale.ticks(20))
    .enter()
    .append('line')
    .attr('class', 'line x-line')
    .attr('x1', 0)
    .attr('y1', (d) => yScale(d))
    .attr('x2', width - 100)
    .attr('y2', (d) => yScale(d));

  g.selectAll('.y-line')
    .data(data)
    .enter()
    .append('line')
    .attr('class', 'line y-line')
    .attr('x1', (d) => xScale(d.district) + xScale.bandwidth() / 2)
    .attr('y1', 0)
    .attr('x2', (d) => xScale(d.district) + xScale.bandwidth() / 2)
    .attr('y2', height);

  g.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', (d) => xScale(d.district))
    .attr('y', (d) => yScale(d.active))
    .attr('width', xScale.bandwidth())
    .attr('height', (d) => height - yScale(d.active))
    .attr('fill', d => getColor(d.district, zones));

  g.selectAll('.value')
    .data(data)
    .enter()
    .append('text')
    .text((d) => d.active)
    .attr('text-anchor', 'middle')
    .attr('x', (d) => xScale(d.district) + xScale.bandwidth() / 2)
    .attr('y', (d) => yScale(d.active) - 2)
    .attr('font-size', 12)
    .attr('fill', 'currentColor')
    .attr('font-weight', 100)
    .attr('font-family', 'sans-serif');

  const texts = [
    {text: 'Total Active Cases', delta: ''},
    {text: 'Total Confirmed Cases', delta: getDelta(data, 'confirmed')},
    {text: 'Total Deceased Cases', delta: getDelta(data, 'deceased')},
    {text: 'Total Recovered Cases', delta: getDelta(data, 'recovered')},
  ];

  const values = data.reduce(
    (val, d) => {
      val[0] += d.active;
      val[1] += d.confirmed;
      val[2] += d.deceased;
      val[3] += d.recovered;
      return val;
    },
    [0, 0, 0, 0]
  );

  console.log(texts)

  g.append('g')
    .attr('transform', 'translate(0, 10)')
    .selectAll('.info')
    .data(texts)
    .enter()
    .append('text')
    .attr('x', width - 95)
    .attr('y', (d, i) => i * 20 + 10)
    .attr('stroke', 'black')
    .attr('font-family', 'sans-serif')
    .attr('font-size', '0.8em')
    .text((d, i) => `${d.text}: ${values[i]} ${d.delta}`);

  const info = [ 'Red', 'Orange', 'Green', 'Unknown' ];

  const zonesInfo = g.selectAll('.zone-info')
    .data(info)
    .enter()
    .append('g')
    .attr('transform', `translate(${width - 100},100)`);

  zonesInfo.append('circle')
    .attr('cx', 13)
    .attr('cy', (d, i) => i * 20 + 20)
    .attr('r', 7)
    .attr('stroke', d => colors[d])
    .attr('fill', d => colors[d]);

  zonesInfo.append('text')
    .attr('transform', 'translate(10, 4)')
    .attr('x',13)
    .attr('y', (d, i) => i * 20 + 20)
    .attr('font-family', 'sans-serif')
    .attr('font-size', '0.8em')
    .text(d => `${d} zone`);

  const  text = [
    '↑ indicates no. of cases',
    'increased since yesterday',
    '( these new cases are',
    'included in total cases',
    ' as well )'];

  g.append('g')
    .attr('transform', `translate(${width - 95}, 200)`)
    .selectAll('text')
    .data(text)
    .enter()
    .append('text')
    .attr('x', (d, i) => i == 0? 0 :15)
    .attr('y', (d, i) => i * 20 + 10)
    .text(d => d)
    .attr('stroke', 'black');
};

const drawSelect = function (data) {
  const select = document.querySelector('#selector');
  const options = data.map((state) => {
    let value = `"${state.state}"`;
    if (value.match(/telangana/i)) {
      value += ' selected';
    }
    return `<option value=${value}>${state.state}</option>`;
  });
  select.innerHTML = options.join('\n');
  return data;
};

const parse = (data, state = 'Telangana') => {
  const stateData = data.find((d) => d.state === state);
  return stateData.districtData;
};

const addListeners = function (data, zones) {
  const select = document.querySelector('#selector');
  select.addEventListener('change', () => {
    const val = select.options[select.selectedIndex].value;
    drawGraph(data, zones, val.trim());
  });
  drawGraph(data, zones, 'Telangana');
};

const loadZonesAndDrawGraphs = function(data) {
  fetch('https://api.covid19india.org/zones.json')
    .then(res => res.json())
    .then(zones => addListeners(data, zones.zones))
};

const main = function () {
  fetch('https://api.covid19india.org/v2/state_district_wise.json')
    .then((res) => res.json())
    .then(drawSelect)
    .then((d) => (data = d))
    .then(loadZonesAndDrawGraphs);
  setTimeout(main, 1800000);
};
window.onload = main;
