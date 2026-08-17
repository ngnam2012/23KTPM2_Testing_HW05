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

    var data = {"OkPercent": 28.259308647040722, "KoPercent": 71.74069135295927};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2825930864704072, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/108/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/125/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/124/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/126/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/141/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/123/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/140/cancel"], "isController": false}, {"data": [0.04559585492227979, 500, 1500, "Step 9: GET /api/orders/my-orders"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/121/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/122/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/127/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/128/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/129/cancel"], "isController": false}, {"data": [0.04573170731707317, 500, 1500, "Step 2: GET /api/users/me"], "isController": false}, {"data": [1.0, 500, 1500, "Step 4: GET /api/products"], "isController": false}, {"data": [0.046343975283213185, 500, 1500, "Step 7: POST /api/cart"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/110/cancel"], "isController": false}, {"data": [0.5, 500, 1500, "Step 6: POST /api/apply-coupon"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/112/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/107/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/109/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/101/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/103/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/105/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/116/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/117/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/114/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/115/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/118/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/119/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/137/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/99/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/135/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/139/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/98/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/136/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/138/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/130/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/131/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/132/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/133/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/134/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/3"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/2"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/1"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/5"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/4"], "isController": false}, {"data": [0.04591836734693878, 500, 1500, "Step 3: PUT /api/users/me"], "isController": false}, {"data": [0.0, 500, 1500, "Step 10: PUT /api/orders/NOT_FOUND/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/111/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/120/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/113/cancel"], "isController": false}, {"data": [0.04559270516717325, 500, 1500, "Step 1: POST /api/login"], "isController": false}, {"data": [1.0, 500, 1500, "Step 5: GET /api/products/product_id"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/106/cancel"], "isController": false}, {"data": [0.045501551189245086, 500, 1500, "Step 8: POST /api/checkout"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/100/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/102/cancel"], "isController": false}, {"data": [1.0, 500, 1500, "Step 10: PUT /api/orders/104/cancel"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9749, 6994, 71.74069135295927, 2.0870858549594735, 0, 396, 2.0, 3.0, 4.0, 6.0, 10.837147103517042, 3.641791710760779, 2.5868092416442585], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Step 10: PUT /api/orders/108/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/125/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.6015625], "isController": false}, {"data": ["Step 10: PUT /api/orders/124/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/126/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/141/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.750651041666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/123/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.615985576923077], "isController": false}, {"data": ["Step 10: PUT /api/orders/140/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 9: GET /api/orders/my-orders", 965, 921, 95.44041450777202, 1.802072538860103, 0, 7, 2.0, 3.0, 3.0, 5.0, 1.0962084818137308, 0.44047133556815976, 0.21694424679401617], "isController": false}, {"data": ["Step 10: PUT /api/orders/121/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/122/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.6015625], "isController": false}, {"data": ["Step 10: PUT /api/orders/127/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.81298828125], "isController": false}, {"data": ["Step 10: PUT /api/orders/128/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/129/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 2: GET /api/users/me", 984, 939, 95.42682926829268, 1.8089430894308942, 0, 6, 2.0, 3.0, 3.75, 5.0, 1.0972590824951494, 0.29521637483552265, 0.20859787935725596], "isController": false}, {"data": ["Step 4: GET /api/products", 979, 0, 0.0, 3.028600612870273, 1, 396, 2.0, 4.0, 4.0, 6.0, 1.0966140501014845, 0.43032838459173245, 0.22582572993722752], "isController": false}, {"data": ["Step 7: POST /api/cart", 971, 926, 95.36560247167868, 1.9443872296601457, 0, 7, 2.0, 3.0, 3.3999999999999773, 5.0, 1.0970350678387957, 0.5303282073870793, 0.3009447575479063], "isController": false}, {"data": ["Step 10: PUT /api/orders/110/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 974, 487, 50.0, 2.5975359342915834, 1, 9, 2.0, 4.0, 5.0, 6.0, 1.0974227466215378, 0.37829646702267183, 0.2914831114920668], "isController": false}, {"data": ["Step 10: PUT /api/orders/112/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/107/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/109/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/101/cancel", 1, 0, 0.0, 7.0, 7, 7, 7.0, 7.0, 7.0, 7.0, 142.85714285714286, 39.0625, 47.57254464285714], "isController": false}, {"data": ["Step 10: PUT /api/orders/103/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.615985576923077], "isController": false}, {"data": ["Step 10: PUT /api/orders/105/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/116/cancel", 1, 0, 0.0, 12.0, 12, 12, 12.0, 12.0, 12.0, 12.0, 83.33333333333333, 22.786458333333332, 27.750651041666668], "isController": false}, {"data": ["Step 10: PUT /api/orders/117/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/114/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/115/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/118/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.6015625], "isController": false}, {"data": ["Step 10: PUT /api/orders/119/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.6015625], "isController": false}, {"data": ["Step 10: PUT /api/orders/137/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/99/cancel", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 13.671875, 16.6015625], "isController": false}, {"data": ["Step 10: PUT /api/orders/135/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/139/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 10: PUT /api/orders/98/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.751953125], "isController": false}, {"data": ["Step 10: PUT /api/orders/136/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/138/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.615985576923077], "isController": false}, {"data": ["Step 10: PUT /api/orders/130/cancel", 1, 0, 0.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 34.1796875, 41.6259765625], "isController": false}, {"data": ["Step 10: PUT /api/orders/131/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.615985576923077], "isController": false}, {"data": ["Step 10: PUT /api/orders/132/cancel", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 13.671875, 16.650390625], "isController": false}, {"data": ["Step 10: PUT /api/orders/133/cancel", 1, 0, 0.0, 19.0, 19, 19, 19.0, 19.0, 19.0, 19.0, 52.63157894736842, 14.391447368421053, 17.526726973684212], "isController": false}, {"data": ["Step 10: PUT /api/orders/134/cancel", 1, 0, 0.0, 14.0, 14, 14, 14.0, 14.0, 14.0, 14.0, 71.42857142857143, 19.53125, 23.78627232142857], "isController": false}, {"data": ["Step 5: GET /api/products/3", 163, 0, 0.0, 2.2576687116564425, 1, 7, 2.0, 4.0, 4.0, 6.359999999999985, 0.1839737425451131, 0.07545798034076903, 0.036365544045909914], "isController": false}, {"data": ["Step 5: GET /api/products/2", 163, 0, 0.0, 2.25153374233129, 1, 6, 2.0, 4.0, 4.0, 5.359999999999985, 0.18401154192640892, 0.08122384467845395, 0.034322465339789165], "isController": false}, {"data": ["Step 5: GET /api/products/1", 163, 0, 0.0, 2.1717791411042953, 1, 7, 2.0, 4.0, 4.0, 7.0, 0.1842247134627578, 0.07610063847143217, 0.03641515272285257], "isController": false}, {"data": ["Step 5: GET /api/products/5", 162, 0, 0.0, 2.203703703703703, 0, 6, 2.0, 4.0, 4.0, 5.3700000000000045, 0.18392391453668772, 0.07885019382969327, 0.036368346382091715], "isController": false}, {"data": ["Step 5: GET /api/products/4", 163, 0, 0.0, 2.202453987730062, 1, 5, 2.0, 3.0, 4.0, 5.0, 0.18461761501224366, 0.07806584697295069, 0.0344355121751353], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 980, 935, 95.40816326530613, 1.9193877551020417, 0, 7, 2.0, 3.0, 4.0, 5.0, 1.0975079849305434, 0.2862158474133529, 0.32634873267225273], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 921, 921, 100.0, 1.22258414766558, 0, 5, 1.0, 2.0, 2.0, 3.0, 1.0462259189123793, 0.2727952347164114, 0.22784021476314512], "isController": false}, {"data": ["Step 10: PUT /api/orders/111/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/120/cancel", 1, 0, 0.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 54.6875, 66.6015625], "isController": false}, {"data": ["Step 10: PUT /api/orders/113/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}, {"data": ["Step 1: POST /api/login", 987, 942, 95.44072948328268, 1.513677811550151, 0, 33, 1.0, 2.0, 3.0, 5.0, 1.0974312104099189, 0.3236108655696802, 0.28322574275356277], "isController": false}, {"data": ["Step 5: GET /api/products/product_id", 163, 0, 0.0, 2.2147239263803695, 1, 8, 2.0, 3.0, 4.0, 7.359999999999985, 0.18364707313885523, 0.04286293992205703, 0.03586856897243266], "isController": false}, {"data": ["Step 10: PUT /api/orders/106/cancel", 1, 0, 0.0, 13.0, 13, 13, 13.0, 13.0, 13.0, 13.0, 76.92307692307693, 21.033653846153847, 25.615985576923077], "isController": false}, {"data": ["Step 8: POST /api/checkout", 967, 923, 95.44984488107549, 2.365046535677354, 1, 20, 2.0, 3.0, 5.0, 16.0, 1.0970846139271886, 0.286980258645923, 0.3084564415856333], "isController": false}, {"data": ["Step 10: PUT /api/orders/100/cancel", 1, 0, 0.0, 15.0, 15, 15, 15.0, 15.0, 15.0, 15.0, 66.66666666666667, 18.229166666666668, 22.200520833333336], "isController": false}, {"data": ["Step 10: PUT /api/orders/102/cancel", 1, 0, 0.0, 16.0, 16, 16, 16.0, 16.0, 16.0, 16.0, 62.5, 17.08984375, 20.81298828125], "isController": false}, {"data": ["Step 10: PUT /api/orders/104/cancel", 1, 0, 0.0, 6.0, 6, 6, 6.0, 6.0, 6.0, 6.0, 166.66666666666666, 45.572916666666664, 55.501302083333336], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 405, 5.790677723763226, 4.154272233049544], "isController": false}, {"data": ["403/Forbidden", 5403, 77.25193022590793, 55.42106882757206], "isController": false}, {"data": ["401/Unauthorized", 942, 13.468687446382614, 9.662529490204124], "isController": false}, {"data": ["404/Not Found", 244, 3.4887046039462395, 2.5028208021335523], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9749, 6994, "403/Forbidden", 5403, "401/Unauthorized", 942, "400/Bad Request", 405, "404/Not Found", 244, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 9: GET /api/orders/my-orders", 965, 921, "403/Forbidden", 921, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 2: GET /api/users/me", 984, 939, "403/Forbidden", 939, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 7: POST /api/cart", 971, 926, "403/Forbidden", 764, "400/Bad Request", 162, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 6: POST /api/apply-coupon", 974, 487, "404/Not Found", 244, "400/Bad Request", 243, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 3: PUT /api/users/me", 980, 935, "403/Forbidden", 935, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Step 10: PUT /api/orders/NOT_FOUND/cancel", 921, 921, "403/Forbidden", 921, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 1: POST /api/login", 987, 942, "401/Unauthorized", 942, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Step 8: POST /api/checkout", 967, 923, "403/Forbidden", 923, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
