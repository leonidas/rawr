(function() {
  var Chart;

  Chart = (function() {

    function Chart(width, height, margin) {
      this.width = width;
      this.height = height;
      this.margin = margin;
      this.chart = d3.select('body').append('svg:svg').attr('width', this.width).attr('height', this.height).style("font-family", "Helvetica").style("font-size", "11");
    }

    Chart.prototype.draw = function(data, colors) {
      var addDisplayText, addStartingX, maxY, totalX, xScale, yScale;
      addStartingX = function(data) {
        var accumulator;
        accumulator = 0;
        return _(data).map(function(d) {
          d.start_x = accumulator;
          return accumulator += d.width;
        });
      };
      addDisplayText = function(data) {
        var previous_t;
        previous_t = "";
        return _(data).each(function(d) {
          if (previous_t !== d.title) {
            d.display_text = d.title;
            return previous_t = d.title;
          } else {
            return d.display_text = "";
          }
        });
      };
      addStartingX(data);
      addDisplayText(data);
      totalX = d3.sum(data, function(d) {
        return d.width;
      });
      maxY = d3.max(data, function(d) {
        return d.height;
      });
      xScale = d3.scale.linear().domain([0, totalX]).range([this.margin, this.width - this.margin]);
      yScale = d3.scale.linear().domain([0, maxY]).range([this.height - this.margin, this.margin]);
      this.drawXLabels(xScale);
      this.drawYLabels(yScale);
      this.drawDataRectangles(data, colors, xScale, yScale);
      return this.drawRectangleLabels(data, xScale);
    };

    Chart.prototype.drawXLabels = function(xScale) {
      return this.chart.selectAll(".x-label").data(xScale.ticks(10)).enter().append("text").attr("class", "x-label").attr("x", xScale).attr("y", this.height - this.margin + 15).attr("text-anchor", "middle").text(String);
    };

    Chart.prototype.drawYLabels = function(yScale) {
      return this.chart.selectAll(".y-label").data(yScale.ticks(10)).enter().append("text").attr("class", "y-label").attr("x", this.margin - 5).attr("y", yScale).attr("text-anchor", "end").attr("alignment-baseline", "middle").text(String);
    };

    Chart.prototype.drawDataRectangles = function(data, colors, xScale, yScale) {
      return this.chart.selectAll('rect').data(data).enter().append("rect").attr("x", function(d) {
        return xScale(d.start_x);
      }).attr("width", function(d) {
        return xScale(d.start_x + d.width) - xScale(d.start_x);
      }).attr("y", function(d) {
        return yScale(d.height);
      }).attr("height", (function(d) {
        if (d.height > 0) {
          return yScale(0) - yScale(d.height);
        } else {
          return 3;
        }
      })).style("fill", function(d) {
        return colors[d.title];
      });
    };

    Chart.prototype.drawRectangleLabels = function(data, xScale) {
      return this.chart.selectAll('.box-label').data(data).enter().append("g").attr("class", "box-label").attr("transform", function(d) {
        return "translate(" + (xScale(d.start_x) + 11) + "," + (this.height - this.margin - 3) + ")";
      }).append("text").text(function(d) {
        return d.display_text;
      }).attr("transform", "rotate(270)");
    };

    return Chart;

  })();

  jQuery(function() {
    return d3.text("colors.csv", function(csv_colors) {
      console.log(csv_colors);
      return d3.text("data.csv", function(csv_data) {
        var chart, colors, data, height, margin, width;
        console.log(csv_data);
        colors = _(d3.csv.parse(csv_colors)).reduce((function(result, pair) {
          result[pair.title] = pair.color;
          return result;
        }), {});
        console.log(colors);
        data = d3.csv.parse(csv_data).map(function(d) {
          return {
            title: d.title,
            width: parseFloat(d.width),
            height: parseFloat(d.height)
          };
        });
        console.log(data);
        margin = 25;
        width = 800;
        height = 500;
        chart = new Chart(width, height, margin);
        return chart.draw(data, colors);
      });
    });
  });

}).call(this);
