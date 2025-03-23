//import d3 from "d3";

const tooltip = d3.select("#tooltip");

const null_chart_svg = d3.select("#null-chart");

const margin = {top: 50, right: 30, bottom: 40, left: 40};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const nullChartGraph = null_chart_svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const missingChartSvg = d3.select("#missing-chart");
const missingChartGraph = missingChartSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const actualChartSvg = d3.select("#actual-chart");
const actualChartGraph = actualChartSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const completenessChartSvg = d3.select("#completeness-chart");
const completenessChartGraph = completenessChartSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const cardinalityChartSvg = d3.select("#cardinality-chart");
const cardinalityChartGraph = cardinalityChartSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const uniquenessChartSvg = d3.select("#uniqueness-chart");
const uniquenessChartGraph = uniquenessChartSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const distinctnessChartSvg = d3.select("#distinctness-chart");
const distinctnessChartGraph = distinctnessChartSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

function nullLength(data, column, missingAsNull = false) {
    if (missingAsNull) {
        return data.filter(d => {
            // Check for different representations of null values
            return d[column] === "null" || 
                   d[column] === null || 
                   d[column] === "NULL" || 
                   d[column] === "Null" ||
                   d[column] === "NA" ||
                   d[column] === "na" ||
                   d[column] === "N/A" ||
                   d[column] === "None" ||
                   d[column] === "" ||
                   d[column] === "missing" ||
                   d[column] === "Missing" ||
                   d[column] === "MISSING";
        }).length
    }else {
        return data.filter(d => {
            // Check for different representations of null values
            return d[column] === "null" || 
                   d[column] === null || 
                   d[column] === "NULL" || 
                   d[column] === "Null" ||
                   d[column] === "NA" ||
                   d[column] === "na" ||
                   d[column] === "N/A" ||
                   d[column] === "None" ||
                   d[column] === "";
        }).length
    }
    
}

d3.csv("retail_sales_dataset.csv").then(data => { 
    const parseDate = d3.timeParse("%Y-%m-%d");
    
    const missingCountsPerColumn = data.columns.map(column => {
        return {
            column: column,
            missing: data.filter(d => d[column] === "missing").length
        };
    });

    const nullCountsPerColumn = data.columns.map(column => {
        return {
            column: column,
            null: nullLength(data, column)
        };
    });

    const actualCountsPerColumn = data.columns.map(column => {
        return {
            column: column,
            actual: (data.length - nullLength(data, column, true))
        };
    });

    const completenessCountsPerColumn = data.columns.map(column => {
        return {
            column: column,
            completeness: (data.length - nullLength(data, column, true)) / data.length
        }
    });

    const cardinalityCountsPerColumn = data.columns.map(column => {
        return {
            column: column,
            cardinality: new Set(data.map(d => d[column])).size
        }
    });

    const uniquenessCountsPerColumn = data.columns.map(column => {
        return {
            column: column,
            uniqueness: new Set(data.map(d => d[column])).size / data.length
        }
    });

    const distinctnessCountsPerColumn = data.columns.map(column => {
        return {
            column: column,
            distinctness: new Set(data.map(d => d[column])).size / data.filter(d => d[column] !== "missing" && d[column] !== "null").length
        }
    });

    const x = d3.scaleBand()
        .domain(data.columns)
        .range([0, width])
        .padding(0.2);

    const yMissing = d3.scaleLinear()
        .domain([0, d3.max(missingCountsPerColumn, d => d.missing)])
        .range([height, 0]);

    const yNull = d3.scaleLinear()
        .domain([0, d3.max(nullCountsPerColumn, d => d.null)])
        .range([height, 0]);

    const yActual = d3.scaleLinear()
        .domain([0, d3.max(actualCountsPerColumn, d => d.actual)])
        .range([height, 0]);
    
    const yCompleteness = d3.scaleLinear()
        .domain([0, d3.max(completenessCountsPerColumn, d => d.completeness)])
        .range([height, 0]);

    const yCardinality = d3.scaleLinear()
        .domain([0, d3.max(cardinalityCountsPerColumn, d => d.cardinality)])
        .range([height, 0]);

    const yUniqueness = d3.scaleLinear()
        .domain([0, d3.max(uniquenessCountsPerColumn, d => d.uniqueness)])
        .range([height, 0]);

    const yDistinctness = d3.scaleLinear()
        .domain([0, d3.max(distinctnessCountsPerColumn, d => d.distinctness)])
        .range([height, 0]);

    const xAxis = d3.axisBottom(x);
    const yAxisMissing = d3.axisLeft(yMissing);
    const yAxisNull = d3.axisLeft(yNull);
    const yAxisActual = d3.axisLeft(yActual);
    const yAxisCompleteness = d3.axisLeft(yCompleteness);
    const yAxisCardinality = d3.axisLeft(yCardinality);
    const yAxisDistinctness = d3.axisLeft(yDistinctness);
    const yAxisUniqueness = d3.axisLeft(yUniqueness);

    // Append bottom axis
    missingChartGraph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    nullChartGraph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    actualChartGraph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    completenessChartGraph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    cardinalityChartGraph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    distinctnessChartGraph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
    uniquenessChartGraph.append("g").attr("transform", `translate(0,${height})`).call(xAxis);

    // Append left axis
    missingChartGraph.append("g").call(yAxisMissing);
    nullChartGraph.append("g").call(yAxisNull);
    actualChartGraph.append("g").call(yAxisActual);
    completenessChartGraph.append("g").call(yAxisCompleteness);
    cardinalityChartGraph.append("g").call(yAxisCardinality);
    distinctnessChartGraph.append("g").call(yAxisDistinctness);
    uniquenessChartGraph.append("g").call(yAxisUniqueness);

    const colors = d3.scaleOrdinal()
        .domain([...Array(7).keys()].map(idx => idx.toString()))
        .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), 7).reverse());


    // Bieu do cot so luong gia tri null
    nullChartGraph.append("g").attr("fill", colors("0")).selectAll()
    .data(nullCountsPerColumn).join("rect").attr("x", (d) => x(d.column))
    .attr("y", (d) => yNull(d.null)).attr("height", (d) => yNull(0) - yNull(d.null))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Column: ${d.column}<br>Null count: ${d.null}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        // Move the tooltip with the mouse
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Hide the tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    missingChartGraph
    .append("g").attr("fill", colors("1")).selectAll()
    .data(missingCountsPerColumn).join("rect").attr("x", (d) => x(d.column))
    .attr("y", (d) => yMissing(d.missing)).attr("height", (d) => yMissing(0) - yMissing(d.missing))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Column: ${d.column}<br>Missing count: ${d.missing}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        // Move the tooltip with the mouse
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Hide the tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    actualChartGraph.append("g").attr("fill", colors("2")).selectAll()
    .data(actualCountsPerColumn).join("rect").attr("x", (d) => x(d.column))
    .attr("y", (d) => yActual(d.actual)).attr("height", (d) => yActual(0) - yActual(d.actual))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Column: ${d.column}<br>Actual: ${d.actual}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        // Move the tooltip with the mouse
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Hide the tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    completenessChartGraph.append("g").attr("fill", colors("3")).selectAll()
    .data(completenessCountsPerColumn).join("rect").attr("x", (d) => x(d.column))
    .attr("y", (d) => yCompleteness(d.completeness)).attr("height", (d) => yCompleteness(0) - yCompleteness(d.completeness))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Column: ${d.column}<br>Completeness: ${d.completeness.toFixed(2)}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        // Move the tooltip with the mouse
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Hide the tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    cardinalityChartGraph.append("g").attr("fill", colors("4")).selectAll()
    .data(cardinalityCountsPerColumn).join("rect").attr("x", (d) => x(d.column))
    .attr("y", (d) => yCardinality(d.cardinality)).attr("height", (d) => yCardinality(0) - yCardinality(d.cardinality))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Column: ${d.column}<br>Cardinality: ${d.cardinality}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        // Move the tooltip with the mouse
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Hide the tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    // Fix for uniqueness chart tooltip
    uniquenessChartGraph.append("g").attr("fill", colors("5")).selectAll()
    .data(uniquenessCountsPerColumn).join("rect").attr("x", (d) => x(d.column))
    .attr("y", (d) => yUniqueness(d.uniqueness)).attr("height", (d) => yUniqueness(0) - yUniqueness(d.uniqueness))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Column: ${d.column}<br>Uniqueness: ${d.uniqueness.toFixed(2)}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        // Move the tooltip with the mouse
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Hide the tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    distinctnessChartGraph.append("g").attr("fill", colors("6")).selectAll()
    .data(distinctnessCountsPerColumn).join("rect").attr("x", (d) => x(d.column))
    .attr("y", (d) => yDistinctness(d.distinctness)).attr("height", (d) => yDistinctness(0) - yDistinctness(d.distinctness))
    .attr("width", x.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Column: ${d.column}<br>Distinctness: ${d.distinctness.toFixed(2)}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        // Move the tooltip with the mouse
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        // Hide the tooltip
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    // Add title
    nullChartGraph.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Null count per column");

    missingChartGraph.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Missing count per column");
    
    actualChartGraph.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Actual count per column");

    completenessChartGraph.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Completeness per column");

    cardinalityChartGraph.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Cardinality per column");

    uniquenessChartGraph.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Uniqueness per column");

    distinctnessChartGraph.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Distinctness per column");
    
});

const top5TransactionIDSvg = d3.select("#top-5-transaction-id");
const top5TransactionIDGraph = top5TransactionIDSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const top5CustomerIDSvg = d3.select("#top-5-customer-id");
const top5CustomerIDGraph = top5CustomerIDSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const top5DatesSvg = d3.select("#top-5-dates");
const top5DatesGraph = top5DatesSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const top5AgeSvg = d3.select("#top-5-age");
const top5AgeGraph = top5AgeSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const top5GenderSvg = d3.select("#top-5-gender");
const top5GenderGraph = top5GenderSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const top5ProductCategorySvg = d3.select("#top-5-product-category");
const top5ProductCategoryGraph = top5ProductCategorySvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const top5QuantitySvg = d3.select("#top-5-quantity");
const top5QuantityGraph = top5QuantitySvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const top5PricePerUnitSvg = d3.select("#top-5-price");
const top5PricePerUnitGraph = top5PricePerUnitSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const top5TotalAmountSvg = d3.select("#top-5-total-amount");
const top5TotalAmountGraph = top5TotalAmountSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("retail_sales_dataset.csv").then(data => { 
    const rowsByCustomerID = d3.group(data, d => d["Customer ID"]);
    const customerIDRowCounts = Array.from(rowsByCustomerID, ([key, value]) => ({customerID: key, count: value.length}));
    const top5CustomerIDs = customerIDRowCounts.sort((a, b) => b.count - a.count).slice(0, 5);

    const rowsByDate = d3.group(data, d => d.Date);
    const dateRowCounts = Array.from(rowsByDate, ([key, value]) => ({date: key, count: value.length})); 
    const top5Dates = dateRowCounts.sort((a, b) => b.count - a.count).slice(0, 5);

    const rowsByGender = d3.group(data, d => d.Gender);
    const genderRowCounts = Array.from(rowsByGender, ([key, value]) => ({gender: key, count: value.length})); 
    const top5Genders = genderRowCounts.sort((a, b) => b.count - a.count).slice(0, 5);

    const rowsByAge = d3.group(data, d => d.Age);
    const ageRowCounts = Array.from(rowsByAge, ([key, value]) => ({age: key, count: value.length}));
    const top5Ages = ageRowCounts.sort((a, b) => b.count - a.count).slice(0, 5);

    const rowsByProductCategory = d3.group(data, d => d["Product Category"]);
    const productCategoryRowCounts = Array.from(rowsByProductCategory, ([key, value]) => ({productCategory: key, count: value.length}));
    const top5ProductCategories = productCategoryRowCounts.sort((a, b) => b.count - a.count).slice(0, 5);

    const rowsByQuantity = d3.group(data, d => d.Quantity);
    const quantityRowCounts = Array.from(rowsByQuantity, ([key, value]) => ({quantity: key, count: value.length}));
    const top5Quantities = quantityRowCounts.sort((a, b) => b.count - a.count).slice(0, 5);

    const rowsByPricePerUnit = d3.group(data, d => d["Price per Unit"]);
    const pricePerUnitRowCounts = Array.from(rowsByPricePerUnit, ([key, value]) => ({pricePerUnit: key, count: value.length}));
    const top5PricePerUnits = pricePerUnitRowCounts.sort((a, b) => b.count - a.count).slice(0, 5);

    const rowsByTotalAmount = d3.group(data, d => d["Total Amount"]);
    const totalAmountRowCounts = Array.from(rowsByTotalAmount, ([key, value]) => ({totalAmount: key, count: value.length}));
    const top5TotalAmounts = totalAmountRowCounts.sort((a, b) => b.count - a.count).slice(0, 5);

    // Set up scales and render Top 5 CustomerIDs chart
    const xCustomerID = d3.scaleBand()
    .domain(top5CustomerIDs.map(d => String(d.customerID)))
    .range([0, width])
    .padding(0.2);

    const yCustomerID = d3.scaleLinear()
    .domain([0, d3.max(top5CustomerIDs, d => d.count)])
    .range([height, 0]);

    top5CustomerIDGraph.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xCustomerID));
    top5CustomerIDGraph.append("g").call(d3.axisLeft(yCustomerID));

    top5CustomerIDGraph.append("g").attr("fill", "steelblue").selectAll("rect")
    .data(top5CustomerIDs)
    .join("rect")
    .attr("x", d => xCustomerID(d.customerID))
    .attr("y", d => yCustomerID(d.count))
    .attr("height", d => yCustomerID(0) - yCustomerID(d.count))
    .attr("width", xCustomerID.bandwidth())
    .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Customer ID: ${d.customerID}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    top5CustomerIDGraph.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -1 * margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Top 5 Customer IDs by Occurrence");

    // Set up scales and render Top 5 Dates chart
    const xDates = d3.scaleBand()
    .domain(top5Dates.map(d => d.date))
    .range([0, width])
    .padding(0.2);

    const yDates = d3.scaleLinear()
    .domain([0, d3.max(top5Dates, d => d.count)])
    .range([height, 0]);

    top5DatesGraph.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xDates));
    top5DatesGraph.append("g").call(d3.axisLeft(yDates));

    top5DatesGraph.append("g").attr("fill", "orangered").selectAll("rect")
    .data(top5Dates)
    .join("rect")
    .attr("x", d => xDates(d.date))
    .attr("y", d => yDates(d.count))
    .attr("height", d => yDates(0) - yDates(d.count))
    .attr("width", xDates.bandwidth())
    .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Date: ${d.date}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    top5DatesGraph.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -1 * margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Top 5 Dates by Transaction Volume");

    // Set up scales and render Top 5 Gender chart
    const xGender = d3.scaleBand()
        .domain(top5Genders.map(d => String(d.gender)))
        .range([0, width])
        .padding(0.4);

    const yGender = d3.scaleLinear()
    .domain([0, d3.max(top5Genders, d => d.count)])
    .range([height, 0]);

    top5GenderGraph.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xGender));
    top5GenderGraph.append("g").call(d3.axisLeft(yGender));

    top5GenderGraph.append("g").attr("fill", "mediumpurple").selectAll("rect")
    .data(top5Genders)
    .join("rect")
    .attr("x", d => xGender(d.gender))
    .attr("y", d => yGender(d.count))
    .attr("height", d => yGender(0) - yGender(d.count))
    .attr("width", xGender.bandwidth())
    .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Gender: ${d.gender}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    top5GenderGraph.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -1 * margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Customer Count by Gender");

    // Set up scales and render Top 5 Ages chart
    const xAge = d3.scaleBand()
    .domain(top5Ages.map(d => d.age))
    .range([0, width])
    .padding(0.2);

    const yAge = d3.scaleLinear()
    .domain([0, d3.max(top5Ages, d => d.count)])
    .range([height, 0]);

    top5AgeGraph.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xAge));
    top5AgeGraph.append("g").call(d3.axisLeft(yAge));

    top5AgeGraph.append("g").attr("fill", "seagreen").selectAll("rect")
    .data(top5Ages)
    .join("rect")
    .attr("x", d => xAge(d.age))
    .attr("y", d => yAge(d.count))
    .attr("height", d => yAge(0) - yAge(d.count))
    .attr("width", xAge.bandwidth())
    .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Age: ${d.age}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    top5AgeGraph.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -1 * margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Top 5 Customer Ages by Count");

    // Set up scales and render Top 5 Product Categories chart
    const xProductCategory = d3.scaleBand()
    .domain(top5ProductCategories.map(d => d.productCategory))
    .range([0, width])
    .padding(0.2);

    const yProductCategory = d3.scaleLinear()
    .domain([0, d3.max(top5ProductCategories, d => d.count)])
    .range([height, 0]);

    top5ProductCategoryGraph.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xProductCategory))

    top5ProductCategoryGraph.append("g").call(d3.axisLeft(yProductCategory));

    top5ProductCategoryGraph.append("g").attr("fill", "tomato").selectAll("rect")
    .data(top5ProductCategories)
    .join("rect")
    .attr("x", d => xProductCategory(d.productCategory))
    .attr("y", d => yProductCategory(d.count))
    .attr("height", d => yProductCategory(0) - yProductCategory(d.count))
    .attr("width", xProductCategory.bandwidth())
    .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Category: ${d.productCategory}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    top5ProductCategoryGraph.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -1 * margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Top 5 Product Categories by Sales");

    // Set up scales and render Top 5 Quantities chart
    const xQuantity = d3.scaleBand()
    .domain(top5Quantities.map(d => d.quantity))
    .range([0, width])
    .padding(0.2);

    const yQuantity = d3.scaleLinear()
    .domain([0, d3.max(top5Quantities, d => d.count)])
    .range([height, 0]);

    top5QuantityGraph.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xQuantity));
    top5QuantityGraph.append("g").call(d3.axisLeft(yQuantity));

    top5QuantityGraph.append("g").attr("fill", "goldenrod").selectAll("rect")
    .data(top5Quantities)
    .join("rect")
    .attr("x", d => xQuantity(d.quantity))
    .attr("y", d => yQuantity(d.count))
    .attr("height", d => yQuantity(0) - yQuantity(d.count))
    .attr("width", xQuantity.bandwidth())
    .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Quantity: ${d.quantity}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    top5QuantityGraph.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -1 * margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Top 5 Purchase Quantities");

    // Set up scales and render Top 5 Price Per Units chart
    const xPricePerUnit = d3.scaleBand()
    .domain(top5PricePerUnits.map(d => String(d.pricePerUnit)))
    .range([0, width])
    .padding(0.2);

    const yPricePerUnit = d3.scaleLinear()
    .domain([0, d3.max(top5PricePerUnits, d => d.count)])
    .range([height, 0]);

    top5PricePerUnitGraph.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xPricePerUnit));
    top5PricePerUnitGraph.append("g").call(d3.axisLeft(yPricePerUnit));

    top5PricePerUnitGraph.append("g").attr("fill", "teal").selectAll("rect")
    .data(top5PricePerUnits)
    .join("rect")
    .attr("x", d => xPricePerUnit(d.pricePerUnit))
    .attr("y", d => yPricePerUnit(d.count))
    .attr("height", d => yPricePerUnit(0) - yPricePerUnit(d.count))
    .attr("width", xPricePerUnit.bandwidth())
    .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Price per Unit: ${d.pricePerUnit}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    top5PricePerUnitGraph.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -1 * margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Top 5 Price per Unit Values");

    // Set up scales and render Top 5 Total Amounts chart
    const xTotalAmount = d3.scaleBand()
    .domain(top5TotalAmounts.map(d => d.totalAmount))
    .range([0, width])
    .padding(0.2);

    const yTotalAmount = d3.scaleLinear()
    .domain([0, d3.max(top5TotalAmounts, d => d.count)])
    .range([height, 0]);

    top5TotalAmountGraph.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(xTotalAmount));
    top5TotalAmountGraph.append("g").call(d3.axisLeft(yTotalAmount));

    top5TotalAmountGraph.append("g").attr("fill", "darkslateblue").selectAll("rect")
    .data(top5TotalAmounts)
    .join("rect")
    .attr("x", d => xTotalAmount(d.totalAmount))
    .attr("y", d => yTotalAmount(d.count))
    .attr("height", d => yTotalAmount(0) - yTotalAmount(d.count))
    .attr("width", xTotalAmount.bandwidth())
    .on("mouseover", function(event, d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(`Total Amount: ${d.totalAmount}<br>Count: ${d.count}`)
            .style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 5) + "px")
            .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function() {
        tooltip.transition().duration(500).style("opacity", 0);
    });

    top5TotalAmountGraph.append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -1 * margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Top 5 Total Order Amounts");

});