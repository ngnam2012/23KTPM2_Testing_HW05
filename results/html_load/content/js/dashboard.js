/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 28.47200253084467, "KoPercent": 71.52799746915532};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2847200253084467, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.046052631578947366, 500, 1500, "Step 9: GET /api/orders/my-orders"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/3"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/3/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/2"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/1"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/2/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/4/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/5"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/4"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/6/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/7/cancel"], "isController": false}, {"data": [0.046153846153846156, 500, 1500, "Step 2: GET /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/1/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/5/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/8/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/9/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 4: GET /api/products"], "isController": false}, {"data": [0.046296296296296294, 500, 1500, "Step 3: PUT /api/users/me"], "isController": false}, {"data": [0.04777070063694268, 500, 1500, "Step 7: POST /api/cart"], "isController": false}, {"data": [0.0, 500, 1500, "Step 10: PUT /api/orders/NOT_FOUND/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/11/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/12/cancel"], "isController": false}, {"data": [0.5, 500, 1500, "Step 6: POST /api/apply-coupon"], "isController": false}, {"data": [0.046012269938650305, 500, 1500, "Step 1: POST /api/login"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/14/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/product_id"], "isController": false}, {"data": [0.04854368932038835, 500, 1500, "Step 8: POST /api/checkout"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/10/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/13/cancel"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3161, 2261, 71.52799746915532, 2.5064852894653598, 0, 203, 2.0, 4.0, 4.0, 8.760000000000218, 10.559228217624991, 3.452843069483463, 2.5222185674223927], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 304, 290, 95.39473684210526, 2.1546052631578947, 1, 7, 2.0, 3.0, 4.0, 5.0, 1.0949233733724721, 0.3359906816708387, 0.2167504817302671], "isController": false}, {"data": ["Step 5: GET /api/products/3", 53, 0, 0.0, 2.3584905660377364, 1, 5, 2.0, 4.0, 4.0, 5.0, 0.18744076164608356, 0.07687999989390146, 0.03710340695688156], "isController": false}, {"data": ["Step 10: PUT /api/orders/3/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.17578125], "isController": false}, {"data": ["Step 5: GET /api/products/2", 53, 0, 0.0, 2.6415094339622645, 1, 5, 2.0, 4.0, 5.0, 5.0, 0.18697919239100524, 0.08253378414134216, 0.03487600170574414], "isController": false}, {"data": ["Step 5: GET /api/products/1", 53, 0, 0.0, 2.792452830188679, 1, 5, 3.0, 4.0, 4.299999999999997, 5.0, 0.1879805918905882, 0.07765213903292852, 0.037210264937363444], "isController": false}, {"data": ["Step 10: PUT /api/orders/2/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.69091796875], "isController": false}, {"data": ["Step 10: PUT /api/orders/4/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.3818359375], "isController": false}, {"data": ["Step 5: GET /api/products/5", 53, 0, 0.0, 5.056603773584906, 1, 125, 3.0, 4.0, 5.299999999999997, 125.0, 0.18648051454548015, 0.07994623621627518, 0.03691332856283338], "isController": false}, {"data": ["Step 5: GET /api/products/4", 53, 0, 0.0, 2.9433962264150946, 1, 16, 2.0, 4.0, 5.0, 16.0, 0.18586056950483937, 0.07859143222226118, 0.034667352319750315], "isController": false}, {"data": ["Step 10: PUT /api/orders/6/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.0703125], "isController": false}, {"data": ["Step 10: PUT /api/orders/7/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.0703125], "isController": false}, {"data": ["Step 2: GET /api/users/me", 325, 310, 95.38461538461539, 2.2123076923076943, 0, 14, 2.0, 3.0, 4.0, 8.0, 1.1006576852999548, 0.29611925033358394, 0.20930024523499888], "isController": false}, {"data": ["Step 10: PUT /api/orders/1/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.293526785714285], "isController": false}, {"data": ["Step 10: PUT /api/orders/5/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.465745192307693], "isController": false}, {"data": ["Step 10: PUT /api/orders/8/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.646763392857142], "isController": false}, {"data": ["Step 10: PUT /api/orders/9/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.465745192307693], "isController": false}, {"data": ["Step 4: GET /api/products", 321, 0, 0.0, 2.5638629283489083, 1, 7, 2.0, 4.0, 4.0, 5.779999999999973, 1.1072210820412878, 0.4343676163703154, 0.2281144096114378], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 324, 309, 95.37037037037037, 2.5370370370370376, 1, 81, 2.0, 4.0, 4.0, 6.75, 1.1055831951354338, 0.2883221655354913, 0.3287365203731002], "isController": false}, {"data": ["Step 7: POST /api/cart", 314, 299, 95.22292993630573, 2.3025477707006363, 1, 12, 2.0, 3.0, 4.0, 5.0, 1.110604147434469, 0.5397795349079861, 0.30486556362276246], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 290, 290, 100.0, 1.534482758620689, 0, 4, 1.0, 2.0, 3.0, 4.0, 1.0445067946967868, 0.27234698650785366, 0.22746583517322608], "isController": false}, {"data": ["Step 10: PUT /api/orders/11/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.669270833333332], "isController": false}, {"data": ["Step 10: PUT /api/orders/12/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 316, 158, 50.0, 3.0000000000000004, 1, 27, 3.0, 5.0, 5.0, 6.829999999999984, 1.1091688955345422, 0.3823599805895443, 0.2947703816365857], "isController": false}, {"data": ["Step 1: POST /api/login", 326, 311, 95.39877300613497, 2.4141104294478506, 1, 203, 2.0, 3.0, 3.0, 6.0, 1.0912572220474128, 0.3218519708323012, 0.2813560973578855], "isController": false}, {"data": ["Step 10: PUT /api/orders/14/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.433035714285715], "isController": false}, {"data": ["Step 5: GET /api/products/product_id", 53, 0, 0.0, 2.433962264150945, 1, 5, 2.0, 4.0, 5.0, 5.0, 0.1871706855391222, 0.04368534555063497, 0.036556774519359805], "isController": false}, {"data": ["Step 8: POST /api/checkout", 309, 294, 95.14563106796116, 2.825242718446599, 1, 21, 2.0, 4.0, 8.0, 16.0, 1.1011685215476228, 0.2880294028031688, 0.3099611762368546], "isController": false}, {"data": ["Step 10: PUT /api/orders/10/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/13/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.433035714285715], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 132, 5.83812472357364, 4.175893704523885], "isController": false}, {"data": ["403/Forbidden", 1739, 76.91287041132243, 55.014236001265424], "isController": false}, {"data": ["401/Unauthorized", 311, 13.754975674480319, 9.838658652325213], "isController": false}, {"data": ["404/Not Found", 79, 3.494029190623618, 2.49920911104081], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3161, 2261, "403/Forbidden", 1739, "401/Unauthorized", 311, "400/Bad Request", 132, "404/Not Found", 79, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 304, 290, "403/Forbidden", 290, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 2: GET /api/users/me", 325, 310, "403/Forbidden", 310, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 324, 309, "403/Forbidden", 309, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 7: POST /api/cart", 314, 299, "403/Forbidden", 246, "400/Bad Request", 53, "", "", "", "", "", ""], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 290, 290, "403/Forbidden", 290, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 316, 158, "400/Bad Request", 79, "404/Not Found", 79, "", "", "", "", "", ""], "isController": false}, {"data": ["Step 1: POST /api/login", 326, 311, "401/Unauthorized", 311, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 8: POST /api/checkout", 309, 294, "403/Forbidden", 294, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
