const apiUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

fetch(apiUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return response.json();
  })
  .then((data) => {
    const height = 500,
          width = 1000,
          padding = 60;

    const minFormatTime = d3.timeFormat('%M:%S'),
          minParseTime = d3.timeParse('%M:%S'),
          yearFormatTime = d3.timeFormat('%Y'),
          yearParseTime = d3.timeParse('%Y');

    const dataset = data.map((item) => {
      const result = {
        ...item,
        Time: minParseTime(item.Time),
        Year: yearParseTime(item.Year)
      }
      return result
    });

    const xScale = d3.scaleTime()
                     .domain(d3.extent(dataset, (item) => item.Year))
                     .range([padding, width - padding]),
          
          yScale = d3.scaleLinear()
                     .domain(d3.extent(dataset, (item) => item.Time))
                     .range([padding, height - padding]);
  
    const xAxis = d3.axisBottom(xScale).tickFormat(yearFormatTime),
          yAxis = d3.axisLeft(yScale).tickFormat(minFormatTime);
  
    const chart = d3.select("body")
                    .append('div')
                    .attr('id', 'chart'),
          
          title = chart.append('h1')
                       .attr('id',  'title')
                       .text('Doping in Professional Bicycle Racing'),
          
          svg = chart.append('svg')
                     .attr('width', width)
                     .attr('height', height),
          
          tooltip = chart.append('div')
                         .attr('id', 'tooltip')
                         .style('opacity', 0),
          
          circles = svg.selectAll('circle')
                       .data(dataset)
                       .enter()
                       .append('circle')
                       .attr('class', 'dot' )
                       .attr('r', 5 )
                       .attr('cx', function(item) {
                         return xScale(item.Year)
                       } )
                       .attr('cy', function(item) {
                         return yScale(item.Time)
                       } )
                       .attr('data-xvalue', function(item) {
                         return yearFormatTime(item.Year)
                       } )
                       .attr('data-yvalue', function(item) {
                         return item.Time.toISOString()
                       } )
                       .attr('fill', function(item) {
                         return item.Doping === '' ? 'green' : 'red'
                       })
                       .on('mouseover', function(event, item) {
                         const { clientX, clientY } = event

                         tooltip.transition().duration(300).style('opacity', 1)
                         tooltip
                           .attr('data-year', yearFormatTime(item.Year))
                           .style('left', clientX - 60 + 'px')
                           .style('top', clientY + 'px')
                           .html(
                               item.Name + ': ' + item.Nationality +
                               '<br>' +
                               'Year: ' + yearFormatTime(item.Year) + ', Time: ' + minFormatTime(item.Time) +
                               '<br>' +
                               item.Doping
                           )
                       })
                      .on('mouseout', function() {
                        tooltip.transition().duration(300).style('opacity', 0)
                      })
    

    svg.append('g')
       .attr('id', 'x-axis')
       .attr('transform', 'translate(0, ' + (height - padding) + ')')
       .call(xAxis),
          
    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', 'translate(' + padding + ', 0)')
       .call(yAxis)

  const legendData = ['Riders with doping allegations', 'No doping allegations'],
        legendWidth = 20,
        legendHeight = 20,
        legendX = width - 300;

  const legend = svg.append('g')
                    .attr('id', 'legend');
  
  legend.selectAll('rect')
        .data(legendData)
        .enter()
        .append('rect')
        .attr('x', legendX)
        .attr('y', function(d, i) { return 15 + i * 30 })
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', function(d, i) { return i === 0 ? 'red' : 'green' });
  
  legend.selectAll('text')
        .data(legendData)
        .enter()
        .append('text')
        .attr('x', (legendX + legendWidth + 5))
        .attr('y', function(d, i) { return 30 + i * 30 })
        .text(function(d) { return d });
  
  });