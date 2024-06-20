import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import * as d3 from "d3";

function App() {
  const [monthly, setMonthly] = useState(null);
  const [base, setBase] = useState(null);
  const marginLeft = 100;
  const width = 1600;
  const height = 600;
  const marginRight = 20;
  const bottomMargin = 150;
  const cellHeight = (height - bottomMargin) / 12;
  const cellwidth = (width - marginLeft) / (28 * 12);

  const getColor = (v, vRange) => {
    const r = v + base;
    if (r <= vRange[1]) {
      return "darkblue";
    } else if (r <= vRange[2]) {
      return "blue";
    } else if (r <= vRange[3]) {
      return "cornflowerblue";
    } else if (r <= vRange[4]) {
      return "skyblue";
    } else if (r <= vRange[5]) {
      return "powderblue";
    } else if (r <= vRange[6]) {
      return "lemonchiffon";
    } else if (r <= vRange[7]) {
      return "khaki";
    } else if (r <= vRange[8]) {
      return "gold";
    } else if (r <= vRange[9]) {
      return "goldenrod";
    } else if (r <= vRange[10]) {
      return "orangered";
    } else if (r <= vRange[11]) {
      return "red";
    } else {
      return "darkred";
    }
  };

  const colors = [
    "darkblue",
    "blue",
    "cornflowerblue",
    "skyblue",
    "powderblue",
    "lemonchiffon",
    "khaki",
    "gold",
    "goldenrod",
    "orangered",
    "red",
    "darkred",
  ];

  const doWork = () => {
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0)
      .style("width", "fit-content")
      .style("height", "fit-content")
      .style("background-color", "rgba(0,0,0,0.7)")
      .style("color", "white")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("text-align", "center");
    const yearMonth = tooltip.append("p").style("margin", 0);
    const ttemp = tooltip.append("p").style("margin", 0);
    const tvarience = tooltip.append("p").style("margin", 0);

    console.log(monthly);
    const vrange = d3
      .range(
        d3.min(monthly, (d) => d.variance),
        d3.max(monthly, (d) => d.variance)
      )
      .map((r) => r + base);

    const svg = d3.select("svg");
    const xscale = d3
      .scaleLinear()
      .domain([d3.min(monthly, (d) => d.year), d3.max(monthly, (d) => d.year)])
      .range([marginLeft, width - marginRight]);

    const yscale = d3
      .scaleBand()
      .range([5, height - bottomMargin])
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

    svg
      .append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0,${height - bottomMargin})`)
      .call(d3.axisBottom(xscale).ticks(28).tickFormat(d3.format("d")));
    svg
      .append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(
        d3.axisLeft(yscale).tickFormat((month) => {
          const m = new Date(0);
          m.setMonth(month);
          return m.toLocaleDateString("default", { month: "long" });
        })
      );
    svg
      .selectAll("rect")
      .data(monthly)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => `${xscale(d.year)}`)
      .attr("y", (d) => `${yscale(d.month - 1)}`)
      .attr("width", cellwidth)
      .attr("height", cellHeight)
      .style("fill", (d) => `${getColor(d.variance, vrange)}`)
      .style("stroke", (d) => `${getColor(d.variance, vrange)}`)
      .attr("data-month", (d) => d.month - 1)
      .attr("data-year", (d) => d.year)
      .attr("data-temp", (d) => d.variance + base)
      .on("mouseenter", (e) => {
        e.target.style.stroke = "black";
        console.log(e);
        const m = new Date(0);
        m.setMonth(e.target.__data__.month);
        yearMonth.text(
          `${e.target.__data__.year} - ${m.toLocaleDateString("default", {
            month: "long",
          })}`
        );
        tooltip.attr("data-year", e.target.__data__.year);
        tooltip.style("top", `${e.pageY - cellHeight}px`);
        tooltip.style("left", `${e.pageX + 5}px`);
        tooltip.style("visibility", "visible");
        ttemp.text(`${(e.target.__data__.variance + base).toFixed(1)}°C`);
        tvarience.text(`${e.target.__data__.variance.toFixed(1)}°C`);
      })
      .on("mouseout", (e) => {
        e.target.style.stroke = e.target.style.fill;
        tooltip.style("visibility", "hidden");
      });

    const legendx = d3
      .scaleLinear()
      .range([marginLeft + 20, width / 3 - 20])
      .domain(d3.extent(vrange));

    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(0,${height - 100})`);

    legend
      .append("g")
      .attr("transform", `translate(0,80)`)
      .call(
        d3.axisBottom(legendx).tickValues(vrange).tickFormat(d3.format(".1f"))
      );
    legend
      .selectAll("rect")
      .data(vrange)
      .enter()
      .append("rect")
      .attr("transform", `translate(${marginLeft + 20},45)`)
      .style("width", 33)
      .style("height", 33)
      .style("fill", (d, i) => (colors[i] ? colors[i] : "white"))
      .style("stroke", (d, i) => (i < 12 ? "black" : "white"))
      .attr("x", (d, i) => 33 * i);
  };

  useEffect(() => {
    const fet = async () => {
      const res = await fetch(
        "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
      );
      const data = await res.json();
      setBase(data.baseTemperature);
      setMonthly(data.monthlyVariance);
    };
    if (!monthly) {
      fet();
    } else {
      doWork();
    }
  }, [monthly]);

  return (
    <>
      <h2 id="title" className="text-center">
        Monthly Global Land-Surface Temperature
      </h2>
      <h3 id="description" className="text-center">
        1753 - 2015: base temperature 8.66℃
      </h3>
      <div id="svgContainer">
        <svg style={{ height: height, width: width }}></svg>
      </div>
    </>
  );
}

export default App;
