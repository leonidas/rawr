
class Chart
  constructor: (where, @width, @height, @margin) ->
    @parent = where.append('div')
      .classed("backgroundCanvas", true)
      .style("font-family", "Helvetica")
      .style("font-size", "11")
      .style("position", "relative")
      .style("width", @width)
      .style("height", @height)
    @axesCanvas = @getLayerCanvas("axes")

  getLayerCanvas: (layerName) ->
    @canvases ?= {}
    @canvases[layerName] ?= @parent.append('svg:svg')
      .classed("#{layerName}Layer", true)
      .style("position", "absolute")
      .style("left", 0)
      .style("right", 0)
      .style("width", @width)
      .style("height", @height)

  draw: (data, styles) ->
    @calculateScale(data)
    @drawXLabels()
    @drawYLabels()
    _.each(data, 
      (layer, index) => @updateDataLayer(layer, styles, index)
    )

  calculateScale: (data) ->
    totalX = d3.max(data, (layer) -> d3.sum(layer, (item) -> item.width))
    maxY   = d3.max(_.flatten(data), (item) -> item.height)
    newXScale = d3.scale.linear()
      .domain([0, totalX])
      .range [@margin, @width - @margin]
    newYScale = d3.scale.linear()
      .domain([0, maxY])
      .range [@height - @margin, @margin]
    @oldXScale = @xScale ? newXScale
    @oldYScale = @yScale ? newYScale
    @xScale = newXScale
    @yScale = newYScale

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
    @yLabels = @parent
      .selectAll(".y-label")
      .data(@yScale.ticks(10), String)

    @yLabels.enter()
      .append("div")
      .attr("class", "y-label")
      .style("position", "absolute")
      .style("text-align", "right")
      .style("left", 0)
      .style("width", @margin - 5)
      .style("top", (i) => @oldYScale(i) - 5)
      .text(String)

    @yLabels
      .transition()
      .duration(500)
      .style("top", (i) => @yScale(i) - 5)

    @yLabels.exit()
      .transition()
      .duration(500)
      .style("top", (i) => @yScale(i) - 5)
      .style("opacity", "0")
      .remove()

  updateDataLayer: (data, styles, layerName) ->
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

    console.log(data)

    chartCanvas = @getLayerCanvas(layerName)

    xScale = @xScale
    yScale = @yScale
    labelY = @height - @margin - 3


    rectG = chartCanvas
      .selectAll('.bar')
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
        .attr("class", 'bar')
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
