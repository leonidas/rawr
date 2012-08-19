
class Chart
  constructor: (where, @width, @height, @margin) ->
    @parent = where.append('div')
      .classed("backgrondCanvas", true)
      .style("font-family", "Helvetica")
      .style("font-size", "11")
      .style("position", "relative")
      .style("width", @width)
      .style("height", @height)
    @axesCanvas = @parent.append('svg:svg')
      .classed("axesCanvas", true)
      .style("position", "absolute")
      .style("left", 0)
      .style("right", 0)
      .style("width", @width)
      .style("height", @height)
    @chartCanvas = @parent.append('svg:svg')
      .classed("chartCanvas", true)
      .style("position", "absolute")
      .style("left", 0)
      .style("right", 0)
      .style("width", @width)
      .style("height", @height)

  draw: (data, styles) ->
    @calculateScale(data)
    @drawXLabels()
    @drawYLabels()
    @drawDataRectangles(data, styles)

  calculateScale: (data) ->
    totalX = d3.sum(data, (d) -> d.width)
    maxY   = d3.max(data, (d) -> d.height)
    @oldXScale = @xScale ? @margin
    @oldYScale = @yScale ? @height - @margin
    @xScale = d3.scale.linear().domain([0, totalX]).range [@margin, @width - @margin]
    @yScale = d3.scale.linear().domain([0, maxY]).range [@height - @margin, @margin]

  drawXLabels: () ->
    @xLabels = @axesCanvas
      .selectAll(".x-label")
      .data(@xScale.ticks(10), String)

    @xLabels.enter()
      .append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", @oldXScale)
      .attr("y", @height - @margin + 15)
      .text(String)

    @xLabels
      .transition()
      .duration(500)
      .attr("x", @xScale)

    @xLabels.exit()
      .transition()
      .duration(500)
      .attr("x", @xScale)
      .style("opacity", "0")
      .remove()


  drawYLabels: () ->
    @yLabels = @axesCanvas
      .selectAll(".y-label")
      .data(@yScale.ticks(10), String)

    @yLabels.enter()
      .append("text")
      .attr("class", "y-label")
      .attr("alignment-baseline", "middle")
      .attr("text-anchor", "end")
      .attr("x", @margin - 5)
      .attr("y", @oldYScale)      
      .text(String)

    @yLabels
      .transition()
      .duration(500)
      .attr("y", @yScale)

    @yLabels.exit()
      .transition()
      .duration(500)
      .attr("y", @yScale)
      .style("opacity", "0")
      .remove()

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
        d.__startX__ = accumulator
        accumulator += d.width
      )    
    addStartingX(data)

    xScale = @xScale
    yScale = @yScale
    labelY = @height - @margin - 3

    console.log(data)

    rectG = @chartCanvas
      .selectAll('.' + className)
      .data(data, (d) -> "#{d.title}-#{d.__indexWithinGroup__}")

    # Transition existing rectangles
    rectG
      .select("rect")
        .attr("style", (d) -> styles[d.title])
      .transition()
      .duration(500)
        .attr("x", (d) -> xScale(d.__startX__))
        .attr("width", (d) -> xScale(d.__startX__ + d.width) - xScale(d.__startX__))
        .attr("y", (d) -> yScale(d.height))
        .attr("height", ((d) -> if d.height > 0 then yScale(0) - yScale(d.height) else 3))

    # Create new rectangles and transition them
    newRectG = rectG.enter()
      .append("g")
        .attr("class", className)
    newRectG
      .append("rect")
        .attr("style", (d) -> styles[d.title])
        .attr("x", (d) -> xScale(d.__startX__))
        .attr("width", (d) -> xScale(d.__startX__ + d.width) - xScale(d.__startX__))
        .attr("y", (d) -> yScale(0))
      .transition()
      .delay(500)
      .duration(500)
        .attr("x", (d) -> xScale(d.__startX__))
        .attr("width", (d) -> xScale(d.__startX__ + d.width) - xScale(d.__startX__))
        .attr("y", (d) -> yScale(d.height))
        .attr("height", ((d) -> if d.height > 0 then yScale(0) - yScale(d.height) else 3))

    # Create new labels
    newRectG
      .append("g")
        .attr("class", "box-label")
      .append("text")
        .attr("transform", "rotate(270)")

    # Update all labels
    rectG
      .select("g")
        .attr("transform", (d) -> 
          "translate(#{xScale(d.__startX__) + 11},#{labelY})")
      .select("text")
        .text((d) -> 
          if d.__indexWithinGroup__ == 0
            d.title
          else
            ""
        )

    # Remove exiting rectangels and labels
    rectG.exit()
      .remove();



window.Chart = Chart
