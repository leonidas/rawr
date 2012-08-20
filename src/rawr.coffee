
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

  getLayerCanvas: (layerName) =>
    @canvases ?= {}
    @canvases[layerName] ?= @parent.append('div')
      .classed("#{layerName}Layer", true)
      .style("position", "absolute")
      .style("left", 0)
      .style("right", 0)
      .style("width", @width)
      .style("height", @height)

  draw: (data, styles) =>
    @calculateScale(data)
    @drawXLabels()
    @drawYLabels()
    _.each(data, 
      (layer, index) => @updateDataLayer(layer, styles, index)
    )

  calculateScale: (data) =>
    totalX = d3.max(data, (layer) => d3.sum(layer, (item) => item.width))
    maxY   = d3.max(_.flatten(data), (item) => item.height)
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

  drawXLabels: () =>
    labelWidth = 30

    @xLabels = @axesCanvas
      .selectAll(".x-label")
      .data(@xScale.ticks(10), String)

    @xLabels.enter()
      .append("div")
      .attr("class", "x-label")
      .style("position", "absolute")        
      .style("text-align", "center")
      .style("left", (i) => @oldXScale(i) - labelWidth / 2)
      .style("width", labelWidth)
      .style("top", @height - @margin + 5)
      .style("opacity", "0")
      .text(String)

    @xLabels
      .transition()
      .duration(500)
      .style("opacity", "1")
      .style("left", (i) => @xScale(i) - labelWidth / 2)

    @xLabels.exit()
      .transition()
      .duration(500)
      .style("left", (i) => @xScale(i) - labelWidth / 2)
      .style("opacity", "0")
      .remove()


  drawYLabels: () =>
    labelHeight = 12

    @yLabels = @axesCanvas
      .selectAll(".y-label")
      .data(@yScale.ticks(10), String)

    @yLabels.enter()
      .append("div")
      .attr("class", "y-label")
      .style("position", "absolute")
      .style("text-align", "right")
      .style("left", 0)
      .style("width", @margin - 5)
      .style("top", (i) => @oldYScale(i) - labelHeight / 2)
      .style("height", labelHeight)
      .style("opacity", "0")
      .text(String)

    @yLabels
      .transition()
      .duration(500)
      .style("opacity", "1")
      .style("top", (i) => @yScale(i) - labelHeight / 2)

    @yLabels.exit()
      .transition()
      .duration(500)
      .style("top", (i) => @yScale(i) - labelHeight / 2)
      .style("opacity", "0")
      .remove()

  updateDataLayer: (data, styles, layerName) =>
    addIndexWithinGroup = (data) =>
      groupCounts = {}

      _(data).each((d) => 
        groupCounts[d.title] ?= 0
        d.__indexWithinGroup__ = groupCounts[d.title]
        groupCounts[d.title] += 1
      )
    addIndexWithinGroup(data)

    addStartingX = (data) =>
      accumulator = 0
      _(data).map((d) =>
        d.__startX__ = accumulator
        accumulator += d.width
      )    
    addStartingX(data)

    console.log(data)

    chartCanvas = @getLayerCanvas(layerName)

    xScale = @xScale
    yScale = @yScale
    labelY = @height - @margin - 3

    rect = chartCanvas
      .selectAll('.rect')
      .data(data, (d) => "#{d.title}-#{d.__indexWithinGroup__}")

    # Transition existing rectangles
    rect
      .style("position", "absolute")
      .text((d) => 
          if d.__indexWithinGroup__ == 0
            d.title
          else
            ""
        )      
      .transition()
      .duration(500)
        .style("left", (d) => Math.round(xScale(d.__startX__)))
        .style("right", (d) => Math.round(@width - xScale(d.__startX__ + d.width)))
        .style("top", (d) => Math.round(yScale(d.height)))
        .style("bottom", @margin)

    # Create new rectangles and transition them
    rect.enter()
      .append("div")
        .attr("class", "rect")
        .attr("style", (d) => styles[d.title])
        .style("position", "absolute")
        .style("left", (d) => Math.round(xScale(d.__startX__)))
        .style("right", (d) => Math.round(@width - xScale(d.__startX__ + d.width)))
        .style("top", @height - @margin)
        .style("bottom", @margin)
        .text((d) => 
            if d.__indexWithinGroup__ == 0
              d.title
            else
              ""
          )        
      .transition()
      .delay(500)
      .duration(500)
        .style("top", (d) => Math.round(yScale(d.height)))

    # Remove exiting rectangels
    rect.exit()
      .remove();



window.Chart = Chart
