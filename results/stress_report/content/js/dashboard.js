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

    var data = {"OkPercent": 30.22522192062211, "KoPercent": 69.77477807937788};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.30225221920622114, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/125/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/142/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/124/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/126/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/141/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/123/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/140/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/143/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/144/cancel"], "isController": false}, {"data": [0.047872340425531915, 500, 1500, "Step 9: GET /api/orders/my-orders"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/121/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/145/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/146/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/122/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/127/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/128/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/129/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/149/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/166/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/147/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/148/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/169/cancel"], "isController": false}, {"data": [0.04768683274021352, 500, 1500, "Step 2: GET /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/164/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/168/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/163/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/165/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/167/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/160/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/161/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/162/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 4: GET /api/products"], "isController": false}, {"data": [0.04779686333084392, 500, 1500, "Step 7: POST /api/cart"], "isController": false}, {"data": [0.6671575846833578, 500, 1500, "Step 6: POST /api/apply-coupon"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/150/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/116/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/117/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/151/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/152/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/115/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/118/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/119/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/137/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/135/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/139/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/136/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/138/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/130/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/131/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/132/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/133/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/134/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/3"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/2"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/174/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/175/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/1"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/156/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/157/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/158/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/159/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/176/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/172/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/173/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/5"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/177/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/4"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/154/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/171/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/153/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/170/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/155/cancel"], "isController": false}, {"data": [0.047959914101646385, 500, 1500, "Step 3: PUT /api/users/me"], "isController": false}, {"data": [0.0, 500, 1500, "Step 10: PUT /api/orders/NOT_FOUND/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/120/cancel"], "isController": false}, {"data": [0.0480225988700565, 500, 1500, "Step 1: POST /api/login"], "isController": false}, {"data": [0.048265460030165915, 500, 1500, "Step 8: POST /api/checkout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 13631, 9511, 69.77477807937788, 2.257648008216557, 0, 45, 2.0, 3.0, 4.0, 11.0, 45.516624203183596, 14.992577194980848, 10.869856433217686], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step 10: PUT /api/orders/125/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/142/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/124/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/126/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/141/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/123/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/140/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.81298828125], "isController": false}, {"data": ["Step 10: PUT /api/orders/143/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/144/cancel", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 14.391447368421053, 17.526726973684212], "isController": false}, {"data": ["Step 9: GET /api/orders/my-orders", 1316, 1253, 95.2127659574468, 1.8548632218844971, 0, 11, 2.0, 3.0, 3.0, 5.0, 4.717319300861735, 2.287594470726453, 0.9348776490113704], "isController": false}, {"data": ["Step 10: PUT /api/orders/121/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/145/cancel", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 14.391447368421053, 17.526726973684212], "isController": false}, {"data": ["Step 10: PUT /api/orders/146/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/122/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/127/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/128/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.750651041666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/129/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/149/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/166/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.81298828125], "isController": false}, {"data": ["Step 10: PUT /api/orders/147/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/148/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/169/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 2: GET /api/users/me", 1405, 1338, 95.23131672597864, 1.9373665480427054, 0, 7, 2.0, 3.0, 4.0, 5.0, 4.742471958657796, 1.2788838798990072, 0.9027053028346818], "isController": false}, {"data": ["Step 10: PUT /api/orders/164/cancel", 1, 0, 0.0, 10.0, 10, 10, 10.0, 10.0, 10.0, 10.0, 100.0, 27.34375, 33.30078125], "isController": false}, {"data": ["Step 10: PUT /api/orders/168/cancel", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 13.671875, 16.650390625], "isController": false}, {"data": ["Step 10: PUT /api/orders/163/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/165/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/167/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/160/cancel", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 13.671875, 16.650390625], "isController": false}, {"data": ["Step 10: PUT /api/orders/161/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.2734375], "isController": false}, {"data": ["Step 10: PUT /api/orders/162/cancel", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 13.671875, 16.650390625], "isController": false}, {"data": ["Step 4: GET /api/products", 1386, 0, 0.0, 2.56709956709957, 0, 18, 2.0, 4.0, 5.0, 7.0, 4.743651173933877, 2.0132401794270653, 0.9723745582774317], "isController": false}, {"data": ["Step 7: POST /api/cart", 1339, 1275, 95.22031366691562, 1.9671396564600458, 1, 7, 2.0, 3.0, 3.0, 5.0, 4.710857488645039, 1.2280993996647163, 1.2886576331987039], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 1358, 452, 33.284241531664215, 2.9374079528718724, 1, 18, 3.0, 4.0, 5.0, 7.410000000000082, 4.735155566248592, 1.6755314628074103, 1.2528518699157225], "isController": false}, {"data": ["Step 10: PUT /api/orders/150/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/116/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/117/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/151/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/152/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/115/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/118/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/119/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.2734375], "isController": false}, {"data": ["Step 10: PUT /api/orders/137/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/135/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/139/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/136/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/138/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.2734375], "isController": false}, {"data": ["Step 10: PUT /api/orders/130/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/131/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/132/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/133/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.750651041666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/134/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.2734375], "isController": false}, {"data": ["Step 5: GET /api/products/3", 274, 0, 0.0, 2.459854014598539, 1, 8, 2.0, 4.0, 4.0, 7.0, 0.9530434782608695, 0.39089673913043477, 0.18324048913043478], "isController": false}, {"data": ["Step 5: GET /api/products/2", 275, 0, 0.0, 2.4836363636363643, 0, 6, 2.0, 4.0, 4.0, 5.240000000000009, 0.9549804836715701, 0.421534354120654, 0.18359296322630606], "isController": false}, {"data": ["Step 10: PUT /api/orders/174/cancel", 1, 0, 0.0, 17.0, 17, 17, 17.0, 17.0, 17.0, 17.0, 58.8235294117647, 16.08455882352941, 19.588694852941174], "isController": false}, {"data": ["Step 10: PUT /api/orders/175/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 5: GET /api/products/1", 275, 0, 0.0, 2.530909090909091, 1, 15, 2.0, 4.0, 5.0, 7.960000000000036, 0.9509286250263667, 0.39281524256460265, 0.18323273481021196], "isController": false}, {"data": ["Step 10: PUT /api/orders/156/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/157/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.6015625], "isController": false}, {"data": ["Step 10: PUT /api/orders/158/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/159/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/176/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/172/cancel", 1, 0, 0.0, 18.0, 18, 18, 18.0, 18.0, 18.0, 18.0, 55.55555555555555, 15.190972222222223, 18.50043402777778], "isController": false}, {"data": ["Step 10: PUT /api/orders/173/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 5: GET /api/products/5", 274, 0, 0.0, 2.478102189781021, 1, 17, 2.0, 4.0, 5.0, 9.25, 0.9600325149698501, 0.4115764395232072, 0.18458426256188532], "isController": false}, {"data": ["Step 10: PUT /api/orders/177/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 5: GET /api/products/4", 274, 0, 0.0, 2.3905109489051104, 1, 7, 2.0, 4.0, 4.0, 6.0, 0.9525233177012902, 0.40277597320767444, 0.18314047850391266], "isController": false}, {"data": ["Step 10: PUT /api/orders/154/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/171/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/153/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.615985576923077], "isController": false}, {"data": ["Step 10: PUT /api/orders/170/cancel", 1, 0, 0.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 30.381944444444446, 37.00086805555556], "isController": false}, {"data": ["Step 10: PUT /api/orders/155/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 1397, 1330, 95.20400858983537, 2.4910522548317817, 0, 23, 2.0, 3.0, 5.0, 17.0, 4.745389634873348, 1.2375455283109877, 1.421953631607284], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 1253, 1253, 100.0, 1.3798882681564246, 0, 5, 1.0, 2.0, 3.0, 3.0, 4.491506285599579, 1.1711251740772337, 0.978130763367877], "isController": false}, {"data": ["Step 10: PUT /api/orders/120/cancel", 1, 0, 0.0, 11.0, 11, 11, 11.0, 11.0, 11.0, 11.0, 90.9090909090909, 24.857954545454547, 30.2734375], "isController": false}, {"data": ["Step 1: POST /api/login", 1416, 1348, 95.19774011299435, 1.9244350282485851, 0, 45, 2.0, 3.0, 4.0, 5.0, 4.7324463338580465, 1.4006922842492422, 1.223886138251936], "isController": false}, {"data": ["Step 8: POST /api/checkout", 1326, 1262, 95.17345399698341, 2.541478129713428, 0, 29, 2.0, 3.0, 6.0, 18.0, 4.707486181078462, 1.2316560362149824, 1.3303353784360923], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 452, 4.752391967195878, 3.3159709485731055], "isController": false}, {"data": ["403/Forbidden", 7711, 81.07454526337925, 56.569584036387646], "isController": false}, {"data": ["401/Unauthorized", 1348, 14.173062769424876, 9.889223094417137], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 13631, 9511, "403/Forbidden", 7711, "401/Unauthorized", 1348, "400/Bad Request", 452, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 9: GET /api/orders/my-orders", 1316, 1253, "403/Forbidden", 1253, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 2: GET /api/users/me", 1405, 1338, "403/Forbidden", 1338, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 7: POST /api/cart", 1339, 1275, "403/Forbidden", 1275, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 1358, 452, "400/Bad Request", 452, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 1397, 1330, "403/Forbidden", 1330, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 1253, 1253, "403/Forbidden", 1253, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 1: POST /api/login", 1416, 1348, "401/Unauthorized", 1348, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 8: POST /api/checkout", 1326, 1262, "403/Forbidden", 1262, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
