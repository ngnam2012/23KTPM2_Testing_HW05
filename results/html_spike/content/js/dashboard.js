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

    var data = {"OkPercent": 30.663399924613646, "KoPercent": 69.33660007538636};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.30663399924613643, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.046341463414634146, 500, 1500, "Step 9: GET /api/orders/my-orders"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/89/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/95/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/3"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/85/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/2"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/93/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/94/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/1"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/77/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/78/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/87/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/5"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/84/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/86/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/88/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/4"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/82/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/83/cancel"], "isController": false}, {"data": [0.04658901830282862, 500, 1500, "Step 2: GET /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/79/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/80/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/81/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/90/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 4: GET /api/products"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/91/cancel"], "isController": false}, {"data": [0.04666666666666667, 500, 1500, "Step 3: PUT /api/users/me"], "isController": false}, {"data": [0.046464646464646465, 500, 1500, "Step 7: POST /api/cart"], "isController": false}, {"data": [0.0, 500, 1500, "Step 10: PUT /api/orders/NOT_FOUND/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/92/cancel"], "isController": false}, {"data": [0.4972677595628415, 500, 1500, "Step 6: POST /api/apply-coupon"], "isController": false}, {"data": [0.046052631578947366, 500, 1500, "Step 1: POST /api/login"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/product_id"], "isController": false}, {"data": [0.04708520179372197, 500, 1500, "Step 8: POST /api/checkout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5306, 3679, 69.33660007538636, 2.906520919713528, 0, 46, 2.0, 5.0, 6.0, 9.0, 89.0387971539804, 29.44487030033394, 21.23451514569909], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 410, 391, 95.36585365853658, 2.3951219512195117, 1, 7, 2.0, 4.0, 4.0, 6.0, 10.038685666715637, 3.3369591581582685, 1.9876042890896626], "isController": false}, {"data": ["Step 10: PUT /api/orders/89/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.338541666666664], "isController": false}, {"data": ["Step 10: PUT /api/orders/95/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.53125], "isController": false}, {"data": ["Step 5: GET /api/products/3", 98, 0, 0.0, 3.3775510204081645, 1, 8, 3.0, 5.0, 6.0, 8.0, 1.9755276473078396, 0.8102750115911062, 0.3904517633600097], "isController": false}, {"data": ["Step 10: PUT /api/orders/85/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.53125], "isController": false}, {"data": ["Step 5: GET /api/products/2", 99, 0, 0.0, 3.4545454545454555, 1, 7, 3.0, 6.0, 6.0, 7.0, 1.9679169896833442, 0.8686508587274137, 0.3670626416303894], "isController": false}, {"data": ["Step 10: PUT /api/orders/93/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.716517857142858], "isController": false}, {"data": ["Step 10: PUT /api/orders/94/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.53125], "isController": false}, {"data": ["Step 5: GET /api/products/1", 98, 0, 0.0, 3.5714285714285707, 2, 8, 3.0, 6.0, 7.0, 8.0, 1.979757984687178, 0.8178101831276137, 0.39128786539665866], "isController": false}, {"data": ["Step 10: PUT /api/orders/77/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.50390625], "isController": false}, {"data": ["Step 10: PUT /api/orders/78/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/87/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.40625], "isController": false}, {"data": ["Step 5: GET /api/products/5", 97, 0, 0.0, 3.5567010309278353, 1, 8, 3.0, 6.0, 7.0, 8.0, 1.9845329186955274, 0.8507909680735709, 0.392459126549777], "isController": false}, {"data": ["Step 10: PUT /api/orders/84/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.433035714285715], "isController": false}, {"data": ["Step 10: PUT /api/orders/86/cancel", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 15.190972222222223, 18.446180555555557], "isController": false}, {"data": ["Step 10: PUT /api/orders/88/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 5: GET /api/products/4", 97, 0, 0.0, 3.2577319587628875, 1, 9, 3.0, 5.0, 6.099999999999994, 9.0, 1.951788804378446, 0.8253169456014326, 0.36405435706668277], "isController": false}, {"data": ["Step 10: PUT /api/orders/82/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 36.892361111111114], "isController": false}, {"data": ["Step 10: PUT /api/orders/83/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.53125], "isController": false}, {"data": ["Step 2: GET /api/users/me", 601, 573, 95.34109816971714, 2.3926788685524123, 1, 12, 2.0, 4.0, 5.0, 7.0, 10.480608258928571, 2.8214284351893832, 1.9935369491577148], "isController": false}, {"data": ["Step 10: PUT /api/orders/79/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 10: PUT /api/orders/80/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 10: PUT /api/orders/81/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.135416666666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/90/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.433035714285715], "isController": false}, {"data": ["Step 4: GET /api/products", 599, 0, 0.0, 3.4156928213689506, 1, 23, 3.0, 5.0, 6.0, 8.0, 11.443746059645033, 4.491836748705653, 2.357627064507193], "isController": false}, {"data": ["Step 10: PUT /api/orders/91/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.669270833333332], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 600, 572, 95.33333333333333, 2.591666666666668, 1, 9, 2.0, 4.0, 5.0, 7.990000000000009, 11.447104836401794, 2.9852648335400174, 3.404749803252886], "isController": false}, {"data": ["Step 7: POST /api/cart", 495, 472, 95.35353535353535, 2.6969696969696972, 1, 9, 2.0, 4.0, 5.0, 7.0, 10.831509846827133, 5.306709005743982, 2.9718057644967177], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 390, 390, 100.0, 1.6820512820512816, 0, 6, 1.0, 3.0, 3.0, 5.0, 9.548993682973409, 2.4898255013221684, 2.079517179006905], "isController": false}, {"data": ["Step 10: PUT /api/orders/92/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.433035714285715], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 549, 276, 50.27322404371585, 3.9125683060109293, 1, 17, 3.0, 6.0, 7.0, 10.0, 11.458985597996243, 3.9500536487685247, 3.042508903412649], "isController": false}, {"data": ["Step 1: POST /api/login", 608, 580, 95.39473684210526, 2.611842105263158, 1, 46, 2.0, 3.0, 4.0, 43.55999999999949, 10.250531071922312, 3.0242912718751054, 2.625723901608389], "isController": false}, {"data": ["Step 5: GET /api/products/product_id", 100, 0, 0.0, 3.21, 1, 7, 3.0, 5.0, 6.0, 7.0, 2.0087178354056605, 0.4688316041620633, 0.39232770222766805], "isController": false}, {"data": ["Step 8: POST /api/checkout", 446, 425, 95.2914798206278, 3.206278026905832, 1, 25, 2.0, 5.0, 6.649999999999977, 19.0, 10.222089798537736, 2.6737905674864204, 2.8758356658683044], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 225, 6.115792334873607, 4.240482472672446], "isController": false}, {"data": ["403/Forbidden", 2738, 74.42239739059526, 51.60196004523181], "isController": false}, {"data": ["401/Unauthorized", 580, 15.765153574340854, 10.931021485111195], "isController": false}, {"data": ["404/Not Found", 136, 3.6966567001902693, 2.563136072370901], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5306, 3679, "403/Forbidden", 2738, "401/Unauthorized", 580, "400/Bad Request", 225, "404/Not Found", 136, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Step 9: GET /api/orders/my-orders", 410, 391, "403/Forbidden", 391, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 2: GET /api/users/me", 601, 573, "403/Forbidden", 573, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 600, 572, "403/Forbidden", 572, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 7: POST /api/cart", 495, 472, "403/Forbidden", 387, "400/Bad Request", 85, "", "", "", "", "", ""], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 390, 390, "403/Forbidden", 390, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 549, 276, "400/Bad Request", 140, "404/Not Found", 136, "", "", "", "", "", ""], "isController": false}, {"data": ["Step 1: POST /api/login", 608, 580, "401/Unauthorized", 580, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 8: POST /api/checkout", 446, 425, "403/Forbidden", 425, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
