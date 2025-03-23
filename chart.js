//import d3 from "d3";

const tooltip = d3.select("#tooltip");

const date_chart_svg = d3.select("#date-chart");
const margin = {top: 50, right: 30, bottom: 40, left: 40};
const width = +date_chart_svg.attr("width") - margin.left - margin.right;
const height = +date_chart_svg.attr("height") - margin.top - margin.bottom;
const dateChartGraph = date_chart_svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
const date_chart_quantity = d3.select("#date-chart-quantity");
const dateChartGraphQuantity = date_chart_quantity.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);


d3.csv("retail_sales_dataset.csv").then(data => {
    
    const parseTime = d3.timeParse("%m/%d/%Y");
    data = data.filter(d => d.Date && !isNaN(parseTime(d.Date))).map(d => {
        return {
            date: parseTime(d.Date),
            totalAmount: +d["Total Amount"],
            quantity: +d["Quantity"]
        };
    });
    const groupedData = d3.group(data, d => d3.timeMonth(d.date));
    const monthlyData = Array.from(groupedData, ([monthStartDate, totalAmountsAndQuantities]) => {
        return {
            date: monthStartDate,
            totalAmount: d3.sum(totalAmountsAndQuantities, d => d.totalAmount),
            totalQuantity: d3.sum(totalAmountsAndQuantities, d => d.quantity)
        };
    });

    const x = d3.scaleTime().domain(d3.extent(monthlyData, d => d.date)).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(monthlyData, d => d.totalAmount)]).nice().range([height, 0]);
    const yRight = d3.scaleLinear().domain([0, d3.max(monthlyData, d => d.totalQuantity)]).range([height, 0]);

    // Set up axises
    const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y"));
    const yAxis = d3.axisLeft(y);
    const xAxisQuantity = d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y"));
    const yAxisQuantity = d3.axisLeft(yRight); // Quantity axis

    dateChartGraph.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

    dateChartGraph.append("g")
        .call(yAxis);

    dateChartGraphQuantity.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxisQuantity);
    dateChartGraphQuantity.append("g")
    .call(yAxisQuantity);

    // Define the line
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.totalAmount));

    const lineQuantity = d3.line()
        .x(d => x(d.date))
        .y(d => yRight(d.totalQuantity));

    // Append the line to the chart
    dateChartGraph.append("path")
        .datum(monthlyData)
        .attr("class", "line-chart")
        .attr("d", line);


    dateChartGraphQuantity.append("path")
    .datum(monthlyData)
    .attr("class", "line-chart-quantity")
    .attr("d", lineQuantity);

    // Title
    dateChartGraph.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Tổng doanh thu theo từng tháng")

    dateChartGraphQuantity.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -1 * margin.top / 2)
        .attr("text-anchor", "middle")
        .text("Số lượng sản phẩm theo từng tháng")
}).catch(err => {
    console.log(err);
});

const gender_chart_svg = d3.select("#gender-chart");
const marginGenderChart = {top: 30, right: 30, bottom: 30, left: 30}
const genderChartWidth = +gender_chart_svg.attr("height") - marginGenderChart.left*2 - marginGenderChart.right*2;
const genderChartHeight = +gender_chart_svg.attr("height") - marginGenderChart.top - marginGenderChart.bottom;
const genderChartQuantity = gender_chart_svg.append("g").attr("transform", `translate(${marginGenderChart.left + genderChartWidth/2}, ${marginGenderChart.top + genderChartHeight / 2})`)
const genderChartAmount = gender_chart_svg.append("g").attr("transform", `translate(${marginGenderChart.left + marginGenderChart.right + genderChartWidth*1.5}, ${marginGenderChart.top + genderChartHeight / 2})`)

d3.csv("retail_sales_dataset.csv").then(data => {

    //Normalize gender values
    data.forEach(row => {
        if (row["Gender"] == "F"){
            row["Gender"] = "Female";
        }else if (row["Gender"] == "M"){
            row["Gender"] = "Male";
        }
    });

    const groupedData = d3.group(data, d => d.Gender);
    const quantityAndTotalAmountByGender = Array.from(groupedData, ([gender, rows]) => {
        return {
            gender: gender,
            totalQuantity: d3.sum(rows, d => d.Quantity),
            totalAmount: d3.sum(rows, d => d['Total Amount'])
        }
    });

    // Create the color scale.
    const color = d3.scaleOrdinal()
    .domain(quantityAndTotalAmountByGender.map(d => d.gender))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), quantityAndTotalAmountByGender.length).reverse())

    const quantityPie = d3.pie().sort(null).value(d => d.totalQuantity);
    const amountPie = d3.pie().sort(null).value(d => d.totalAmount);

    const quantityArc = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2 - 1);
    const amountArc = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2 - 1);

    const quantityLabelRadius = quantityArc.outerRadius()() * 0.75;
    const amountLabelRadius = amountArc.outerRadius()() * 0.75;

    // Seperate arc generators for labels
    const quantityArcLabel = d3.arc().innerRadius(quantityLabelRadius).outerRadius(quantityLabelRadius);
    const amountArcLabel = d3.arc().innerRadius(amountLabelRadius).outerRadius(amountLabelRadius);

    const quantityArcs = quantityPie(quantityAndTotalAmountByGender);
    const amountArcs = amountPie(quantityAndTotalAmountByGender);

    genderChartQuantity.append("text")
    .attr("class", "title")
    .attr('x', 0)
    .attr('y', marginGenderChart.top / 2 - genderChartHeight / 2)
    .attr('text-anchor', 'middle')
    .text("Số lượng sản phẩm theo giới tính")

    genderChartQuantity.append("g").attr("stroke", "white")
        .selectAll().data(quantityArcs).join("path").attr("fill", d => color(d.data.gender))
        .attr("d", quantityArc).append("title").text(d => `${d.data.gender}: ${d.data.totalQuantity}`);

    genderChartQuantity.append("g")
    .attr("text-anchor", "middle")
    .selectAll()
    .data(quantityArcs)
    .join("text")
    .attr("transform", d => `translate(${quantityArcLabel.centroid(d)})`)
    .call(text => text.append("tspan")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .text(d => d.data.name))
    .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25)
        .append("tspan")
        .attr("x", 0)
        .attr("y", "12px")
        .attr("fill-opacity", 0.7)
        .attr("font-family", "Arial")
        .attr("font-size", "14px")
        .html(d => `<tspan style="fill: white;">${d.data.gender}</tspan><tspan x="0" dy="1.2em" style="fill: white;">${d.data.totalQuantity}</tspan>`));

    genderChartAmount.append("g").attr("stroke", "white")
    .selectAll().data(amountArcs).join("path").attr("fill", d => color(d.data.gender))
    .attr("d", amountArc).append("title").text(d => `${d.data.gender}: ${d.data.totalAmount}`);
      
    
    genderChartAmount.append("g")
    .attr("text-anchor", "middle")
    .selectAll()
    .data(amountArcs)
    .join("text")
    .attr("transform", d => `translate(${amountArcLabel.centroid(d)})`)
    .call(text => text.append("tspan")
        .attr("y", "-0.4em")
        .attr("font-weight", "bold")
        .text(d => d.data.name))
    .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25)
        .append("tspan")
        .attr("x", 0)
        .attr("y", "12px")
        .attr("fill-opacity", 0.7)
        .attr("font-family", "Arial")
        .attr("font-size", "14px")
        .attr("color", "white")
        .html(d => `<tspan style="fill: white;">${d.data.gender}</tspan><tspan x="0" dy="1.2em" style="fill: white;">${d.data.totalAmount}</tspan>`));

    genderChartQuantity.append("text")
    .attr('x', genderChartHeight - marginGenderChart.left)
    .attr('y', marginGenderChart.top / 2 - genderChartHeight / 2)
    .attr('text-anchor', 'middle')
    .text("Tổng doanh thu theo giới tính")

});


const age_chart_amount = d3.select("#age-chart-amount");
const age_chart_quantity = d3.select("#age-chart-quantity");
const age_chart_price = d3.select("#age-chart-price");
const ageChartMargin = {top: 40, right: 20, bottom: 20, left: 40};
const ageChartWidth = +age_chart_amount.attr("width") - margin.left - margin.right;
const ageChartHeight = +age_chart_amount.attr("height") - margin.top - margin.bottom;
const ageChartAmount = age_chart_amount.append("g").attr("transform", `translate(${ageChartMargin.left}, ${ageChartMargin.top})`);
const ageChartQuantity = age_chart_quantity.append("g").attr("transform", `translate(${ageChartMargin.left}, ${ageChartMargin.top})`);
const ageChartPrice = age_chart_price.append("g").attr("transform", `translate(${ageChartMargin.left}, ${ageChartMargin.top})`);

function groupAge(ageVal){
    let age = parseInt(ageVal);
    if (age < 18){
        return "< 18";
    }else if (age >= 18 && age < 30){
        return "18 - 29";
    }else {
        return String(Math.round(age / 10)) + "0 - " + String(Math.round(age / 10)) + "9";
    }
}

d3.csv("retail_sales_dataset.csv").then(data => {
    data = data.filter(d => d.Age && !isNaN(parseInt(d.Age))).map(d => {
        return {
            ageGroup: groupAge(d.Age),
            totalAmount: +d["Total Amount"],
            quantity: +d["Quantity"],
            pricePerUnit: +d["Price per Unit"]
        }
    });

    const groupedData = d3.group(data, d => d.ageGroup);
    const dataByAges = Array.from(groupedData, ([ageGroup, values]) => {
        return {
            ageGroup: ageGroup,
            totalAmount: d3.sum(values, d => d.totalAmount),
            totalQuantity: d3.sum(values, d => d.quantity),
            averagePrice: d3.mean(values, d => d.pricePerUnit)
        }
    });

    const ages = Array.from(new Set(dataByAges.map(d => d.ageGroup))).sort();

    // fx encodes the age range to group into
    const fx = d3.scaleBand().domain(ages).range([ageChartMargin.left, ageChartWidth - ageChartMargin.right]).padding(0.1);

    const groupDomains = ['totalAmount', 'totalQuantity', 'averagePrice']

    //const color = d3.scaleOrdinal().domain(groupDomains).range(d3.schemeSpectral[groupDomains.size]).unknown("#ccc");

    const yTotalAmount = d3.scaleLinear().domain([0, d3.max(dataByAges, d => d.totalAmount)]).nice()
                            .rangeRound([ageChartHeight - ageChartMargin.bottom, ageChartMargin.top])
    
    const yTotalQuantity = d3.scaleLinear().domain([0, d3.max(dataByAges, d => d.totalQuantity)]).nice()
    .rangeRound([ageChartHeight - ageChartMargin.bottom, ageChartMargin.top])

    const yAveragePrice = d3.scaleLinear().domain([0, d3.max(dataByAges, d => d.averagePrice)]).nice()
    .rangeRound([ageChartHeight - ageChartMargin.bottom, ageChartMargin.top])


    ageChartAmount.append("g").attr("fill", "steelblue").selectAll()
    .data(dataByAges).join("rect").attr("x", (d) => fx(d.ageGroup))
    .attr("y", (d) => yTotalAmount(d.totalAmount)).attr("height", (d) => yTotalAmount(0) - yTotalAmount(d.totalAmount))
    .attr("width", fx.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Nhóm tuổi: ${d.ageGroup}<br>Tổng doanh thu: ${d.totalAmount}`)
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

    ageChartAmount.append("g").attr("transform", `translate(0, ${ageChartHeight - ageChartMargin.bottom})`)
    .call(d3.axisBottom(fx).tickSizeOuter(0));

    ageChartAmount.append("g").attr("transform", `translate(${ageChartMargin.left}, 0)`)
    .call(d3.axisLeft(yTotalAmount))

    ageChartAmount.append("text")
        .attr("class", "title")
        .attr("x", ageChartWidth / 2)
        .attr("y", -1 * ageChartMargin.top/2)
        .attr("text-anchor", "middle")
        .text("Tổng doanh thu theo từng nhóm tuổi")

    ageChartQuantity.append("g").attr("fill", "crimson").selectAll()
    .data(dataByAges).join("rect").attr("x", (d) => fx(d.ageGroup))
    .attr("y", (d) => yTotalQuantity(d.totalQuantity)).attr("height", (d) => yTotalQuantity(0) - yTotalQuantity(d.totalQuantity))
    .attr("width", fx.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Nhóm tuổi: ${d.ageGroup}<br>Tổng số lượng: ${d.totalQuantity}`)
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

    ageChartQuantity.append("g").attr("transform", `translate(0, ${ageChartHeight - ageChartMargin.bottom})`)
    .call(d3.axisBottom(fx).tickSizeOuter(0));

    ageChartQuantity.append("g").attr("transform", `translate(${ageChartMargin.left}, 0)`)
    .call(d3.axisLeft(yTotalQuantity))

    ageChartQuantity.append("text")
        .attr("class", "title")
        .attr("x", ageChartWidth / 2)
        .attr("y", -1 * ageChartMargin.top/2)
        .attr("text-anchor", "middle")
        .text("Tổng số lượng sản phẩm theo từng nhóm tuổi")

    ageChartPrice.append("g").attr("fill", "purple").selectAll()
    .data(dataByAges).join("rect").attr("x", (d) => fx(d.ageGroup))
    .attr("y", (d) => yAveragePrice(d.averagePrice)).attr("height", (d) => yAveragePrice(0) - yAveragePrice(d.averagePrice))
    .attr("width", fx.bandwidth())
    .on("mouseover", function(event, d) {
        // Show the tooltip and set its content
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        tooltip.html(`Nhóm tuổi: ${d.ageGroup}<br>Giá cả trung bình: ${d.averagePrice.toFixed(2)}`)
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

    ageChartPrice.append("g").attr("transform", `translate(0, ${ageChartHeight - ageChartMargin.bottom})`)
    .call(d3.axisBottom(fx).tickSizeOuter(0));

    ageChartPrice.append("g").attr("transform", `translate(${ageChartMargin.left}, 0)`)
    .call(d3.axisLeft(yAveragePrice))

    ageChartPrice.append("text")
        .attr("class", "title")
        .attr("x", ageChartWidth / 2)
        .attr("y", -1 * ageChartMargin.top/2)
        .attr("text-anchor", "middle")
        .text("Giá cả của mỗi món hàng trung bình từng nhóm tuổi mua")

}).catch(err => {
    console.log(err);
});

// Product category charts
const product_chart_amount = d3.select("#product-chart-amount");
const product_chart_quantity = d3.select("#product-chart-quantity");
const product_chart_price = d3.select("#product-chart-price");
const productChartMargin = {top: 40, right: 20, bottom: 20, left: 40};
const productChartWidth = +product_chart_amount.attr("width") - margin.left - margin.right;
const productChartHeight = +product_chart_amount.attr("height") - margin.top - margin.bottom;
const productChartAmount = product_chart_amount.append("g").attr("transform", `translate(${productChartMargin.left}, ${productChartMargin.top})`);
const productChartQuantity = product_chart_quantity.append("g").attr("transform", `translate(${productChartMargin.left}, ${productChartMargin.top})`);
const productChartPrice = product_chart_price.append("g").attr("transform", `translate(${productChartMargin.left}, ${productChartMargin.top})`);

d3.csv("retail_sales_dataset.csv").then(data => {
    data = data.map(d => {
        return {
            productCategory: d["Product Category"],
            totalAmount: +d["Total Amount"],
            quantity: +d["Quantity"],
            pricePerUnit: +d["Price per Unit"]
        }
    });

    // Group data by product category
    const groupedData = d3.group(data, d => d.productCategory);
    const dataByProducts = Array.from(groupedData, ([category, values]) => {
        return {
            category: category,
            totalAmount: d3.sum(values, d => d.totalAmount),
            totalQuantity: d3.sum(values, d => d.quantity),
            averagePrice: d3.mean(values, d => d.pricePerUnit)
        }
    });

    const categories = dataByProducts.map(d => d.category);

    // Create scales
    const fx = d3.scaleBand()
        .domain(categories)
        .range([productChartMargin.left, productChartWidth - productChartMargin.right])
        .padding(0.1);

    const yTotalAmount = d3.scaleLinear()
        .domain([0, d3.max(dataByProducts, d => d.totalAmount)]).nice()
        .rangeRound([productChartHeight - productChartMargin.bottom, productChartMargin.top]);
    
    const yTotalQuantity = d3.scaleLinear()
        .domain([0, d3.max(dataByProducts, d => d.totalQuantity)]).nice()
        .rangeRound([productChartHeight - productChartMargin.bottom, productChartMargin.top]);

    const yAveragePrice = d3.scaleLinear()
        .domain([0, d3.max(dataByProducts, d => d.averagePrice)]).nice()
        .rangeRound([productChartHeight - productChartMargin.bottom, productChartMargin.top]);

    // Create Amount chart
    productChartAmount.append("g").attr("fill", "steelblue").selectAll()
        .data(dataByProducts).join("rect")
        .attr("x", d => fx(d.category))
        .attr("y", d => yTotalAmount(d.totalAmount))
        .attr("height", d => yTotalAmount(0) - yTotalAmount(d.totalAmount))
        .attr("width", fx.bandwidth())
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(`Nhóm hàng: ${d.category}<br>Tổng doanh thu: ${d.totalAmount}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    productChartAmount.append("g")
        .attr("transform", `translate(0, ${productChartHeight - productChartMargin.bottom})`)
        .call(d3.axisBottom(fx).tickSizeOuter(0));

    productChartAmount.append("g")
        .attr("transform", `translate(${productChartMargin.left}, 0)`)
        .call(d3.axisLeft(yTotalAmount));

    productChartAmount.append("text")
        .attr("class", "title")
        .attr("x", productChartWidth / 2)
        .attr("y", -1 * productChartMargin.top/2)
        .attr("text-anchor", "middle")
        .text("Tổng doanh thu theo từng loại sản phẩm");

    // Create Quantity chart
    productChartQuantity.append("g").attr("fill", "crimson").selectAll()
        .data(dataByProducts).join("rect")
        .attr("x", d => fx(d.category))
        .attr("y", d => yTotalQuantity(d.totalQuantity))
        .attr("height", d => yTotalQuantity(0) - yTotalQuantity(d.totalQuantity))
        .attr("width", fx.bandwidth())
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(`Nhóm hàng: ${d.category}<br>Tổng số lượng: ${d.totalQuantity}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    productChartQuantity.append("g")
        .attr("transform", `translate(0, ${productChartHeight - productChartMargin.bottom})`)
        .call(d3.axisBottom(fx).tickSizeOuter(0));

    productChartQuantity.append("g")
        .attr("transform", `translate(${productChartMargin.left}, 0)`)
        .call(d3.axisLeft(yTotalQuantity));

    productChartQuantity.append("text")
        .attr("class", "title")
        .attr("x", productChartWidth / 2)
        .attr("y", -1 * productChartMargin.top/2)
        .attr("text-anchor", "middle")
        .text("Tổng số lượng sản phẩm theo từng loại");

    // Create Average Price chart
    productChartPrice.append("g").attr("fill", "purple").selectAll()
        .data(dataByProducts).join("rect")
        .attr("x", d => fx(d.category))
        .attr("y", d => yAveragePrice(d.averagePrice))
        .attr("height", d => yAveragePrice(0) - yAveragePrice(d.averagePrice))
        .attr("width", fx.bandwidth())
        .on("mouseover", function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", 1);
            tooltip.html(`Nhóm hàng: ${d.category}<br>Giá cả trung bình: ${d.averagePrice.toFixed(2)}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    productChartPrice.append("g")
        .attr("transform", `translate(0, ${productChartHeight - productChartMargin.bottom})`)
        .call(d3.axisBottom(fx).tickSizeOuter(0));

    productChartPrice.append("g")
        .attr("transform", `translate(${productChartMargin.left}, 0)`)
        .call(d3.axisLeft(yAveragePrice));

    productChartPrice.append("text")
        .attr("class", "title")
        .attr("x", productChartWidth / 2)
        .attr("y", -1 * productChartMargin.top/2)
        .attr("text-anchor", "middle")
        .text("Giá cả trung bình của từng loại sản phẩm");

}).catch(err => {
    console.log(err);
});