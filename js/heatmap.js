const apiUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

fetch(apiUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  })
  .then(data => {
    const baseTemperature = data.baseTemperature,
          monthlyVariance = data.monthlyVariance;

    const fontSize = 16,
          width = 1300,
          height = 400,
          padding = {
            left: 6 * fontSize,
            right: 1 * fontSize,
            top: 2 * fontSize,
            bottom: 5 * fontSize
          };
  
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    const yearFormatTime = d3.timeFormat('%Y'),
          yearParseTime = d3.timeParse('%Y');
  
    const xScale = d3.scaleTime()
                     .domain(
                       d3.extent(monthlyVariance, function(item) { return yearParseTime(item.year) })
                     )
                     .range([padding.left, width - padding.right]),
          
          yScale = d3.scaleBand()
                     .domain(months)
                     .range([height, 0]),
          
          colorScale = d3.scaleSequential(d3.interpolateRgbBasis(['darkBlue', 'royalBlue', 'skyBlue', 'tan', 'indianRed', 'fireBrick', 'darkRed']))
                         .domain(
                          d3.extent(monthlyVariance, function(item) { return baseTemperature + item.variance })
                         );
  
    const xAxis = d3.axisBottom(xScale).tickFormat(yearFormatTime),

          yAxis = d3.axisLeft(yScale),

          colorAxis = d3.axisBottom(colorScale);

    const chart = d3.select('body')
                      .append('div')
                      .attr('id', 'chart'),

          heading = chart.append('heading')
                         .attr('class', 'heading'),

          title = heading.append('h1')
                         .attr('id',  'title')
                         .text('Monthly Global Land-Surface Temperature'),

          description = heading.append('h3')
                               .attr('id', 'description')
                               .html(
                                 data.monthlyVariance[0].year +
                                 ' - ' +
                                 data.monthlyVariance[data.monthlyVariance.length - 1].year +
                                 ': base temperature ' +
                                 data.baseTemperature +
                                 '&#8451;'
                               ),

          svg = chart.append('svg')
                      .attr('width', width + padding.left + padding.right)
                      .attr('height', height + padding.top + padding.bottom),

          tooltip = chart.append('div')
                          .attr('id', 'tooltip')
                          .style('opacity', 0),

          bar = svg.selectAll('rect')
                    .data(monthlyVariance) 
                    .enter() 
                    .append('rect')
                    .attr('transform', 'translate(' + padding.left + ', ' + padding.top + ')')
                    .attr('class', 'cell')
                    .attr('width', width / (monthlyVariance.length / 12))
                    .attr('height', height / 12)
                    .attr('fill', function(item) { return colorScale(baseTemperature + item.variance) })
                    .attr('x', function(item) { return xScale(yearParseTime(item.year)) })
                    .attr('y', function(item) { return yScale(months[item.month - 1]) })
                    .attr('data-month', function(item) { return item.month - 1 })
                    .attr('data-year', function(item) { return item.year })
                    .attr('data-temp', function(item) { return baseTemperature + item.variance })
                    .on('mouseover', function(event, item) {
                      const { layerX, layerY } = event
                      tooltip.transition().duration(300).style('opacity', 1)
                      tooltip
                             .attr('data-year', item.year)
                             .style('left', layerX + 'px')
                             .style('top', layerY + 15 + 'px')
                             .html(
                               item.year + ' - ' + months[item.month - 1] +
                               '<br>' +
                               (baseTemperature + item.variance) +
                               '<br>' +
                               item.variance
                             )
                    })
                    .on('mouseout', function() {
                      tooltip.transition().duration(300).style('opacity', 0)
                    })

    svg.append('g')
        .attr('id', 'x-axis')
        .attr('transform', 'translate(' + padding.left + ', ' + (height + padding.top) + ')')
        .call(xAxis);

    svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', 'translate(' + (padding.left * 2) + ', ' + padding.top + ')')
       .call(yAxis);
  
    const legendWidth = 300,
          legendHeight = 20,
          legendRectSize = 30;

    const legendSvg = svg.append('g')
                         .attr('id', 'legend')
                         .attr('transform', 'translate(' + padding.left + ', ' + (height + 5) + ')'),

          legend = legendSvg.selectAll('g')
                            .data(colorScale.ticks(6))
                            .enter()
                            .append('g')
                            .attr('transform', function(d, i) {
                              return 'translate('
                                + (width / 2 + i * legendRectSize - padding.left)
                                + ', '
                                + (padding.top * 2) + ')'
                            });

    legend.append('rect')
          .attr('width', legendRectSize)
          .attr('height', legendHeight)
          .style('fill', d => colorScale(d));

    legend.append('text')
          .attr('x', legendRectSize / 2)
          .attr('y', legendHeight + 15)
          .style('text-anchor', 'middle')
          .text(d => d.toFixed(1));
  })