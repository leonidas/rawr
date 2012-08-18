
class Chart
  constructor: (where, @width, @height, @margin) ->
    @chart = where.append('svg:svg')
      .attr('width', @width)
      .attr('height', @height)
      .style("font-family", "Helvetica")
      .style("font-size", "11")

  draw: (data, styles) ->
    @calculateScale(data)
    @drawXLabels()
    @drawYLabels()
    @drawDataRectangles(data, styles)
    @drawRectangleLabels(data)

  calculateScale: (data) ->
    totalX = d3.sum(data, (d) -> d.width)
    maxY   = d3.max(data, (d) -> d.height)
    @xScale = d3.scale.linear().domain([0, totalX]).range [@margin, @width - @margin]
    @yScale = d3.scale.linear().domain([0, maxY]).range [@height - @margin, @margin]


  drawXLabels: () ->
    @chart.selectAll(".x-label")
      .data(@xScale.ticks(10))
    .enter().append("text")
      .attr("class", "x-label")
      .attr("x", @xScale)
      .attr("y", @height - @margin + 15)
      .attr("text-anchor", "middle")
      .text(String)

  drawYLabels: () ->
    @chart.selectAll(".y-label")
        .data(@yScale.ticks(10))
      .enter().append("text")
        .attr("class", "y-label")
        .attr("x", @margin - 5)
        .attr("y", @yScale)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(String)

  drawDataRectangles: (data, styles, className = 'layer1') ->
    addDisplayText = (data) ->
      previous_t = ""
      _(data).each((d) -> 
        if previous_t != d.title
          d.display_text = d.title
          previous_t = d.title
        else
          d.display_text = ""
      )

    addDisplayText(data)

    addStartingX = (data) ->
      accumulator = 0
      _(data).map((d) ->
        d.start_x = accumulator
        accumulator += d.width
      )    
    addStartingX(data)

    xScale = @xScale
    yScale = @yScale

    console.log(data)

    @chart.selectAll('.' + className)
        .data(data)
      .enter().append("rect")
        .attr("class", className)
        .attr("x", (d) -> xScale(d.start_x))
        .attr("width", (d) -> xScale(d.start_x + d.width) - xScale(d.start_x))
        .attr("y", (d) -> yScale(d.height))
        .attr("height", ((d) -> if d.height > 0 then yScale(0) - yScale(d.height) else 3))
        .attr("style", (d) -> styles[d.title])

  drawRectangleLabels: (data) ->
    xScale = @xScale
    labelY = @height - @margin - 3
    @chart.selectAll('.box-label')
        .data(data)
      .enter().append("g")
        .attr("class", "box-label")
        .attr("transform", (d) -> 
          "translate(#{xScale(d.start_x) + 11},#{labelY})")
        .append("text")
          .text((d) -> d.display_text)
          .attr("transform", "rotate(270)")

window.Chart = Chart
