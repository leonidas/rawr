
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

  calculateScale: (data) ->
    totalX = d3.sum(data, (d) -> d.width)
    maxY   = d3.max(data, (d) -> d.height)
    @xScale = d3.scale.linear().domain([0, totalX]).range [@margin, @width - @margin]
    @yScale = d3.scale.linear().domain([0, maxY]).range [@height - @margin, @margin]

  drawXLabels: () ->
    @xLabels = @chart
      .selectAll(".x-label")
      .data(@xScale.ticks(10))

    @xLabels
      .enter()
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")

    @xLabels
      .attr("x", @xScale)
      .attr("y", @height - @margin + 15)
      .text(String)

    @xLabels.exit().remove()


  drawYLabels: () ->
    @yLabels = @chart
      .selectAll(".y-label")
      .data(@yScale.ticks(10))

    @yLabels
      .enter()
      .append("text")
      .attr("class", "y-label")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "end")

    @yLabels
      .attr("x", @margin - 5)
      .attr("y", @yScale)
      .text(String)

    @yLabels.exit().remove()

  drawDataRectangles: (data, styles, className = 'layer1') ->
    addIndexWithinGroup = (data) ->
      groupCounts = {}

      _(data).each((d) -> 
        groupCounts[d.title] ?= 0
        d.__indexWithinGroup__ = groupCounts[d.title]
        groupCounts[d.title] += 1
      )
    addIndexWithinGroup(data)

    addStartingX = (data) ->
      accumulator = 0
      _(data).map((d) ->
        d.__start_x__ = accumulator
        accumulator += d.width
      )    
    addStartingX(data)

    xScale = @xScale
    yScale = @yScale
    labelY = @height - @margin - 3

    console.log(data)

    @rectG = @chart
      .selectAll('.' + className)
      .data(data, (d) -> "#{d.title}-#{d.__indexWithinGroup__}")

    @rectG
      .select("rect")
        .attr("style", (d) -> styles[d.title])
      .transition()
      .duration(500)
        .attr("x", (d) -> xScale(d.__start_x__))
        .attr("width", (d) -> xScale(d.__start_x__ + d.width) - xScale(d.__start_x__))
        .attr("y", (d) -> yScale(d.height))
        .attr("height", ((d) -> if d.height > 0 then yScale(0) - yScale(d.height) else 3))

    newRectG = @rectG
      .enter()
      .append("g")
        .attr("class", className)

    newRectG
      .append("rect")
        .attr("x", (d) -> xScale(d.__start_x__))
        .attr("width", (d) -> xScale(d.__start_x__ + d.width) - xScale(d.__start_x__))
        .attr("y", (d) -> yScale(0))

    newRectG
      .append("g")
        .attr("class", "box-label")
      .append("text")
        .attr("transform", "rotate(270)")

    @rectG
      .select("rect")
        .attr("style", (d) -> styles[d.title])
      .transition()
      .delay(500)
      .duration(500)
        .attr("x", (d) -> xScale(d.__start_x__))
        .attr("width", (d) -> xScale(d.__start_x__ + d.width) - xScale(d.__start_x__))
        .attr("y", (d) -> yScale(d.height))
        .attr("height", ((d) -> if d.height > 0 then yScale(0) - yScale(d.height) else 3))

    @rectG
      .select("g")
        .attr("transform", (d) -> 
          "translate(#{xScale(d.__start_x__) + 11},#{labelY})")
      .select("text")
        .text((d) -> d.title if d.__indexWithinGroup__ == 0)

    @rectG
      .exit()
      .remove();



window.Chart = Chart
