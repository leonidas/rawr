
class Chart
  constructor: (@width, @height, @margin) ->
    @chart = d3.select('body').append('svg:svg')
      .attr('width', @width)
      .attr('height', @height)
      .style("font-family", "Helvetica")
      .style("font-size", "11")

  draw: (data, colors) ->
    addStartingX = (data) ->
      accumulator = 0
      _(data).map((d) ->
        d.start_x = accumulator
        accumulator += d.width
      )    

    addDisplayText = (data) ->
      previous_t = ""
      _(data).each((d) -> 
        if previous_t != d.title
          d.display_text = d.title
          previous_t = d.title
        else
          d.display_text = ""
      )

    addStartingX(data)
    addDisplayText(data)

    totalX = d3.sum(data, (d) -> d.width)
    maxY   = d3.max(data, (d) -> d.height)

    xScale = d3.scale.linear().domain([0, totalX]).range [@margin, @width - @margin]
    yScale = d3.scale.linear().domain([0, maxY]).range [@height - @margin, @margin]

    @drawXLabels(xScale)
    @drawYLabels(yScale)
    @drawDataRectangles(data, colors, xScale, yScale)
    @drawRectangleLabels(data, xScale)

  drawXLabels: (xScale) ->
    @chart.selectAll(".x-label")
      .data(xScale.ticks(10))
    .enter().append("text")
      .attr("class", "x-label")
      .attr("x", xScale)
      .attr("y", @height - @margin + 15)
      .attr("text-anchor", "middle")
      .text(String)

  drawYLabels: (yScale) ->
    @chart.selectAll(".y-label")
        .data(yScale.ticks(10))
      .enter().append("text")
        .attr("class", "y-label")
        .attr("x", @margin - 5)
        .attr("y", yScale)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text(String)

  drawDataRectangles: (data, colors, xScale, yScale) ->
    @chart.selectAll('rect')
        .data(data)
      .enter().append("rect")
        .attr("x", (d) -> xScale(d.start_x))
        .attr("width", (d) -> xScale(d.start_x + d.width) - xScale(d.start_x))
        .attr("y", (d) -> yScale(d.height))
        .attr("height", ((d) -> if d.height > 0 then yScale(0) - yScale(d.height) else 3))
        .style("fill", (d) -> colors[d.title])

  drawRectangleLabels: (data, xScale) ->
    @chart.selectAll('.box-label')
        .data(data)
      .enter().append("g")
        .attr("class", "box-label")
        .attr("transform", (d) -> 
          "translate(#{xScale(d.start_x) + 11},#{@height - @margin - 3})")
        .append("text")
          .text((d) -> d.display_text)
          .attr("transform", "rotate(270)")


jQuery ->

  d3.text "colors.csv", (csv_colors) ->
    console.log(csv_colors)
    d3.text "data.csv", (csv_data) ->
      console.log(csv_data)

      colors = _(d3.csv.parse(csv_colors)).reduce(
        ((result, pair) -> 
          result[pair.title] = pair.color
          result),
        {}
      )
      console.log(colors)

      data = d3.csv.parse(csv_data).map (d) ->
        title: d.title
        width: parseFloat d.width
        height: parseFloat d.height
      console.log(data)

      margin = 25
      width = 800
      height = 500

      chart = new Chart(width, height, margin)
      chart.draw(data, colors)