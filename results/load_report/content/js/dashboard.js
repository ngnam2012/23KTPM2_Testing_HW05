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

    var data = {"OkPercent": 30.208993033565548, "KoPercent": 69.79100696643445};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.30208993033565545, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/108/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/114/cancel"], "isController": false}, {"data": [0.04918032786885246, 500, 1500, "Step 9: GET /api/orders/my-orders"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/3"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/2"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/1"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/5"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/4"], "isController": false}, {"data": [0.04923076923076923, 500, 1500, "Step 2: GET /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 4: GET /api/products"], "isController": false}, {"data": [0.04953560371517028, 500, 1500, "Step 3: PUT /api/users/me"], "isController": false}, {"data": [0.04792332268370607, 500, 1500, "Step 7: POST /api/cart"], "isController": false}, {"data": [0.0, 500, 1500, "Step 10: PUT /api/orders/NOT_FOUND/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/110/cancel"], "isController": false}, {"data": [0.6656050955414012, 500, 1500, "Step 6: POST /api/apply-coupon"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/111/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/113/cancel"], "isController": false}, {"data": [0.04892966360856269, 500, 1500, "Step 1: POST /api/login"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/112/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/106/cancel"], "isController": false}, {"data": [0.04854368932038835, 500, 1500, "Step 8: POST /api/checkout"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/100/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/107/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/109/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/101/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/102/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/103/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/104/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/105/cancel"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3158, 2204, 69.79100696643445, 2.1424952501583303, 0, 36, 2.0, 3.0, 4.0, 8.0, 10.540545050983795, 3.3000807834482067, 2.5192936324493918], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step 10: PUT /api/orders/108/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/114/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 9: GET /api/orders/my-orders", 305, 290, 95.08196721311475, 1.8459016393442622, 1, 6, 2.0, 3.0, 3.0, 4.0, 1.0890173492960664, 0.34502170112543695, 0.21599378746844528], "isController": false}, {"data": ["Step 5: GET /api/products/3", 64, 0, 0.0, 2.2187499999999996, 1, 6, 2.0, 3.0, 3.0, 6.0, 0.2222747037494964, 0.09116735895975438, 0.042721132941111094], "isController": false}, {"data": ["Step 5: GET /api/products/2", 64, 0, 0.0, 2.1093749999999996, 1, 5, 2.0, 3.0, 3.75, 5.0, 0.222263896702854, 0.09810867315399414, 0.04271905582991255], "isController": false}, {"data": ["Step 5: GET /api/products/1", 64, 0, 0.0, 2.3906249999999996, 1, 6, 2.0, 4.0, 4.0, 6.0, 0.22165116262961396, 0.09156097831281905, 0.043020672434214625], "isController": false}, {"data": ["Step 5: GET /api/products/5", 63, 0, 0.0, 2.0476190476190474, 1, 4, 2.0, 3.0, 3.0, 4.0, 0.2217544650085534, 0.09506856458862786, 0.042641123177565486], "isController": false}, {"data": ["Step 5: GET /api/products/4", 63, 0, 0.0, 2.444444444444445, 1, 6, 2.0, 4.0, 4.0, 6.0, 0.2226486709994805, 0.09414733842067877, 0.04281306987457458], "isController": false}, {"data": ["Step 2: GET /api/users/me", 325, 309, 95.07692307692308, 1.7876923076923081, 0, 4, 2.0, 3.0, 3.0, 4.0, 1.0953456236729466, 0.2956939488473594, 0.20869822912102728], "isController": false}, {"data": ["Step 4: GET /api/products", 319, 0, 0.0, 2.22884012539185, 1, 6, 2.0, 3.0, 4.0, 5.800000000000011, 1.0912362440948382, 0.4631413525086461, 0.22402252684475368], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 323, 307, 95.04643962848297, 2.4334365325077396, 1, 20, 2.0, 3.0, 5.600000000000023, 16.75999999999999, 1.0974673308099512, 0.2862091221025843, 0.32903248634961296], "isController": false}, {"data": ["Step 7: POST /api/cart", 313, 298, 95.2076677316294, 2.04153354632588, 1, 6, 2.0, 3.0, 3.0, 4.0, 1.0980298607992816, 0.28625131991608666, 0.30037614867780366], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 290, 290, 100.0, 1.3896551724137942, 0, 4, 1.0, 2.0, 3.0, 3.0, 1.040679815117848, 0.27134913148092327, 0.22663242067507824], "isController": false}, {"data": ["Step 10: PUT /api/orders/110/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.81298828125], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 314, 105, 33.439490445859875, 2.6305732484076443, 1, 7, 2.0, 4.0, 4.0, 6.0, 1.0963725432002207, 0.387905345776347, 0.29007144534373375], "isController": false}, {"data": ["Step 10: PUT /api/orders/111/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/113/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 1: POST /api/login", 327, 311, 95.10703363914374, 1.9418960244648322, 1, 36, 2.0, 3.0, 3.0, 4.0, 1.0934699446242744, 0.3239838378788689, 0.28296173398584845], "isController": false}, {"data": ["Step 10: PUT /api/orders/112/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/106/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 8: POST /api/checkout", 309, 294, 95.14563106796116, 2.491909385113269, 1, 23, 2.0, 3.0, 5.5, 18.899999999999977, 1.0982566508503493, 0.2873510556059071, 0.310387594187059], "isController": false}, {"data": ["Step 10: PUT /api/orders/100/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/107/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/109/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/101/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/102/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.81298828125], "isController": false}, {"data": ["Step 10: PUT /api/orders/103/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.615985576923077], "isController": false}, {"data": ["Step 10: PUT /api/orders/104/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/105/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 105, 4.764065335753176, 3.324889170360988], "isController": false}, {"data": ["403/Forbidden", 1788, 81.12522686025409, 56.61811272957568], "isController": false}, {"data": ["401/Unauthorized", 311, 14.11070780399274, 9.848005066497784], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3158, 2204, "403/Forbidden", 1788, "401/Unauthorized", 311, "400/Bad Request", 105, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 9: GET /api/orders/my-orders", 305, 290, "403/Forbidden", 290, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 2: GET /api/users/me", 325, 309, "403/Forbidden", 309, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 323, 307, "403/Forbidden", 307, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 7: POST /api/cart", 313, 298, "403/Forbidden", 298, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 290, 290, "403/Forbidden", 290, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 314, 105, "400/Bad Request", 105, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 1: POST /api/login", 327, 311, "401/Unauthorized", 311, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 8: POST /api/checkout", 309, 294, "403/Forbidden", 294, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
