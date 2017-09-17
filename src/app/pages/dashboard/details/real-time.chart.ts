import * as d3 from 'd3';

export class RealTimeChart {
  private data = [];
  private width: number;
  private height: number;
  private duration: number;
  private chartItem: string;
  private minutes: number;
  private chart;
  private x;
  private y;
  private line;
  private path;
  private areaPath;
  private smoothLine;
  private lineArea;
  private xAxis;
  private axisX;
  private yAxis;
  private axisY;
  private minValue = 0;
  private maxValue = 0;

  constructor(options: any) {
    for (const field in options) {
      this[field] = options[field];
    }
    this.chart = d3.select(this.chartItem)
      .attr('width', this.width)
      .attr('height', this.height + 50);
    this.x = d3.scaleLinear().domain([0, this.width]).range([0, this.width - 14]);
    this.y = d3.scaleLinear().domain([0, this.height]).range([this.height, 0]);
    // -----------------------------------
    this.line = d3.line()
      .x((d) => this.x(d.x))
      .y((d) => this.y(d.y));
    this.smoothLine = d3.line().curve(d3.curveCardinal)
      .x((d) => this.x(d.x))
      .y((d) => this.y(d.y));
    this.lineArea = d3.area()
      .x((d) => this.x(d.x))
      .y0(this.y(0))
      .y1((d) => this.y(d.y))
      .curve(d3.curveCardinal);
    // -----------------------------------
    // Draw the axis
    this.xAxis = d3.axisBottom()
      .scale(this.x)
      .tickFormat(d3.timeFormat('%H:%M:%S'));

    this.yAxis = d3.axisLeft(this.y);

    this.axisX = this.chart.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(20, ${this.height})`)
      .call(this.xAxis);

    this.axisY = this.chart.append('g')
      .attr('transform', `translate(20)`)
      .call(this.yAxis);

    // // Draw the grid
    let step = 20;
    while (step <= this.height) {
      this.chart.append('path').datum([{ x: 20, y: step }, { x: this.width + 15, y: step }])
        .attr('class', 'grid')
        .attr('d', this.line);
      this.chart.append('path').datum([{ x: step, y: 0 }, { x: step, y: this.height }])
        .attr('class', 'grid')
        .attr('d', this.line);
      step += 50;
    }
    step = 20;
    while (step <= this.width + 15) {
      this.chart.append('path').datum([{ x: step, y: 0 }, { x: step, y: this.height }])
        .attr('class', 'grid')
        .attr('d', this.line);
      step += 50;
    }
    // Append the holder for line chart and fill area
    this.path = this.chart.append('path');
    this.areaPath = this.chart.append('path');
  }

  public addPoint(point) {
    this.minValue = this.minValue > point.y ? point.y : this.minValue;
    this.maxValue = this.maxValue > point.y ? this.maxValue : point.y;
    this.data.push(point);
    // Draw new line
    this.path.datum(this.data)
      .attr('class', 'smoothLine')
      .attr('d', this.smoothLine);
    // Draw new fill area
    this.areaPath.datum(this.data)
      .attr('class', 'area')
      .attr('d', this.lineArea);
    // Shift the chart left
    const severalMinAgo = new Date(point.x);
    severalMinAgo.setMinutes(severalMinAgo.getMinutes() - this.minutes);
    this.x.domain([severalMinAgo, point.x]);
    this.y.domain([this.minValue - 10, this.maxValue + 20]);
    this.axisX.transition()
      .duration(this.duration)
      .ease(d3.easeLinear, 3)
      .call(this.xAxis);

    this.axisY
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear, 3)
      .call(this.yAxis);

    this.path.attr('transform', null)
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear, 3)
      .attr('transform', `translate(${this.x(severalMinAgo)})`);
    this.areaPath.attr('transform', null)
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear, 3)
      .attr('transform', `translate(${this.x(severalMinAgo)})`);
    if (this.data.length > this.minutes * 60) {
      this.data.shift();
    }
  }

}