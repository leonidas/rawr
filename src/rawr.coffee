
class Chart
  constructor: (where, @width, @height, @margin, @styles) ->
    @parent = where.append('div')
      .classed("backgroundCanvas", true)
      .style("font-family", "Helvetica")
      .style("font-size", "11")
      .style("position", "relative")
      .style("width", @width)
      .style("height", @height)
    @axesCanvas = @_getLayerCanvas("axes")
    @allTimeSeriesNames = []
    @pageCount = 0

  setData: (data) =>
    @data = @_hierarchizeData(data)
    @pageNames = _.keys(@data)
    @pageCount = @pageNames.length
    @currentPageNumber = 0
    @allTimeSeriesNames = @_trackAllTimeSeriesNames(@allTimeSeriesNames, @data)

    @_calculateScale(@data)
    @_drawXLabels()
    @_drawYLabels()
    @_drawPage(@pageNames[@currentPageNumber])

  setPageNumber: (pageNumber) =>
    @currentPageNumber = _.max([0, _.min([pageNumber, @pageNames.length])])
    @_drawPage(@pageNames[@currentPageNumber])

  _drawPage: (pageName) =>
    _.each(@allTimeSeriesNames, (seriesName) =>
      @_updateDataLayer(seriesName, @data[pageName][seriesName] ? [])
    )

  _hierarchizeData: (data) =>
    hierarchicalData = _.groupBy(data, "page")
    _.each(_.keys(hierarchicalData), (page) =>
      hierarchicalData[page] = _.groupBy(hierarchicalData[page], "series")
    )
    return hierarchicalData

  _trackAllTimeSeriesNames: (allTimeSeriesNames, data) =>
    currentSeriesNames = _.uniq(_.flatten(_.map(data, (pageData) -> _.keys(pageData))))
    _.uniq(allTimeSeriesNames.concat(currentSeriesNames))

  _getLayerCanvas: (layerName) =>
    @canvases ?= {}
    @canvases[layerName] ?= @parent.append('div')
      .classed("#{layerName}Layer", true)
      .style("position", "absolute")
      .style("left", 0)
      .style("right", 0)
      .style("width", @width)
      .style("height", @height)

  _calculateScale: (data) =>
    maxX = d3.max(_.values(data),
      (pageData) => d3.max(_.values(pageData),
        (layerData) => d3.sum(layerData,
          (dataItem) => dataItem.width)))
    maxY = d3.max(_.values(data),
      (pageData) => d3.max(_.values(pageData),
        (layerData) => d3.max(layerData,
          (dataItem) => dataItem.height)))
    newXScale = d3.scale.linear()
      .domain([0, maxX])
      .range [@margin, @width - @margin]
    newYScale = d3.scale.linear()
      .domain([0, maxY])
      .range [@height - @margin, @margin]
    @oldXScale = @xScale ? newXScale
    @oldYScale = @yScale ? newYScale
    @xScale = newXScale
    @yScale = newYScale

  _drawXLabels: () =>
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


  _drawYLabels: () =>
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

  _addOwnParamsToData: (data) =>
    groupCounts = {}
    _(data).each((d) => 
      groupCounts[d.title] ?= 0
      d.__indexWithinGroup__ = groupCounts[d.title]
      groupCounts[d.title] += 1
    )

    accumulator = 0
    _(data).each((d) =>
      d.__startX__ = accumulator
      accumulator += d.width
    )

  _updateDataLayer: (layerName, data) =>
    @_addOwnParamsToData(data)

    chartCanvas = @_getLayerCanvas(layerName)

    xScale = @xScale
    yScale = @yScale
    labelY = @height - @margin - 3

    rect = chartCanvas
      .selectAll('.rect')
      .data(data, (d) => "#{d.title}-#{d.subtitle}")

    # Make rounding of exact halves to the same direction much rarer.
    epsilon = 0.00000001

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
        .style("left", (d) => Math.round(xScale(d.__startX__) + epsilon))
        .style("right", (d) => Math.round(@width - xScale(d.__startX__ + d.width) - epsilon))
        .style("top", (d) => Math.round(yScale(d.height)))
        .style("bottom", @margin)

    # Create new rectangles and transition them
    rect.enter()
      .append("div")
        .attr("class", "rect")
        .attr("style", (d) => @styles[d.title])
        .style("position", "absolute")
        .style("left", (d) => Math.round(xScale(d.__startX__) + epsilon))
        .style("right", (d) => Math.round(@width - xScale(d.__startX__ + d.width) - epsilon))
        .style("top", @height - @margin)
        .style("bottom", @margin)
        .style("color", "rgba(0,0,0,0)")
        .text((d) => 
            if d.__indexWithinGroup__ == 0
              d.title
            else
              ""
          )        
      .transition()
      .delay(500)
      .duration(500)
        .style("color", "rgba(0,0,0,1)")
        .style("top", (d) => Math.round(yScale(d.height)))

    # Remove exiting rectangels
    rect.exit()
      .transition()
      .duration(250)
      .style("opacity", 0)
      .remove();



window.Chart = Chart
